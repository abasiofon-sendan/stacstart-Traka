"""Debt extraction from free-text / transcribed voice notes.

Pure helpers + Groq LLM call. Webhook layer (Twilio) owns the
pending-state machine; this module only answers:
  1. what did we understand? (extract)
  2. what is still missing? (missing_required / missing_optional)
  3. what should we ask next? (follow-up question)
"""

from __future__ import annotations

import json
import os
import re
from datetime import date, datetime, timedelta
from typing import Optional

import httpx

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_BASE = "https://api.groq.com/openai/v1"
# llama-3.3-70b-versatile was retired by Groq; override via GROQ_CHAT_MODEL if needed.
_GROQ_MODEL = os.getenv("GROQ_CHAT_MODEL", "openai/gpt-oss-20b")

REQUIRED_FIELDS = ("name", "amount")
OPTIONAL_FIELDS = ("due_date", "items_summary")


# ─── Normalisation helpers ─────────────────────────────────────────────

def parse_amount(raw: object) -> Optional[float]:
    """Coerce '5k', '5,000', '₦5000' etc. to float. Returns None if unparseable."""
    if isinstance(raw, (int, float)):
        return float(raw) if float(raw) > 0 else None
    if not isinstance(raw, str):
        return None
    s = raw.strip().lower().replace("₦", "").replace("naira", "").replace("ngn", "").strip()
    # 5k / 2.5k shorthand
    m = re.fullmatch(r"([\d,\.]+)\s*k", s)
    if m:
        try:
            return float(m.group(1).replace(",", "")) * 1000
        except ValueError:
            return None
    try:
        val = float(s.replace(",", ""))
        return val if val > 0 else None
    except ValueError:
        return None


def parse_due_date(raw: object) -> Optional[date]:
    """Accept ISO date, 'tomorrow', 'friday', 'in 3 days', dd/mm etc. Else None."""
    if raw is None:
        return None
    if isinstance(raw, date) and not isinstance(raw, datetime):
        return raw
    if not isinstance(raw, str):
        return None
    s = raw.strip().lower()
    if not s or s in {"no date", "none", "skip", "no", "unknown"}:
        return None
    today = date.today()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s):
        try:
            return date.fromisoformat(s)
        except ValueError:
            return None
    if s in {"today"}:
        return today
    if s in {"tomorrow", "tommorrow", "tmrw"}:
        return today + timedelta(days=1)
    m = re.fullmatch(r"in\s+(\d+)\s+days?", s)
    if m:
        return today + timedelta(days=int(m.group(1)))
    # weekday name -> next occurrence
    weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    for i, wd in enumerate(weekdays):
        if s.startswith(wd):
            delta = (i - today.weekday()) % 7 or 7
            return today + timedelta(days=delta)
    m = re.fullmatch(r"(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?", s)
    if m:
        d, mo = int(m.group(1)), int(m.group(2))
        y = int(m.group(3)) if m.group(3) else today.year
        if y < 100:
            y += 2000
        try:
            parsed = date(y, mo, d)
            if parsed < today and not m.group(3):
                parsed = date(y + 1, mo, d)
            return parsed
        except ValueError:
            return None
    return None


def missing_fields(draft: dict) -> tuple[list[str], list[str]]:
    """Split missing into (required, optional)."""
    missing_req: list[str] = []
    if not (draft.get("name") or "").strip():
        missing_req.append("name")
    if parse_amount(draft.get("amount")) is None:
        missing_req.append("amount")
    missing_opt: list[str] = []
    if not (draft.get("items_summary") or "").strip():
        missing_opt.append("items_summary")
    if parse_due_date(draft.get("due_date")) is None:
        missing_opt.append("due_date")
    return missing_req, missing_opt


FOLLOWUP_QUESTIONS = {
    "name": "Who dey owe you? Abeg send the name. (e.g. 'Mama Ngozi')",
    "amount": "How much be the amount? (e.g. '5000' or '5k')",
    "items_summary": "Wetin she buy/collect? (e.g. '2 bags of rice'). Reply 'skip' if none.",
    "due_date": "When she talk say she go pay? (e.g. 'Friday', 'tomorrow', or 'no date')",
}


def followup_question(field: str, transcript: str = "") -> str:
    base = FOLLOWUP_QUESTIONS.get(field, f"Abeg provide {field}.")
    if transcript:
        return f"I hear: '{transcript}'. {base}"
    return base


def confirmation_message(name: str, amount: float, items_summary: str = "") -> str:
    items = f" ({items_summary})" if items_summary else ""
    return f"Recorded: {name} — ₦{amount:,.0f}{items}. Reply YES to keep, EDIT <correction> to fix, or CANCEL."


# ─── LLM extraction ────────────────────────────────────────────────────

_EXTRACT_SYSTEM = """You extract a debt record from a Nigerian shop owner's message.
The message may be in English, Nigerian Pidgin, Yoruba or Hausa (transcribed from voice).

Return ONLY valid JSON with exactly these keys:
{"name": string|null, "amount": number|string|null, "items_summary": string|null, "due_date": string|null, "confidence": number}

Rules:
- name: person owing. null if not mentioned.
- amount: number in naira. Convert '5k'->5000, 'five thousand'->5000. null if not mentioned.
- items_summary: what was bought/collected, e.g. '2 bags of rice'. null if not mentioned.
- due_date: when they will pay. Keep raw phrase ('Friday', 'tomorrow', '12/10') or ISO date. null if not mentioned.
- confidence: 0-1 how sure you are about name+amount.
- Never invent values. Use null when unsure.

Examples:
IN: "Mama Ngozi dey owe me five thousand for rice, she go pay Friday"
OUT: {"name":"Mama Ngozi","amount":5000,"items_summary":"rice","due_date":"Friday","confidence":0.9}
IN: "Somebody owe me money"
OUT: {"name":null,"amount":null,"items_summary":null,"due_date":null,"confidence":0.2}
"""


def _coerce_debt_json(data: dict) -> dict:
    return {
        "name": (data.get("name") or None),
        "amount": data.get("amount"),
        "items_summary": data.get("items_summary") or None,
        "due_date": data.get("due_date") or None,
        "confidence": float(data.get("confidence") or 0.0),
    }


def _parse_json_safely(content: str) -> dict:
    """Extract JSON from model output (tolerates fences / prose around it)."""
    text = content.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL | re.IGNORECASE)
    if fence:
        text = fence.group(1).strip()
    if not text.startswith("{"):
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end > start:
            text = text[start:end + 1]
    return json.loads(text)


def groq_extract_debt(transcript: str) -> dict:
    """Call Groq LLM to extract debt JSON. Raises RuntimeError on failure."""
    if not transcript or not transcript.strip():
        return {"name": None, "amount": None, "items_summary": None,
                "due_date": None, "confidence": 0.0}
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set")
    last_err: Exception | None = None
    # Plain guided generation first (gpt-oss rejects strict JSON mode and it
    # costs an extra failed call); strict mode only as fallback.
    for use_json_mode in (False, True):
        try:
            content = _groq_chat(transcript, use_json_mode=use_json_mode)
            return _coerce_debt_json(_parse_json_safely(content))
        except RuntimeError as exc:
            last_err = exc
            continue
        except (json.JSONDecodeError, ValueError, AttributeError) as exc:
            last_err = exc
            continue
    raise RuntimeError(f"Groq LLM extraction failed: {last_err}")


def _groq_chat(transcript: str, use_json_mode: bool) -> str:
    body: dict = {
        "model": _GROQ_MODEL,
        "messages": [
            {"role": "system", "content": _EXTRACT_SYSTEM},
            {"role": "user", "content": transcript.strip()},
        ],
        "temperature": 0.1,
        "max_tokens": 512,
    }
    if use_json_mode:
        body["response_format"] = {"type": "json_object"}
    resp = httpx.post(
        f"{GROQ_BASE}/chat/completions",
        headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
        json=body,
        timeout=30,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Groq LLM error {resp.status_code}: {resp.text}")
    try:
        return resp.json()["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        raise RuntimeError(f"Groq LLM returned unexpected shape: {exc}")


def merge_drafts(base: dict, update: dict) -> dict:
    """Merge a follow-up extraction into the pending draft (non-null wins)."""
    merged = dict(base)
    for key in ("name", "amount", "items_summary", "due_date"):
        val = update.get(key)
        if val is None:
            continue
        if isinstance(val, str) and not val.strip():
            continue
        merged[key] = val
    # keep best confidence
    try:
        merged["confidence"] = max(float(base.get("confidence") or 0),
                                   float(update.get("confidence") or 0))
    except (TypeError, ValueError):
        pass
    return merged


def normalise_draft(raw: dict) -> dict:
    """Return draft with typed amount/due_date + missing lists."""
    amount = parse_amount(raw.get("amount"))
    due = parse_due_date(raw.get("due_date"))
    draft = {
        "name": (raw.get("name") or "").strip() if isinstance(raw.get("name"), str) else raw.get("name"),
        "amount": amount,
        "items_summary": (raw.get("items_summary") or "").strip() if isinstance(raw.get("items_summary"), str) else None,
        "due_date": due.isoformat() if due else None,
        "confidence": raw.get("confidence", 0.0),
    }
    req, opt = missing_fields({"name": draft["name"], "amount": draft["amount"],
                               "items_summary": draft["items_summary"], "due_date": draft["due_date"]})
    draft["missing_required"] = req
    draft["missing_optional"] = opt
    return draft
