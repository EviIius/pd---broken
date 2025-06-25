@echo off
echo 🏦 Policy Document Q&A System - Enhanced with RAG
echo =================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and try again
    pause
    exit /b 1
)

echo ✅ Python and Node.js are installed
echo.

:: Setup RAG service if not already done
if not exist "rag-service\venv" (
    echo 🔧 Setting up RAG service...
    cd rag-service
    call setup.bat
    cd ..
    echo.
)

:: Setup frontend if not already done
if not exist "frontend\node_modules" (
    echo 🔧 Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
    echo.
)

:: Check for environment files
if not exist "frontend\.env.local" (
    echo ⚠️ Frontend environment file not found
    echo Please copy frontend\.env.example to frontend\.env.local
    echo and add your Gemini API key
    echo.
)

echo 🚀 Starting services...
echo.

:: Start RAG service in background
echo Starting RAG service...
cd rag-service
start "RAG Service" cmd /k "venv\Scripts\activate.bat && python main.py"
cd ..

:: Wait for RAG service to start
echo Waiting for RAG service to start...
timeout /t 5 /nobreak >nul

:: Initialize documents if needed
echo Checking RAG document initialization...
cd rag-service
start "RAG Init" cmd /k "venv\Scripts\activate.bat && python initialize_documents.py && pause"
cd ..

:: Wait a moment
timeout /t 3 /nobreak >nul

:: Start frontend
echo Starting frontend...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo 🎉 Services are starting!
echo.
echo 📡 RAG Service: http://localhost:8000
echo 🌐 Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
