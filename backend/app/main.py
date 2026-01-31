from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import os
import sys

# Add project root to path if needed, though standard relative imports usually work
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from . import services
from .models import Product, ShelfZone, OptimizationResult
from .logic_engine import RecommendationEngine
from .fraud_detection.router import router as fraud_router
from pydantic import BaseModel

class ProductModel(BaseModel):
    name: str
    category: str
    price: float
    stock: int

class SurveyModel(BaseModel):
    user_id: str
    preferences: List[str]
    intent: str
    return_sensitivity: str
    age: Optional[int] = None
    gender: Optional[str] = None

class TicketModel(BaseModel):
    user_id: str
    role: str
    issue: str

class ResolveModel(BaseModel):
    ticket_id: str
    response: str

app = FastAPI(title="Unified Smart Retail System API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Path Configuration ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

# --- Initialize Engines ---
recommender = RecommendationEngine(data_dir=DATA_DIR)
# Load data initially
try:
    recommender.load_data()
    print(f"Recommender loaded data from {DATA_DIR}")
except Exception as e:
    print(f"Failed to load recommender data: {e}")

# --- Mount Sub-Apps/Routers ---
app.include_router(fraud_router)

# --- Root ---
@app.get("/")
def read_root():
    return {"message": "Unified Smart Retail System API is running"}

# --- Shelf Optimization & General Product Stats (Existing Backend) ---
@app.get("/products", response_model=List[Product])
def get_products():
    return services.load_products()

@app.get("/shelf-layout", response_model=List[ShelfZone])
def get_shelf_layout():
    return services.load_shelf_layout()

@app.get("/analytics/performance")
def get_analytics():
    return services.get_product_performance()

@app.get("/optimization/shelf-recommendations", response_model=List[OptimizationResult])
def get_shelf_recommendations():
    return services.generate_recommendations()

# --- Customer & Retailer Interaction (Recommender Engine) ---

@app.get("/users")
def get_users():
    """List all users for login (Demo purposes)"""
    if recommender.users.empty:
        return []
    return recommender.users.to_dict(orient="records")

@app.post("/users/login")
def login_user(user_id: str = Body(...), password: str = Body(...)):
    """Check if user exists and password matches"""
    res = recommender.login_user(user_id, password)
    if res["status"] == "success":
        return res
    raise HTTPException(status_code=401, detail=res["message"])

@app.post("/delivery/confirm")
async def confirm_delivery(order_id: str = Body(...), user_id: str = Body(...)):
    # Mock for fraud baseline - usually takes image
    return {"status": "success", "message": "Baseline registered"}

@app.get("/retailers")
def get_retailers():
    if recommender.retailers.empty:
        return []
    return recommender.retailers.to_dict(orient="records")

@app.get("/retailers/{retailer_id}/products")
def get_retailer_products(retailer_id: str):
    products = recommender.get_retailer_products(retailer_id)
    return products.to_dict(orient="records")

@app.get("/recommendations/{user_id}")
def get_user_recommendations(user_id: str, retailer_id: Optional[str] = None):
    try:
        recs = recommender.get_recommendations(user_id, retailer_id=retailer_id)
        if recs.empty:
            return []
        return recs.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/order")
def place_order(user_id: str = Body(...), retailer_id: str = Body(...), items: Dict[str, int] = Body(...)):
    """
    Items: {product_id: quantity}
    """
    try:
        order_id = recommender.place_order(user_id, retailer_id, items)
        return {"status": "success", "order_id": order_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{user_id}/orders")
def get_user_orders(user_id: str):
    orders = recommender.get_user_orders(user_id)
    if orders.empty:
        return []
    return orders.to_dict(orient="records")

@app.get("/users/{user_id}/returns")
def get_user_returns(user_id: str):
    return recommender.get_user_returns(user_id)

@app.get("/retailers/{retailer_id}/notifications")
def get_retailer_notifications(retailer_id: str):
    return recommender.get_retailer_notifications(retailer_id)

@app.get("/retailers/{retailer_id}/inventory")
def get_retailer_inventory(retailer_id: str):
    return get_retailer_products(retailer_id)

@app.get("/retailers/{retailer_id}/returns")
def get_retailer_returns(retailer_id: str):
    return recommender.get_retailer_returns(retailer_id)

@app.post("/return/request")
async def create_return(
    user_id: str = Form(...),
    order_id: str = Form(...),
    product_id: str = Form(...),
    reason: str = Form(...),
    condition: str = Form("Good"),
    image: Optional[UploadFile] = File(None)
):
    try:
        image_data = await image.read() if image else None
        req_id = recommender.create_return_request(
            user_id, order_id, product_id, reason, condition, image_data
        )
        return {"status": "success", "request_id": req_id}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/returns/pending")
def get_admin_pending_returns():
    return recommender.get_pending_returns()

@app.post("/admin/returns/process")
def process_return(request_id: str = Body(...), decision: str = Body(...), notes: str = Body("")):
    # Decision: Approved / Rejected
    if recommender.admin_process_return(request_id, decision, notes):
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Request not found")

@app.get("/admin/users")
def list_admin_users():
    return recommender.get_users_list()

@app.post("/admin/users/{user_id}/toggle")
def toggle_user(user_id: str):
    if recommender.toggle_user_status(user_id):
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/admin/logs")
def get_logs():
    return recommender.get_system_logs()

@app.get("/admin/user-trust/{user_id}")
def get_user_trust(user_id: str):
    return {"score": recommender.get_user_trust_score(user_id)}

@app.post("/admin/retailers/{retailer_id}/toggle")
def toggle_retailer(retailer_id: str):
    if recommender.toggle_retailer_status(retailer_id):
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Retailer not found")

@app.post("/retailers/register")
def register_retailer(name: str = Body(...), location: str = Body(...), delivery_charge: int = Body(0)):
    rid = recommender.register_retailer(name, location, delivery_charge)
    return {"status": "success", "retailer_id": rid}

@app.post("/survey")
def save_survey(data: SurveyModel):
    recommender.save_survey_response(
       data.user_id, data.preferences, data.intent, data.return_sensitivity,
       data.age, data.gender, []
    )
    return {"status": "success"}

@app.post("/retailers/{retailer_id}/products")
def add_product(retailer_id: str, prod: ProductModel):
    pid = recommender.add_product(retailer_id, prod.name, prod.category, prod.price, prod.stock)
    return {"status": "success", "product_id": pid}

@app.get("/retailers/{retailer_id}/products")
def get_retailer_products(retailer_id: str):
    df = recommender.get_retailer_products(retailer_id)
    if df.empty: return []
    return df.to_dict(orient="records")

@app.get("/retailers/{retailer_id}/orders")
def get_retailer_orders(retailer_id: str):
    return recommender.get_retailer_orders(retailer_id)

@app.get("/retailers/{retailer_id}/analytics")
def get_retailer_analytics(retailer_id: str):
    return recommender.get_retailer_analytics(retailer_id)

@app.delete("/retailers/{retailer_id}/products/{product_id}")
def delete_product_endpoint(retailer_id: str, product_id: str):
    if recommender.delete_product(product_id):
         return {"status": "success"}
    raise HTTPException(status_code=400, detail="Failed to delete")

# Support Endpoints
@app.post("/support/create")
def create_ticket(tkt: TicketModel):
    tid = recommender.create_support_ticket(tkt.user_id, tkt.role, tkt.issue)
    return {"status": "success", "ticket_id": tid}

@app.get("/admin/support")
def get_admin_tickets():
    return recommender.get_support_tickets()

@app.post("/admin/support/resolve")
def resolve_ticket(res: ResolveModel):
    if recommender.resolve_ticket(res.ticket_id, res.response):
        return {"status": "success"}
    raise HTTPException(status_code=400, detail="Failed")

# --- End ---
