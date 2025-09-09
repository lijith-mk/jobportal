@echo off
echo Starting JobZee Backend Server...
cd jobzee-backend
echo.
echo ============================================
echo Starting server on http://localhost:5000
echo Health check: http://localhost:5000/api/health
echo ============================================
echo.
npm start
pause
