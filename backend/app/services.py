import json
import pandas as pd
import io
from datetime import datetime
from typing import List, Dict, Union, Any
from functools import lru_cache
from .models import Product, Transaction, ShelfZone, OptimizationResult

DATA_DIR = "data"

@lru_cache(maxsize=1)
def load_products() -> List[Product]:
    try:
        with open(f"{DATA_DIR}/products.json", "r") as f:
            data = json.load(f)
        return [Product(**item) for item in data]
    except Exception:
        return []

@lru_cache(maxsize=1)
def load_sales() -> List[Transaction]:
    try:
        with open(f"{DATA_DIR}/sales.json", "r") as f:
            data = json.load(f)
        return [Transaction(**item) for item in data]
    except Exception:
        return []

@lru_cache(maxsize=1)
def load_shelf_layout() -> List[ShelfZone]:
    try:
        with open(f"{DATA_DIR}/shelf_layout.json", "r") as f:
            data = json.load(f)
        return [ShelfZone(**item) for item in data]
    except Exception:
        return []

def calculate_sales_velocity() -> Dict[Union[str, int], int]:
    """
    Calculates total quantity sold per product.
    Returns: Dict {product_id: total_quantity}
    """
    sales = load_sales()
    if not sales:
        return {}
    
    # Optimize: Use DataFrame only if list is large, else simple dict comprehension might be faster
    # But for analytics consistency, Pandas is fine.
    df = pd.DataFrame([s.dict() for s in sales])
    if df.empty:
        return {}
        
    velocity = df.groupby("product_id")["quantity"].sum().to_dict()
    return velocity
    """
    Calculates total quantity sold per product.
    Returns: Dict {product_id: total_quantity}
    """
    sales = load_sales()
    if not sales:
        return {}
    
    df = pd.DataFrame([s.dict() for s in sales])
    velocity = df.groupby("product_id")["quantity"].sum().to_dict()
    return velocity

def get_product_performance():
    products = load_products()
    velocity = calculate_sales_velocity()
    
    performance = []
    for p in products:
        sales_qty = velocity.get(p.id, 0)
        performance.append({
            "product": p,
            "sales_velocity": sales_qty,
            "revenue": sales_qty * p.price
        })
    return performance

def generate_recommendations() -> List[OptimizationResult]:
    products = load_products()
    velocity = calculate_sales_velocity()
    shelf_layout = load_shelf_layout()
    
    # Map Product ID to Current Zone
    product_zone_map = {}
    for zone in shelf_layout:
        for pid in zone.current_product_ids:
            product_zone_map[pid] = zone

    recommendations = []
    
    # Calculate Velocity Percentiles to determine High/Low performers
    # Simple logic: If sales > 0, consider potential. 
    # Let's simple rank: Top 3 = High, Bottom 3 = Low (for this small dataset)
    
    # Sort products by velocity
    # Helper to get velocity
    def get_vel(p): return velocity.get(p.id, 0)
    
    sorted_products = sorted(products, key=get_vel, reverse=True)
    
    # Define thresholds
    n = len(sorted_products)
    top_tier = sorted_products[:3] # Top 3
    bottom_tier = sorted_products[-3:] # Bottom 3
    
    top_ids = {p.id for p in top_tier}
    bottom_ids = {p.id for p in bottom_tier}
    
    for product in products:
        pid = product.id
        current_zone = product_zone_map.get(pid)
        
        if not current_zone:
            continue # specific logic for unassigned items? Skip for now.
            
        current_zone_type = current_zone.zone_type
        
        # Rule 1: High Velocity should be at Eye Level
        if pid in top_ids and current_zone_type != "Eye Level":
            recommendations.append(OptimizationResult(
                product_id=pid,
                product_name=product.name,
                current_zone=current_zone_type,
                recommended_zone="Eye Level",
                reason=f"High Sales Velocity ({velocity.get(pid, 0)} units). Move to Eye Level for maximum visibility."
            ))
            
        # Rule 2: Low Velocity should NOT be at Eye Level (waste of prime space)
        elif pid in bottom_ids and current_zone_type == "Eye Level":
            recommendations.append(OptimizationResult(
                product_id=pid,
                product_name=product.name,
                current_zone=current_zone_type,
                recommended_zone="Stretch Level",
                reason=f"Low Sales Velocity ({velocity.get(pid, 0)} units). Move to Stretch Level to free up prime space."
            ))
            
    return recommendations

def save_products(products: List[Dict]):
    with open(f"{DATA_DIR}/products.json", "w") as f:
        json.dump(products, f, indent=2)

def save_sales(sales: List[Dict]):
    # Convert timestamps to string if needed
    for s in sales:
        if isinstance(s.get("timestamp"), (pd.Timestamp, datetime)):
             s["timestamp"] = s["timestamp"].isoformat()
    
    with open(f"{DATA_DIR}/sales.json", "w") as f:
        json.dump(sales, f, indent=2)

async def process_product_file(file_content: bytes, filename: str):
    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(file_content))
    elif filename.endswith((".xls", ".xlsx")):
        df = pd.read_excel(io.BytesIO(file_content))
    elif filename.endswith(".json"):
        data = json.loads(file_content)
        save_products(data)
        load_products.cache_clear() # CLEAR CACHE
        return {"status": "success", "count": len(data)}
    else:
        raise ValueError("Unsupported file type")
    
    # Validation / cleanup could go here
    # For now, converting DF to records
    data = df.to_dict(orient="records")
    save_products(data)
    load_products.cache_clear() # CLEAR CACHE
    return {"status": "success", "count": len(data)}

async def process_sales_file(file_content: bytes, filename: str):
    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(file_content))
    elif filename.endswith((".xls", ".xlsx")):
        df = pd.read_excel(io.BytesIO(file_content))
    elif filename.endswith(".json"):
        data = json.loads(file_content)
        save_sales(data)
        load_sales.cache_clear() # CLEAR CACHE
        return {"status": "success", "count": len(data)}
    else:
        raise ValueError("Unsupported file type")

    data = df.to_dict(orient="records")
    save_sales(data)
    load_sales.cache_clear() # CLEAR CACHE
    return {"status": "success", "count": len(data)}
