@echo off

echo Setting up Banking Document RAG Service...

:: Create virtual environment
python -m venv venv

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Upgrade pip
python -m pip install --upgrade pip

:: Install requirements
pip install -r requirements.txt

echo Setup complete!
echo.
echo To start the RAG service:
echo 1. Activate the virtual environment:
echo    venv\Scripts\activate.bat
echo 2. Run the service:
echo    python main.py
echo.
echo The service will be available at http://localhost:8000
pause
