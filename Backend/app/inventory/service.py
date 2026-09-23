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
    db_product = models.Product(
        account_id=account_id,
        **product_in.model_dump()
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
    product = get_product(db, product_id, account_id)
    update_data = product_in.model_dump(exclude_unset=True)
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

_SINGLE_PROMPT = (
    "You are a Nigerian FMCG product identifier. "
    "Look at this single product image carefully. "
    "Return ONLY the full commercial product name including brand, variant, and size. "
    "Examples: 'Peak Full Cream Milk Tin (400g)', 'Indomie Instant Noodles Chicken (70g)', "
    "'Dangote Sugar (1kg)', 'Cowbell Chocolate Sachet (28g)'. "
    "If you cannot clearly identify the product, return exactly: UNREADABLE"
)

_GEMINI_MODEL = 'gemini-3.5-flash'


def _extract_single(img_bytes: bytes, mime_type: str):
    """One Gemini call for one image. Returns product name string or None."""
    response = client.models.generate_content(
        model=_GEMINI_MODEL,
        contents=[
            _SINGLE_PROMPT,
            types.Part.from_bytes(data=img_bytes, mime_type=mime_type)
        ]
    )
    result = response.text.strip()
    return None if (not result or result.upper() == "UNREADABLE") else result


def extract_product_from_images(
    image_bytes_list: List[bytes],
    mime_types: List[str] = None,
) -> List[dict]:
    """
    One Gemini call per image — each image is identified independently.
    Returns a list of { index, name } dicts, one per identified product.
    """
    if not image_bytes_list:
        raise HTTPException(status_code=400, detail="No images provided")

    if not mime_types:
        mime_types = ["image/jpeg"] * len(image_bytes_list)

    results = []
    for i, (img_bytes, mime) in enumerate(zip(image_bytes_list, mime_types)):
        name = _extract_single(img_bytes, mime)
        if name:
            results.append({"index": i, "name": name})

    if not results:
        raise HTTPException(
            status_code=422,
            detail="Could not identify any product from the uploaded images. "
                   "Try clearer photos showing the product labels directly."
        )

    return results
