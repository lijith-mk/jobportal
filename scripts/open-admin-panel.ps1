# JobZee Admin Panel Launcher
# This script opens the admin panel in your default browser

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "    JOBZEE ADMIN PANEL LAUNCHER" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if frontend is running
$frontendRunning = $false
$backendRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    $frontendRunning = $true
    Write-Host "[SUCCESS] Frontend is running on port 3000" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Frontend is not running on port 3000" -ForegroundColor Yellow
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/admin/init" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    $backendRunning = $true
    Write-Host "[SUCCESS] Backend is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Backend is not running on port 5000" -ForegroundColor Yellow
}

Write-Host ""

if ($frontendRunning -and $backendRunning) {
    Write-Host "🎉 EVERYTHING IS READY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Admin Credentials:" -ForegroundColor Cyan
    Write-Host "  User ID: admin123" -ForegroundColor White
    Write-Host "  Password: admin@123" -ForegroundColor White
    Write-Host ""
    Write-Host "Opening admin panel in your browser..." -ForegroundColor Yellow
    
    # Open admin login page
    Start-Process "http://localhost:3000/admin/login"
    
    Write-Host ""
    Write-Host "🌟 Admin panel opened in browser!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Available URLs:" -ForegroundColor Cyan
    Write-Host "  🔐 Admin Login: http://localhost:3000/admin/login" -ForegroundColor Gray
    Write-Host "  📊 Admin Dashboard: http://localhost:3000/admin/dashboard" -ForegroundColor Gray
    Write-Host "  🏠 Main Website: http://localhost:3000/" -ForegroundColor Gray
    
} elseif (!$frontendRunning) {
    Write-Host "❌ Frontend is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start the frontend:" -ForegroundColor Yellow
    Write-Host "1. Open a new terminal" -ForegroundColor White
    Write-Host "2. Run: cd jobzee-frontend" -ForegroundColor White  
    Write-Host "3. Run: npm start" -ForegroundColor White
    
} elseif (!$backendRunning) {
    Write-Host "❌ Backend is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start the backend:" -ForegroundColor Yellow
    Write-Host "1. Open a new terminal" -ForegroundColor White
    Write-Host "2. Run: cd jobzee-backend" -ForegroundColor White
    Write-Host "3. Run: npm start" -ForegroundColor White
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
