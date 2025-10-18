@echo off
echo 🏥 Setting up Bethlehem Medical Center...

echo 📦 Installing root dependencies...
npm install

echo 📦 Installing frontend dependencies...
cd frontend
npm install
cd ..

echo 📦 Installing backend dependencies...
cd backend
npm install
cd ..

echo ✅ Setup complete!
echo.
echo 🚀 To start development:
echo   npm run dev
echo.
echo 🔧 Individual commands:
echo   npm run dev:frontend  # Frontend only
echo   npm run dev:backend   # Backend only
echo   npm run build         # Build both
echo   npm run test          # Run tests
pause





