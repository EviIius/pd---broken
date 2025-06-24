@echo off
REM Simple test script to verify the application builds correctly
REM Run this from the frontend directory

echo Testing Next.js build...

REM Check if package.json exists
if not exist "package.json" (
    echo Error: package.json not found. Run this script from the frontend directory.
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Check if the build succeeds
echo Building application...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful! The application should work correctly.
    echo.
    echo 📋 To test date filters manually:
    echo 1. Run 'npm run dev'
    echo 2. Open http://localhost:3000
    echo 3. Test each date filter option in the FilterPanel
    echo 4. Verify documents are filtered correctly according to DATE_FILTER_TEST_GUIDE.md
) else (
    echo ❌ Build failed. Please check the error messages above.
    exit /b 1
)
