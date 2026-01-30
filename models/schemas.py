"""
Data models and schemas for the Return Product Fraud Detection System
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict
from enum import Enum
from datetime import datetime


class ReturnDecision(str, Enum):
    """Possible return decisions"""
    APPROVED = "Approved"
    REVIEW = "Review"
    REJECTED = "Rejected"


class DeliveryConfirmationResponse(BaseModel):
    """Response schema for delivery confirmation"""
    status: str
    message: str
    order_id: str
    product_category: str
    delivery_timestamp: str
    image_path: str


class AuthenticityDetails(BaseModel):
    """Details from image authenticity check"""
    is_suspicious: bool
    confidence_score: float = Field(..., ge=0, le=100)
    checks_performed: Dict[str, bool]
    flags: list[str]


class ReturnRequestResponse(BaseModel):
    """Response schema for return request"""
    status: str
    decision: ReturnDecision
    order_id: str
    explanation: str
    fraud_score: Optional[float] = None
    authenticity_details: Optional[Dict] = None


class DeliveryRecord(BaseModel):
    """Internal model for delivery record"""
    order_id: str
    product_category: str
    delivery_timestamp: str
    image_path: str
    image_hash: str
    image_metadata: Dict


class ReturnRecord(BaseModel):
    """Internal model for return request record"""
    order_id: str
    return_reason: str
    product_category: str
    return_timestamp: str
    time_since_delivery: int
    image_path: str
    image_hash: str
    decision: ReturnDecision
    explanation: str
    fraud_score: Optional[float] = None
