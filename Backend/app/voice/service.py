import os
import httpx
from sqlalchemy.orm import Session

from app.reports.service import get_dashboard
from app.debtors import models as debtor_models

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_BASE    = "https://api.groq.com/openai/v1"

# ─── Language map ─────────────────────────────────────────────────────────────
# Whisper returns BCP-47 codes. We map them to human instructions for the LLM.
_LANG_INSTRUCTIONS = {
    "yo": "Reply ONLY in Yoruba language.",
    "ha": "Reply ONLY in Hausa language.",
    "en": "Reply in clear, friendly English.",
}
# Anything else (including "en-NG", "pcm", unknown) → Pidgin
_PIDGIN_INSTRUCTION = "Reply ONLY in Nigerian Pidgin English (broken English)."


def _lang_instruction(whisper_lang: str) -> str:
    return _LANG_INSTRUCTIONS.get(whisper_lang.lower(), _PIDGIN_INSTRUCTION)


# ─── Step 1: Transcribe with Groq Whisper ─────────────────────────────────────

def groq_transcribe(audio_bytes: bytes, filename: str) -> dict:
    """
    Sends audio bytes to Groq Whisper.
    Returns { "text": str, "language": str } where language is a BCP-47 code.
    """
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}

    files = {
        "file":            (filename, audio_bytes, "audio/webm"),
        "model":           (None, "whisper-large-v3"),
        "response_format": (None, "verbose_json"),  # includes language field
    }

    resp = httpx.post(
        f"{GROQ_BASE}/audio/transcriptions",
        headers=headers,
        files=files,
        timeout=30,
    )

    if resp.status_code != 200:
        raise RuntimeError(f"Groq Whisper error {resp.status_code}: {resp.text}")

    data = resp.json()
    return {
        "text":     data.get("text", "").strip(),
        "language": data.get("language", "en"),
    }


# ─── Step 2: Build business context ──────────────────────────────────────────

def _build_context(db: Session, account_id: str) -> str:
    dash = get_dashboard(db, account_id)

    unpaid = (
        db.query(debtor_models.Debtor)
        .filter(
            debtor_models.Debtor.account_id == account_id,
            debtor_models.Debtor.status == "Unpaid",
        )
        .all()
    )
    debtor_lines = "\n".join(
        f"  - {d.name}: ₦{d.amount:,.0f}" for d in unpaid
    ) or "  None"

    return f"""
MERCHANT BUSINESS FACTS (live data):
- Total Revenue (all-time): ₦{dash['total_revenue']:,.0f}
- Net Profit (all-time):    ₦{dash['total_profit']:,.0f}
- Revenue Today:            ₦{dash['today_revenue']:,.0f}
- Profit Today:             ₦{dash['today_profit']:,.0f}
- Total Debt Outstanding:   ₦{dash['total_debt_outstanding']:,.0f}
- Number of Unpaid Debtors: {dash['unpaid_debtor_count']}
- Low Stock Items Count:    {dash['low_stock_count']}

UNPAID DEBTORS:
{debtor_lines}
""".strip()


# ─── Step 3: LLM answer with Groq ─────────────────────────────────────────────

def groq_advise(transcript: str, language: str, db: Session, account_id: str) -> str:
    """
    Sends the transcribed question + live business context to Groq LLM.
    Returns the advisor reply string.
    """
    context      = _build_context(db, account_id)
    lang_instr   = _lang_instruction(language)

    system_prompt = f"""You are Traka, a friendly business advisor for a Nigerian small shop owner.
{lang_instr}
Keep answers SHORT (2-4 sentences max). Use ₦ for naira amounts.
Never make up data — only use the facts below.

{context}"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json",
    }
    body = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system",  "content": system_prompt},
            {"role": "user",    "content": transcript},
        ],
        "temperature": 0.4,
        "max_tokens":  256,
    }

    resp = httpx.post(
        f"{GROQ_BASE}/chat/completions",
        headers=headers,
        json=body,
        timeout=30,
    )

    if resp.status_code != 200:
        raise RuntimeError(f"Groq LLM error {resp.status_code}: {resp.text}")

    return resp.json()["choices"][0]["message"]["content"].strip()


# ─── Public entry point ───────────────────────────────────────────────────────

def handle_voice_question(
    audio_bytes: bytes,
    filename: str,
    db: Session,
    account_id: str,
) -> dict:
    transcription = groq_transcribe(audio_bytes, filename)
    transcript    = transcription["text"]
    language      = transcription["language"]

    reply = groq_advise(transcript, language, db, account_id)

    return {
        "transcript":        transcript,
        "language_detected": language,
        "reply":             reply,
    }
