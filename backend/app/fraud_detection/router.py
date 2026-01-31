"""
Return Product Fraud Detection System - Main Application
A FastAPI-based backend for preventing return fraud in e-commerce
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import uvicorn

from .models.schemas import (
    DeliveryConfirmationResponse,
    ReturnRequestResponse,
    ReturnDecision
)
from .services.image_service import ImageService
from .services.fraud_detection_service import FraudDetectionService
from .services.decision_engine import DecisionEngine
from .utils.storage import StorageManager

# Initialize API Router
router = APIRouter(
    prefix="/fraud",
    tags=["Start Return Fraud Detection"]
)

# Initialize services
storage_manager = StorageManager()
image_service = ImageService(storage_manager)
fraud_detection_service = FraudDetectionService()
decision_engine = DecisionEngine(fraud_detection_service)


@router.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "active",
        "service": "Return Product Fraud Detection System",
        "version": "1.0.0"
    }


@router.post("/delivery-confirmation", response_model=DeliveryConfirmationResponse)
async def delivery_confirmation(
    order_id: str = Form(...),
    product_category: str = Form(...),
    delivery_image: UploadFile = File(...)
):
    """
    MANDATORY: Customer uploads delivery image after receiving product.
    This creates a baseline reference for future return requests.
    
    Args:
        order_id: Unique order identifier
        product_category: Category of product (e.g., 'electronics', 'food', 'clothing')
        delivery_image: Image of the delivered product
    
    Returns:
        Confirmation status with order details
    """
    try:
        # Validate image file
        if not delivery_image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="Uploaded file must be an image"
            )
        
        # Save delivery image and metadata
        result = await image_service.save_delivery_image(
            order_id=order_id,
            product_category=product_category,
            image_file=delivery_image
        )
        
        return DeliveryConfirmationResponse(
            status="success",
            message="Delivery confirmed successfully. Image saved as baseline reference.",
            order_id=order_id,
            product_category=product_category,
            delivery_timestamp=result["timestamp"],
            image_path=result["image_path"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/request-return", response_model=ReturnRequestResponse)
async def request_return(
    order_id: str = Form(...),
    return_reason: str = Form(...),
    product_category: str = Form(...),
    return_image: UploadFile = File(...),
    time_since_delivery: int = Form(...)  # Time in hours since delivery
):
    """
    Process return request with fraud detection.
    
    BUSINESS LOGIC:
    1. Check if delivery image exists (mandatory)
    2. For food products: Enforce time limit
    3. For damaged products: Run image authenticity check
    4. Make final decision based on all factors
    
    Args:
        order_id: Unique order identifier
        return_reason: Reason for return ('Damaged Product', 'Not satisfied', 'Wrong item')
        product_category: Category of product
        return_image: Image of product being returned
        time_since_delivery: Hours elapsed since delivery
    
    Returns:
        Return decision with explanation
    """
    try:
        # Validate image file
        if not return_image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="Uploaded file must be an image"
            )
        
        # STEP 1: Check if delivery image exists (MANDATORY)
        delivery_record = storage_manager.get_delivery_record(order_id)
        if not delivery_record:
            return ReturnRequestResponse(
                status="rejected",
                decision=ReturnDecision.REJECTED,
                order_id=order_id,
                explanation=(
                    "Return request rejected. No delivery confirmation found. "
                    "Customers must upload a delivery image upon receiving the product."
                )
            )
        
        # Save return image
        return_image_result = await image_service.save_return_image(
            order_id=order_id,
            image_file=return_image
        )
        
        # STEP 2: Process return through decision engine
        decision_result = await decision_engine.process_return_request(
            order_id=order_id,
            return_reason=return_reason,
            product_category=product_category,
            time_since_delivery=time_since_delivery,
            return_image_path=return_image_result["image_path"],
            delivery_record=delivery_record
        )
        
        return ReturnRequestResponse(
            status="success",
            decision=decision_result["decision"],
            order_id=order_id,
            explanation=decision_result["explanation"],
            fraud_score=decision_result.get("fraud_score"),
            authenticity_details=decision_result.get("authenticity_details")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/order/{order_id}/status")
async def get_order_status(order_id: str):
    """
    Get the current status of an order including delivery and return information.
    
    Args:
        order_id: Unique order identifier
    
    Returns:
        Order status details
    """
    try:
        delivery_record = storage_manager.get_delivery_record(order_id)
        return_record = storage_manager.get_return_record(order_id)
        
        return {
            "order_id": order_id,
            "has_delivery_confirmation": delivery_record is not None,
            "has_return_request": return_record is not None,
            "delivery_details": delivery_record,
            "return_details": return_record
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


