Write-Host "🚀 Starting JobZee Backend Server..." -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
Set-Location .\jobzee-backend

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Server will start on: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Health check: http://localhost:5000/api/health" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "🔥 Starting server..." -ForegroundColor Green
Write-Host ""

# Start the server
Start-Process -NoNewWindow -Wait -FilePath "npm" -ArgumentList "start"

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
