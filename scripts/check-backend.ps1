Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "     JobZee Backend Status Check" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check PowerShell job
$job = Get-Job -Name "JobzeeBackend" -ErrorAction SilentlyContinue
if ($job) {
    Write-Host "Job Status: $($job.State)" -ForegroundColor Green
    Write-Host "Started: $($job.PSBeginTime)" -ForegroundColor Yellow
} else {
    Write-Host "Job Status: Not Found" -ForegroundColor Red
}

# Check port
$port = netstat -ano | findstr ":5000"
if ($port) {
    Write-Host "Port 5000: Active" -ForegroundColor Green
} else {
    Write-Host "Port 5000: Not Active" -ForegroundColor Red
}

# Check health endpoint
try {
    $health = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "Health Check: OK (Status: $($health.StatusCode))" -ForegroundColor Green
    
    $data = $health.Content | ConvertFrom-Json
    Write-Host "Database: $($data.database.status)" -ForegroundColor Green
    Write-Host "Uptime: $([math]::Round($data.server.uptime, 2)) seconds" -ForegroundColor Yellow
} catch {
    Write-Host "Health Check: Failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "Server URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Admin Panel: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
