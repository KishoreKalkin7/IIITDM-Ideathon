@echo off
echo ========================================
echo Testing Fraud Detection System
echo ========================================
echo.
echo Make sure the server is running first!
echo Run 'run_server.bat' in another terminal
echo.
pause
echo.
echo Running test suite...
echo.

.venv\Scripts\python.exe test_api.py
