# Live Store Intelligence System

This repository contains the **Live Store Intelligence Upgrade**, a unified retail intelligence system designed to optimize physical store operations using behavioral data.

## 🎯 Problem It Solves
Physical retail stores often rely on intuition for product placement and decisions. This system introduces **Behavior-Driven Decision Support**, specifically:
-   **Shelf Optimization**: Analysing sales velocity to suggest where products should be placed (e.g., Eye Level vs. Stretch Level).
-   **Category Management**: Organizing products into a structured 2-level hierarchy (Macro & Micro categories).
-   **Performance Tracking**: Real-time dashboard for store managers.

## 🏗 Tech Stack

### Backend (Intelligence Engine)
-   **Language**: Python 3.10+
-   **Framework**: FastAPI
-   **Data Processing**: Pandas, OpenPyXL (Excel Support), Python-Multipart (FileUploads)
-   **Caching**: In-Memory LRU Cache (for performance)
-   **Key Features**:
    -   Sales Velocity Calculation.
    -   Zone Suitability Scoring (High Velocity = Eye Level).
    -   **Dynamic Data Upload** (CSV/Excel/JSON).
    -   REST API for Dashboard consumption.

### Frontend (Retailer Dashboard)
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS
-   **Http Client**: standard Fetch API
-   **Key Features**:
    -   **Live Store Overview**: Revenue cards, Filters, and Real-time Search.
    -   **Optimization Suggestions**: Actionable insights (e.g., "Moves Coke to Eye Level").
    -   **Data Management**: Interface to upload custom datasets.

## 🚀 How to Run

### 1. Backend
```bash
cd backend
# Install dependencies
pip install -r requirements.txt
# Run Server
python -m uvicorn app.main:app --reload
```
*API runs at: `http://localhost:8000`*

### 2. Frontend
```bash
cd frontend
# Install dependencies
npm install
# Run Dev Server
npm run dev
```
*Dashboard runs at: `http://localhost:5173`*

## 📂 System Flow
1.  **Ingestion**: Logic loads dummy data from `backend/data/` (Products, Sales, Layout).
2.  **Analysis**: Python services calculate performance metrics.
3.  **Optimization**: The engine identifies high-performing products in poor shelf zones.
4.  **Presentation**: The React dashboard fetches these insights and displays them to the user.

## 📊 Category Structure
The system supports 4 Macro Categories and 14 Micro Categories, including:
-   **Beverages** (Soft Drinks, Juices...)
-   **Packaged Foods** (Chips, Biscuits...)
-   **Personal Care** (Soaps, Hygiene...)
-   **Daily Groceries** (Oils, Spices...)
