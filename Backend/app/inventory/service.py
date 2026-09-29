from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.inventory import models, schemas
from app.activity.service import log_activity
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
from typing import List

load_dotenv()
client = genai.Client()

def get_products(db: Session, account_id: str):
    return db.query(models.Product).filter(models.Product.account_id == account_id).all()

def get_product(db: Session, product_id: str, account_id: str):
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.account_id == account_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

def create_product(db: Session, product_in: schemas.ProductCreate, account_id: str):
    from app.accounts import models as acct_models
    from app.core.countries import to_minor

    acc = db.query(acct_models.Account).filter(
        acct_models.Account.id == account_id).first()
    country = acc.country if acc and acc.country else "NG"
    currency = acc.currency if acc and acc.currency else "NGN"
    data = product_in.model_dump()
    data["cost_price"] = to_minor(data["cost_price"], country)
    data["selling_price"] = to_minor(data["selling_price"], country)
    db_product = models.Product(
        account_id=account_id,
        currency=currency,
        **data,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    log_activity(
        db,
        account_id=account_id,
        activity_type="product_created",
        title="Product Added",
        description=f"'{db_product.name}' added to inventory",
        event_metadata={
            "product_id": db_product.id,
            "product_name": db_product.name,
        },
    )

    return db_product

def update_product(db: Session, product_id: str, product_in: schemas.ProductUpdate, account_id: str):
    from app.accounts import models as acct_models
    from app.core.countries import to_minor

    product = get_product(db, product_id, account_id)
    acc = db.query(acct_models.Account).filter(
        acct_models.Account.id == account_id).first()
    country = acc.country if acc and acc.country else "NG"
    update_data = product_in.model_dump(exclude_unset=True)
    for key in ("cost_price", "selling_price"):
        if key in update_data and update_data[key] is not None:
            update_data[key] = to_minor(update_data[key], country)
    for key, value in update_data.items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)

    log_activity(
        db,
        account_id=account_id,
        activity_type="product_updated",
        title="Product Updated",
        description=f"'{product.name}' details updated",
        event_metadata={
            "product_id": product.id,
            "product_name": product.name,
        },
    )

    return product

def delete_product(db: Session, product_id: str, account_id: str):
    product = get_product(db, product_id, account_id)
    product_id_snap = product.id
    product_name_snap = product.name
    db.delete(product)
    db.commit()

    log_activity(
        db,
        account_id=account_id,
        activity_type="product_deleted",
        title="Product Removed",
        description=f"'{product_name_snap}' removed from inventory",
        event_metadata={
            "product_id": product_id_snap,
            "product_name": product_name_snap,
        },
    )

    return {"message": "Product deleted successfully"}

_BATCH_PROMPT = (
    "You are a Nigerian FMCG product identifier. You are given {n} product photos in order. "
    "Return ONLY a JSON array with exactly {n} items: the full commercial product name for each "
    "photo including brand, variant, and size (e.g. 'Peak Full Cream Milk Tin (400g)', "
    "'Indomie Instant Noodles Chicken (70g)'), in the same order as the photos. "
    "If a photo is unreadable, use null for that position. No prose, no code fences."
)

_GEMINI_MODEL = os.getenv("GEMINI_VISION_MODEL", "gemini-3.5-flash")
# Fallbacks for retired models (404) plus one transient-overload (503) retry.
# Order prefers currently-responsive models; measured 2026-09: 3.5-flash ~2s.
_GEMINI_FALLBACKS = (
    "gemini-3.5-flash-lite",
    "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-3.8-flash",
)

_MAX_DIM = 1024  # downscale phone photos before upload: faster + cheaper


def _downscale(img_bytes: bytes, mime_type: str) -> tuple[bytes, str]:
    """Shrink large photos (max 1024px, JPEG-80). Passes through untouched
    when Pillow is unavailable or the bytes aren't a decodable image."""
    try:
        import io

        from PIL import Image
    except ImportError:
        return img_bytes, mime_type
    try:
        im = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        im.thumbnail((_MAX_DIM, _MAX_DIM))
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=80)
        return buf.getvalue(), "image/jpeg"
    except Exception:
        return img_bytes, mime_type


def _parse_batch_json(content: str, n: int) -> list:
    """Tolerantly parse the model's JSON array (fences/prose around it OK)."""
    import json
    import re

    text = (content or "").strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL | re.IGNORECASE)
    if fence:
        text = fence.group(1).strip()
    if not text.startswith("["):
        start, end = text.find("["), text.rfind("]")
        if start != -1 and end > start:
            text = text[start:end + 1]
    data = json.loads(text)
    if not isinstance(data, list):
        raise ValueError("expected a JSON array")
    return (data + [None] * n)[:n]


def _extract_batch(items: list[tuple[bytes, str]]) -> list:
    """One Gemini call for all images. Returns list of names/nulls in order."""
    from google.genai import errors as genai_errors

    n = len(items)
    contents: list = [_BATCH_PROMPT.format(n=n)]
    contents += [
        types.Part.from_bytes(data=img_bytes, mime_type=mime)
        for img_bytes, mime in items
    ]
    last_err: Exception | None = None
    retried_overload = False
    for model in (_GEMINI_MODEL, *_GEMINI_FALLBACKS):
        try:
            response = client.models.generate_content(model=model, contents=contents)
            return _parse_batch_json(response.text, n)
        except genai_errors.APIError as exc:
            last_err = exc
            if exc.code == 404:
                continue  # retired model — try next
            if exc.code == 503 and not retried_overload:
                retried_overload = True
                continue  # transient overload — one retry on next model, then give up
            if exc.code == 503:
                raise HTTPException(
                    status_code=503,
                    detail="Product recognition is busy right now, abeg try again in a minute.",
                )
            raise HTTPException(
                status_code=502,
                detail=f"Product recognition failed ({exc.code}): {exc.message}",
            )
        except (ValueError, AttributeError) as exc:
            last_err = exc
            break  # unparseable output — retrying another model won't help
    raise HTTPException(
        status_code=503,
        detail=f"Product recognition is temporarily unavailable: {last_err}",
    )


def _extract_single(img_bytes: bytes, mime_type: str):
    """Single-image convenience wrapper around the batch call."""
    names = _extract_batch([(img_bytes, mime_type)])
    name = names[0] if names else None
    return name if isinstance(name, str) and name.strip() else None


def extract_product_from_images(
    image_bytes_list: List[bytes],
    mime_types: List[str] = None,
) -> List[dict]:
    """
    One batched Gemini call for all images (fast: single round trip).
    Returns a list of { index, name } dicts, one per identified product.
    """
    if not image_bytes_list:
        raise HTTPException(status_code=400, detail="No images provided")

    if not mime_types:
        mime_types = ["image/jpeg"] * len(image_bytes_list)

    items = [
        _downscale(img_bytes, mime)
        for img_bytes, mime in zip(image_bytes_list, mime_types)
    ]
    raw_names = _extract_batch(items)

    results = []
    for i, name in enumerate(raw_names):
        if (isinstance(name, str) and name.strip()
                and name.strip().upper() != "UNREADABLE"):
            results.append({"index": i, "name": name.strip()})

    if not results:
        raise HTTPException(
            status_code=422,
            detail="Could not identify any product from the uploaded images. "
                   "Try clearer photos showing the product labels directly."
        )

    return results
