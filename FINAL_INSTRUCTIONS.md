# Smart Retail System - Integration Complete

## Overview
Your project has been integrated into a single unified system with a "Matt Black" premium frontend.

### 1. Unified Backend
- **Location**: `backend/`
- **Logic**: Integrates Shelf Optimization, Recommendation Engine (`OnlineStoreModule`), and Fraud Detection.
- **API**: Runs on `http://localhost:8000`.

### 2. Premium Frontend
- **Location**: `frontend/`
- **Tech**: React + Vite + Tailwind CSS.
- **Theme**: Premium "Matt Black" (Apple-inspired dark mode).
- **Features**:
  - **Landing Page**: Role selection (Customer vs Retailer).
  - **Customer Dashboard**: Shopping, Cart, Orders, Recommendations.
  - **Retailer Dashboard**: Smart Notifications, Shelf Layouts, Inventory.

## How to Run
1. **Start Backend**:
   Double-click `run_backend.bat`
   (Wait for "Application startup complete" message)

2. **Start Frontend**:
   Double-click `run_frontend.bat`
   (It will open access URL, usually `http://localhost:5173`)

## Key Features Implemented
- **Data Pipeline**: `logic_engine.py` orchestrates data flow from CSVs (`backend/data`).
- **Orchestration**: `main.py` routes requests to appropriate services (Fraud, Shelf, Recs).
- **Role-Based Access**: Dedicated portals for Retailers and Customers.
- **Visuals**: High-end dark aesthetic with glassmorphism effects.

## Troubleshooting
- If backend fails with "Module not found", run `pip install -r backend/requirements.txt` manually.
- If frontend fails, run `npm install` inside `frontend/` folder.
