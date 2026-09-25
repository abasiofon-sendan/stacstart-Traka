from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Literal, Optional

from app.db.database import get_db
from app.accounts.service import get_current_account_id
from app.voice import service

router = APIRouter(prefix="/voice", tags=["voice"])

MAX_BYTES = 25 * 1024 * 1024  # 25 MB — Groq's file size limit


# ─── Shared response shape ────────────────────────────────────────────────────

class AdvisorResponse(BaseModel):
    transcript:        str    # the question (typed or transcribed)
    language_detected: str    # detected or inferred language code
    reply:             str    # LLM answer in matching language


# ─── Text question ────────────────────────────────────────────────────────────

class TextAskRequest(BaseModel):
    question: str
    language: Optional[Literal["en", "yo", "ha", "pidgin"]] = "en"
    # If the user picks their language in the UI, pass it here.
    # Defaults to "en" so the LLM still works without a choice.


@router.post("/ask/text", response_model=AdvisorResponse)
def text_ask(
    body: TextAskRequest,
    db: Session = Depends(get_db),
    account_id: str = Depends(get_current_account_id),
):
    """
    Accepts a typed question from the merchant and returns an answer
    using live business data from their account.

    Pass `language` to control the reply language:
      "en"     → English
      "yo"     → Yoruba
      "ha"     → Hausa
      "pidgin" → Nigerian Pidgin (default when omitted)
    """
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        reply = service.groq_advise(
            transcript=body.question.strip(),
            language=body.language,
            db=db,
            account_id=account_id,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return AdvisorResponse(
        transcript=body.question.strip(),
        language_detected=body.language,
        reply=reply,
    )


# ─── Voice note ───────────────────────────────────────────────────────────────

@router.post("/ask/voice", response_model=AdvisorResponse)
async def voice_ask(
    audio: UploadFile = File(..., description="Voice note recorded by the merchant (.webm)"),
    db: Session = Depends(get_db),
    account_id: str = Depends(get_current_account_id),
):
    """
    Accepts a voice note (.webm), transcribes it with Groq Whisper, then
    answers the question using live business data.

    Language is detected automatically from the audio — Pidgin, Yoruba,
    Hausa, and English are all supported. Reply matches detected language.
    """
    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio file is empty")

    if len(audio_bytes) > MAX_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Audio file too large ({len(audio_bytes) // (1024*1024)} MB). Max is 25 MB.",
        )

    try:
        result = service.handle_voice_question(
            audio_bytes=audio_bytes,
            filename=audio.filename or "recording.webm",
            db=db,
            account_id=account_id,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return AdvisorResponse(**result)
