#!/bin/bash

echo "🏦 Policy Document Q&A System - Enhanced with RAG"
echo "================================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ and try again"
    exit 1
fi

echo "✅ Python and Node.js are installed"
echo ""

# Setup RAG service if not already done
if [ ! -d "rag-service/venv" ]; then
    echo "🔧 Setting up RAG service..."
    cd rag-service
    chmod +x setup.sh
    ./setup.sh
    cd ..
    echo ""
fi

# Setup frontend if not already done
if [ ! -d "frontend/node_modules" ]; then
    echo "🔧 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo ""
fi

# Check for environment files
if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️ Frontend environment file not found"
    echo "Please copy frontend/.env.example to frontend/.env.local"
    echo "and add your Gemini API key"
    echo ""
fi

echo "🚀 Starting services..."
echo ""

# Start RAG service in background
echo "Starting RAG service..."
cd rag-service
source venv/bin/activate
python main.py &
RAG_PID=$!
cd ..

# Wait for RAG service to start
echo "Waiting for RAG service to start..."
sleep 5

# Initialize documents
echo "Initializing RAG documents..."
cd rag-service
source venv/bin/activate
python initialize_documents.py
cd ..

# Wait a moment
sleep 3

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Services are running!"
echo ""
echo "📡 RAG Service: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo 'Stopping services...'; kill $RAG_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Keep script running
while true; do
    sleep 1
done
