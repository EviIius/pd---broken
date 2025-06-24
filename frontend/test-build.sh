#!/bin/bash

# Simple test script to verify the application builds correctly
# Run this from the frontend directory

echo "Testing Next.js build..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Run this script from the frontend directory."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if the build succeeds
echo "Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! The application should work correctly."
    echo ""
    echo "📋 To test date filters manually:"
    echo "1. Run 'npm run dev'"
    echo "2. Open http://localhost:3000"
    echo "3. Test each date filter option in the FilterPanel"
    echo "4. Verify documents are filtered correctly according to DATE_FILTER_TEST_GUIDE.md"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
