"""Twilio WhatsApp webhook: voice-note / text -> debtor record.

Local-first design (no Meta verification needed):
  Twilio sandbox POSTs form-encoded `From, Body, NumMedia, MediaUrl0,
  MediaContentType0, MessageSid` to /webhooks/whatsapp-twilio.

Replies go back as TwiML <Message> in the webhook response (works on
Twilio trial accounts — REST freeform sends fail there with 21654).

State machine lives in _PENDING (in-memory, keyed by sender):
  - missing REQUIRED (name/amount) -> store draft, ask follow-up, do NOT create.
  - required complete -> create debtor immediately, then ask follow-ups for
    OPTIONAL fields (due_date, items_summary) and patch the record on reply.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import logging
import os
from datetime import date
from typing import Optional
from xml.sax.saxutils import escape as xml_escape

import httpx
from fastapi import APIRouter, Request, Response
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.voice import debt_parse
from app.voice.service import groq_transcribe

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
TWILIO_SKIP_SIGNATURE = os.getenv("TWILIO_SKIP_SIGNATURE", "true").lower() in {"1", "true", "yes"}

MAX_BYTES = 25 * 1024 * 1024

# sender ("whatsapp:+234...") -> {"draft": {...}, "awaiting": field|None, "debtor_id": str|None}
_PENDING: dict[str, dict] = {}
# MessageSid -> reply already sent (Twilio retries reuse the same SID)
_REPLIES: dict[str, str] = {}


# ─── Helpers ─────────────────────────────────────────────────────────────

def normalize_sender(raw: str) -> str:
    s = (raw or "").strip().replace(" ", "")
    if s.startswith("whatsapp:"):
        s = s[len("whatsapp:"):]
    return s


def candidate_phones(sender: str) -> list[str]:
    """Return E164 + local variants so +234803... matches 0803... accounts."""
    out = [sender]
    if sender.startswith("+234"):
        out.append("0" + sender[4:])
    elif sender.startswith("234"):
        out.append("0" + sender[3:])
        out.append("+" + sender)
    elif sender.startswith("0"):
        out.append("+234" + sender[1:])
    return list(dict.fromkeys(out))


def find_account(db: Session, sender: str):
    from app.accounts import models as acct_models
    for variant in candidate_phones(sender):
        acc = db.query(acct_models.Account).filter(
            acct_models.Account.phone_number == variant).first()
        if acc:
            return acc
    return None


def verify_twilio_signature(url: str, params: dict, signature: str) -> bool:
    if TWILIO_SKIP_SIGNATURE or not TWILIO_AUTH_TOKEN:
        return True
    if not signature:
        return False
    base = url + "".join(f"{k}{params[k]}" for k in sorted(params))
    digest = hmac.new(TWILIO_AUTH_TOKEN.encode(), base.encode(), hashlib.sha1).digest()
    expected = base64.b64encode(digest).decode()
    return hmac.compare_digest(expected, signature)


def twiml_reply(body: str) -> Response:
    return Response(
        content=f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{xml_escape(body)}</Message></Response>',
        media_type="application/xml",
    )


def twiml_empty() -> Response:
    return Response(
        content='<?xml version="1.0" encoding="UTF-8"?><Response/>',
        media_type="application/xml",
    )


def download_twilio_media(url: str) -> tuple[bytes, str]:
    """Download a Twilio media URL, re-applying basic auth on every redirect hop.

    Twilio media URLs 307-redirect cross-host; stock HTTP clients drop the
    Authorization header on redirect which Twilio rejects with 401.
    """
    import re as _re
    m = _re.search(r"/Accounts/(AC[0-9a-fA-F]+)/", url)
    if m and TWILIO_ACCOUNT_SID and m.group(1) != TWILIO_ACCOUNT_SID:
        raise RuntimeError(
            f"Twilio credential mismatch: media belongs to {m.group(1)} "
            f"but TWILIO_ACCOUNT_SID is {TWILIO_ACCOUNT_SID}. Copy the SID + "
            "Auth Token from the same Twilio project that owns the WhatsApp sandbox number."
        )
    auth = None
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        auth = (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    current = url
    resp = None
    for _ in range(5):
        resp = httpx.get(current, auth=auth, timeout=30, follow_redirects=False)
        if resp.status_code in (301, 302, 303, 307, 308) and resp.headers.get("location"):
            current = resp.headers["location"]
            continue
        break
    assert resp is not None
    try:
        resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        # Twilio trial accounts block per-message media fetch entirely
        # (error 20003) — no credential can fix that, only an upgrade
        # (or moving inbound to Meta Cloud API direct, which is free).
        if resp.status_code == 401:
            raise RuntimeError(
                "Twilio refused the voice-note download (HTTP 401 — on trial "
                f"accounts this is error 20003 'feature not available': {resp.text[:160]}). "
                "Upgrade the Twilio account or switch inbound to Meta Cloud API direct."
            ) from exc
        raise
    ctype = resp.headers.get("content-type", "audio/ogg")
    ext = ".ogg"
    if "mpeg" in ctype or "mp3" in ctype:
        ext = ".mp3"
    elif "mp4" in ctype or "m4a" in ctype:
        ext = ".m4a"
    elif "wav" in ctype:
        ext = ".wav"
    return resp.content, ext


def _create_debtor(db: Session, account_id: str, draft: dict):
    from app.debtors import schemas as debtor_schemas
    from app.debtors.service import create_debtor
    amount = float(draft["amount"])
    items_summary = (draft.get("items_summary") or "").strip() or "Goods (via WhatsApp)"
    due: Optional[date] = None
    if draft.get("due_date"):
        try:
            due = date.fromisoformat(draft["due_date"])
        except ValueError:
            due = None
    debtor_in = debtor_schemas.DebtorCreate(
        name=draft["name"].strip(),
        amount=amount,
        items_summary=items_summary,
        due_date=due,
        items=[debtor_schemas.DebtorItemCreate(
            product_name=items_summary[:120], qty=1, price=amount)],
    )
    debtor = create_debtor(db=db, debtor_in=debtor_in, account_id=account_id)
    return debtor


# ─── Core state machine (sync, testable) ─────────────────────────────────

def handle_text_message(
    db: Session,
    sender_key: str,
    account_id: str,
    text: str,
    transcript: str = "",
) -> str:
    """Advance the pending state with new text. Returns reply string.

    `text` is the raw user message (or transcribed voice). `transcript`
    is shown back in follow-up prompts when available.
    """
    from app.debtors import models as debtor_models

    raw = (text or "").strip()
    upper = raw.upper()
    pending = _PENDING.get(sender_key)

    # — Commands —
    if upper in {"CANCEL", "STOP"}:
        _PENDING.pop(sender_key, None)
        return "Cancelled. No record was created. Send a new voice note anytime."
    if upper in {"SKIP", "NO DATE", "NONE", "NO"} and pending and pending.get("awaiting") in {"due_date", "items_summary"}:
        _PENDING.pop(sender_key, None)
        return "Okay, saved without that detail. Send YES to view or send another voice note."

    # — Pending: awaiting optional patch after record was created —
    if pending and pending.get("debtor_id") and pending.get("awaiting") in {"due_date", "items_summary"}:
        field = pending["awaiting"]
        debtor = db.query(debtor_models.Debtor).filter(
            debtor_models.Debtor.id == pending["debtor_id"]).first()
        if not debtor:
            _PENDING.pop(sender_key, None)
        else:
            if field == "due_date":
                parsed = debt_parse.parse_due_date(raw)
                if parsed is None:
                    return "I no hear the date well. Try e.g. 'Friday', 'tomorrow', or reply 'no date'."
                debtor.due_date = parsed
                db.commit()
                _PENDING.pop(sender_key, None)
                logger.info("whatsapp debt due_date patched debtor_id=%s due=%s", debtor.id, parsed)
                return f"Updated: {debtor.name} go pay on {parsed.isoformat()}. Anything else?"
            else:  # items_summary
                if len(raw) < 2:
                    return "Wetin she buy? Reply the item (e.g. '2 bags of rice') or 'skip'."
                debtor.items_summary = raw
                db.commit()
                _PENDING.pop(sender_key, None)
                logger.info("whatsapp debt items patched debtor_id=%s", debtor.id)
                return f"Updated: items set to '{raw}'. Anything else?"

    # — Fresh or pending-required: extract + merge —
    try:
        extracted = debt_parse.groq_extract_debt(raw)
    except RuntimeError as exc:
        logger.warning("whatsapp extract failed sender=%s err=%s", sender_key, exc)
        # Fallback: treat raw as-is so user can still answer single-field follow-ups
        extracted = {"name": None, "amount": None, "items_summary": None,
                     "due_date": None, "confidence": 0.0}
        if pending and pending.get("awaiting") == "name" and len(raw) >= 2 and not raw[0].isdigit():
            extracted["name"] = raw
        elif pending and pending.get("awaiting") == "amount":
            extracted["amount"] = raw
        elif pending and pending.get("awaiting") == "due_date":
            extracted["due_date"] = raw
        elif pending and pending.get("awaiting") == "items_summary":
            extracted["items_summary"] = raw

    base = (pending or {}).get("draft", {})
    merged_raw = debt_parse.merge_drafts(base, extracted)

    # Single-field shortcut: if we are awaiting exactly one required field and
    # the LLM missed it, accept the raw reply directly (voice transcripts vary).
    awaiting = (pending or {}).get("awaiting")
    if awaiting in {"name", "amount"}:
        if awaiting == "name" and not (merged_raw.get("name") or "").strip():
            if len(raw) >= 2:
                merged_raw["name"] = raw
        if awaiting == "amount" and debt_parse.parse_amount(merged_raw.get("amount")) is None:
            if debt_parse.parse_amount(raw) is not None:
                merged_raw["amount"] = raw

    draft = debt_parse.normalise_draft(merged_raw)
    req, opt = draft["missing_required"], draft["missing_optional"]
    shown = transcript or raw
    logger.info("whatsapp draft sender=%s draft=%s missing_req=%s missing_opt=%s",
                sender_key, {k: draft.get(k) for k in ("name", "amount", "items_summary", "due_date")}, req, opt)

    # — Still missing required info -> ask follow-up, don't create —
    if req:
        _PENDING[sender_key] = {"draft": merged_raw, "awaiting": req[0], "debtor_id": None}
        return debt_parse.followup_question(req[0], transcript=shown if len(shown) < 200 else "")

    # — Required complete -> create record —
    debtor = _create_debtor(db, account_id, draft)
    logger.info("whatsapp debt created debtor_id=%s account=%s name=%s amount=%s",
                debtor.id, account_id, debtor.name, debtor.amount)
    reply = f"Recorded: {debtor.name} — ₦{debtor.amount:,.0f} ({debtor.items_summary})."

    # — Follow up on missing OPTIONAL info (e.g. dateline) —
    if "due_date" in opt:
        _PENDING[sender_key] = {"draft": merged_raw, "awaiting": "due_date",
                                "debtor_id": debtor.id}
        return reply + " " + debt_parse.FOLLOWUP_QUESTIONS["due_date"]
    if "items_summary" in opt or not (draft.get("items_summary") or "").strip():
        _PENDING[sender_key] = {"draft": merged_raw, "awaiting": "items_summary",
                                "debtor_id": debtor.id}
        return reply + " " + debt_parse.FOLLOWUP_QUESTIONS["items_summary"]
    _PENDING.pop(sender_key, None)
    return reply + " Send another voice note anytime."


def process_message(form: dict) -> str:
    """Run the full pipeline synchronously. Returns the reply text."""
    db: Session = SessionLocal()
    try:
        sender_raw = form.get("From", "")
        sender = normalize_sender(sender_raw)
        sender_key = f"whatsapp:{sender}"
        body = (form.get("Body") or "").strip()
        num_media = int(form.get("NumMedia") or 0)

        account = find_account(db, sender)
        logger.info("whatsapp inbound sender=%s account=%s has_media=%s body=%.80s",
                    sender_key, account.id if account else None, num_media, body)
        if not account:
            return "No Traka shop linked to this WhatsApp number yet. Abeg register that number in the Traka app first, then send your voice note again."

        transcript = ""
        text = body
        if num_media > 0 and form.get("MediaUrl0"):
            try:
                audio_bytes, ext = download_twilio_media(form["MediaUrl0"])
            except RuntimeError as exc:
                if "trial" in str(exc).lower():
                    logger.warning("whatsapp voice blocked: %s", exc)
                    return ("Voice note no fit download on our current Twilio trial plan. "
                            "Abeg type am as message for now — e.g. 'Mama Ngozi 5k rice Friday'.")
                logger.warning("whatsapp media download failed sender=%s err=%s", sender_key, exc)
                return "I no fit download that voice note. Abeg resend am."
            except Exception as exc:  # noqa: BLE001
                logger.warning("whatsapp media download failed sender=%s err=%s", sender_key, exc)
                return "I no fit download that voice note. Abeg resend am."
            if not audio_bytes:
                return "That voice note empty. Abeg resend am."
            if len(audio_bytes) > MAX_BYTES:
                return "That voice note too long. Abeg send shorter one."
            try:
                result = groq_transcribe(audio_bytes, f"whatsapp-voice{ext}")
                transcript = (result.get("text") or "").strip()
            except RuntimeError as exc:
                logger.warning("whatsapp transcribe failed sender=%s err=%s", sender_key, exc)
                return "I no hear that voice note well. Abeg resend am or type am."
            if not transcript:
                return "I no hear anything for that voice note. Abeg resend am."
            logger.info("whatsapp transcript sender=%s text=%.120s", sender_key, transcript)
            text = f"{transcript} {body}".strip() if body else transcript

        if not text:
            pending = _PENDING.get(sender_key)
            if pending and pending.get("awaiting"):
                return debt_parse.followup_question(pending["awaiting"])
            return "Send a voice note like: 'Mama Ngozi dey owe me 5k for rice, she go pay Friday'."

        return handle_text_message(db, sender_key, account.id, text, transcript=transcript)
    finally:
        db.close()


# ─── Endpoint ────────────────────────────────────────────────────────────

@router.post("/whatsapp-twilio")
async def whatsapp_twilio(request: Request):
    """Twilio webhook. Processes inline and replies with TwiML <Message>.

    Retries from Twilio reuse MessageSid — the stored reply is returned again
    instead of creating a duplicate debtor.
    """
    form = dict(await request.form())
    message_sid = str(form.get("MessageSid") or "")

    if message_sid and message_sid in _REPLIES:
        return twiml_reply(_REPLIES[message_sid])

    # Signature check (skipped by default for local/ngrok testing)
    signature = request.headers.get("X-Twilio-Signature", "")
    if not verify_twilio_signature(str(request.url), {k: str(v) for k, v in form.items()}, signature):
        logger.warning("Invalid Twilio signature")
        return twiml_empty()

    try:
        reply = process_message(form)
    except Exception as exc:  # noqa: BLE001 — always answer Twilio with valid TwiML
        logger.exception("whatsapp processing crashed: %s", exc)
        reply = "Something go wrong for our side. Abeg try again in a minute."

    if message_sid:
        _REPLIES[message_sid] = reply
        if len(_REPLIES) > 5000:  # bound memory for long-running dev
            _REPLIES.clear()
            _REPLIES[message_sid] = reply

    return twiml_reply(reply)
