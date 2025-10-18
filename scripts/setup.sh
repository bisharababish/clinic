#!/bin/bash
# Setup script for Bethlehem Medical Center

echo "🏥 Setting up Bethlehem Medical Center..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "  npm run dev"
echo ""
echo "🔧 Individual commands:"
echo "  npm run dev:frontend  # Frontend only"
echo "  npm run dev:backend   # Backend only"
echo "  npm run build         # Build both"
echo "  npm run test          # Run tests"





