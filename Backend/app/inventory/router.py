from fastapi import APIRouter, Depends, status, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.inventory import schemas, service
from app.accounts.service import get_current_account_id

router = APIRouter(
    prefix="/inventory",
    tags=["inventory"]
)

@router.get("", response_model=List[schemas.ProductResponse])
def get_products(db: Session = Depends(get_db), account_id: str = Depends(get_current_account_id)):
    return service.get_products(db=db, account_id=account_id)

@router.post("", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: schemas.ProductCreate, db: Session = Depends(get_db), account_id: str = Depends(get_current_account_id)):
    return service.create_product(db=db, product_in=product_in, account_id=account_id)

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(product_id: str, product_in: schemas.ProductUpdate, db: Session = Depends(get_db), account_id: str = Depends(get_current_account_id)):
    return service.update_product(db=db, product_id=product_id, product_in=product_in, account_id=account_id)

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(product_id: str, db: Session = Depends(get_db), account_id: str = Depends(get_current_account_id)):
    return service.delete_product(db=db, product_id=product_id, account_id=account_id)

@router.post("/extract-product", response_model=schemas.ProductExtractionResponse)
async def extract_product(
    images: list[UploadFile] = File(..., description="Upload up to 3 images"), 
    account_id: str = Depends(get_current_account_id)
):
    """
    Extracts the product name from up to 3 uploaded images using Gemini AI.
    The images are discarded immediately and not saved to the database.
    """
    if len(images) > 3:
        raise HTTPException(status_code=400, detail="Maximum of 3 images allowed")
    
    image_bytes_list = []
    mime_types = []
    for img in images:
        if not img.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Uploaded files must be images")
        content = await img.read()
        image_bytes_list.append(content)
        mime_types.append(img.content_type)   # pass real mime: image/jpeg, image/png, image/webp

    products = service.extract_product_from_images(image_bytes_list, mime_types)
    return schemas.ProductExtractionResponse(names=[p["name"] for p in products])
