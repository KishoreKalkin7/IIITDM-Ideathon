@echo off
echo ========================================
echo Return Product Fraud Detection System
echo ========================================
echo.
echo Starting FastAPI server...
echo.
echo Server will be available at:
echo - Main URL: http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo - ReDoc: http://localhost:8000/redoc
echo.
echo Press Ctrl+C to stop the server
echo.

.venv\Scripts\python.exe main.py
