from pydantic import BaseModel
from typing import List, Optional, Union, Any
from datetime import datetime

# Enums removed to allow user-defined categories
    
class Product(BaseModel):
    id: Union[int, str]
    name: str
    macro_category: str
    micro_category: str
    price: float
    dimensions: str  # e.g. "10x5x5" (cm)
    margin: float # Profit margin percentage

class Transaction(BaseModel):
    id: Optional[str] = None
    product_id: Union[int, str]
    quantity: int
    timestamp: Any # Allow string or datetime

class ShelfZone(BaseModel):
    id: str
    zone_type: str # "Eye Level", "Touch Level", "Stretch Level"
    traffic_rating: str # "High", "Medium", "Low"
    current_product_ids: List[Union[int, str]]

class OptimizationResult(BaseModel):
    product_id: Union[int, str]
    product_name: str
    current_zone: str
    recommended_zone: str
    reason: str
