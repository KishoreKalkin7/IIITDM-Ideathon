from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from . import services
from .models import Product, ShelfZone, OptimizationResult

app = FastAPI(title="Live Store Intelligence API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Live Store Intelligence System API is running"}

@app.get("/products", response_model=List[Product])
def get_products():
    return services.load_products()

@app.get("/shelf-layout", response_model=List[ShelfZone])
def get_shelf_layout():
    return services.load_shelf_layout()

@app.get("/analytics/performance")
def get_analytics():
    return services.get_product_performance()

@app.get("/optimization/recommendations", response_model=List[OptimizationResult])
def get_recommendations():
    return services.generate_recommendations()

@app.post("/upload/products")
async def upload_products(file: UploadFile = File(...)):
    try:
        content = await file.read()
        result = await services.process_product_file(content, file.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/upload/sales")
async def upload_sales(file: UploadFile = File(...)):
    try:
        content = await file.read()
        result = await services.process_sales_file(content, file.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
