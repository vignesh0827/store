@echo off
title NexaGlow Shop Manager - Starting Up...
echo ==========================================
echo    NexaGlow Shop Management System
echo ==========================================
echo.

:: 1. Start Backend in a new window
echo [1/3] Starting Backend Server...
cd backend
start "NexaGlow Backend" cmd /c ".\venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000"
cd ..

:: 2. Start Frontend in a new window
echo [2/3] Starting Frontend UI...
cd frontend
start "NexaGlow Frontend" cmd /c "npm run dev"
cd ..

:: 3. Wait a few seconds for servers to warm up, then open browser
echo [3/3] Opening NexaGlow in your browser...
timeout /t 5 /nobreak > NUL
start http://localhost:5173

echo.
echo All components started! 
echo Please keep the other black windows open while using the app.
echo.
pause
