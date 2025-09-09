param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "restart", "status", "logs")]
    [string]$Action = "status"
)

$BackendJobName = "JobzeeBackend"
$BackendPath = "C:\Users\lijit\Desktop\jobzee\jobzee-backend"
$ServerUrl = "http://localhost:5000"

function Show-Header {
    Write-Host ""
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "    JobZee Backend Server Manager" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Start-BackendServer {
    $existingJob = Get-Job -Name $BackendJobName -ErrorAction SilentlyContinue
    
    if ($existingJob -and $existingJob.State -eq "Running") {
        Write-Host "✅ Backend server is already running!" -ForegroundColor Green
        return
    }
    
    if ($existingJob) {
        Remove-Job -Name $BackendJobName -Force
    }
    
    Write-Host "🚀 Starting backend server..." -ForegroundColor Green
    
    $job = Start-Job -ScriptBlock {
        param($path)
        Set-Location $path
        node index.js
    } -ArgumentList $BackendPath -Name $BackendJobName
    
    Start-Sleep 3
    
    try {
        $healthCheck = Invoke-WebRequest -Uri "$ServerUrl/api/health" -UseBasicParsing -TimeoutSec 10
        if ($healthCheck.StatusCode -eq 200) {
            Write-Host "✅ Backend server started successfully!" -ForegroundColor Green
            Write-Host "   📍 Server URL: $ServerUrl" -ForegroundColor Yellow
            Write-Host "   🏥 Health check: $ServerUrl/api/health" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Server starting... (health check failed, but this is normal)" -ForegroundColor Yellow
    }
}

function Stop-BackendServer {
    $existingJob = Get-Job -Name $BackendJobName -ErrorAction SilentlyContinue
    
    if ($existingJob) {
        Write-Host "🛑 Stopping backend server..." -ForegroundColor Yellow
        Stop-Job -Name $BackendJobName -ErrorAction SilentlyContinue
        Remove-Job -Name $BackendJobName -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Backend server stopped!" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Backend server is not running." -ForegroundColor Blue
    }
}

function Show-ServerStatus {
    $existingJob = Get-Job -Name $BackendJobName -ErrorAction SilentlyContinue
    
    Write-Host "📊 Backend Server Status:" -ForegroundColor Cyan
    Write-Host "─────────────────────────" -ForegroundColor Cyan
    
    if ($existingJob) {
        Write-Host "   Job Status: $($existingJob.State)" -ForegroundColor Yellow
        Write-Host "   Start Time: $($existingJob.PSBeginTime)" -ForegroundColor Yellow
        
        if ($existingJob.State -eq "Running") {
            try {
                $healthCheck = Invoke-WebRequest -Uri "$ServerUrl/api/health" -UseBasicParsing -TimeoutSec 5
                $healthData = $healthCheck.Content | ConvertFrom-Json
                
                Write-Host "   🟢 Server: Online" -ForegroundColor Green
                Write-Host "   🟢 Database: $($healthData.database.status)" -ForegroundColor Green
                Write-Host "   ⏱️  Uptime: $([math]::Round($healthData.server.uptime, 2)) seconds" -ForegroundColor Yellow
                Write-Host "   📡 URL: $ServerUrl" -ForegroundColor Yellow
            } catch {
                Write-Host "   🔴 Server: Not responding" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "   🔴 Server: Not running" -ForegroundColor Red
    }
    
    # Check if port 5000 is in use
    $portCheck = netstat -ano | findstr ":5000"
    if ($portCheck) {
        Write-Host "   📡 Port 5000: In use" -ForegroundColor Green
    } else {
        Write-Host "   📡 Port 5000: Available" -ForegroundColor Red
    }
}

function Show-ServerLogs {
    $existingJob = Get-Job -Name $BackendJobName -ErrorAction SilentlyContinue
    
    if ($existingJob) {
        Write-Host "📋 Backend Server Logs:" -ForegroundColor Cyan
        Write-Host "──────────────────────" -ForegroundColor Cyan
        
        $output = Receive-Job -Name $BackendJobName -Keep
        if ($output) {
            $output | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        } else {
            Write-Host "   No logs available." -ForegroundColor Gray
        }
    } else {
        Write-Host "ℹ️  Backend server is not running - no logs available." -ForegroundColor Blue
    }
}

function Restart-BackendServer {
    Write-Host "🔄 Restarting backend server..." -ForegroundColor Yellow
    Stop-BackendServer
    Start-Sleep 2
    Start-BackendServer
}

# Main execution
Show-Header

switch ($Action) {
    "start" {
        Start-BackendServer
    }
    "stop" {
        Stop-BackendServer
    }
    "restart" {
        Restart-BackendServer
    }
    "status" {
        Show-ServerStatus
    }
    "logs" {
        Show-ServerLogs
    }
    default {
        Show-ServerStatus
    }
}

Write-Host ""
Write-Host "Usage examples:" -ForegroundColor Gray
Write-Host "  .\manage-backend.ps1 start    # Start the server" -ForegroundColor Gray
Write-Host "  .\manage-backend.ps1 stop     # Stop the server" -ForegroundColor Gray  
Write-Host "  .\manage-backend.ps1 restart  # Restart the server" -ForegroundColor Gray
Write-Host "  .\manage-backend.ps1 status   # Check server status" -ForegroundColor Gray
Write-Host "  .\manage-backend.ps1 logs     # View server logs" -ForegroundColor Gray
Write-Host ""
