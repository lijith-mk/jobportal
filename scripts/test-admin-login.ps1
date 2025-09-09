# Jobzee Admin Login Test Script
# This script tests the admin login functionality and displays admin dashboard data

Write-Host "Testing Jobzee Admin Login..." -ForegroundColor Green
Write-Host ""

# Admin credentials
$adminCredentials = @{
    userId = "admin123"
    password = "admin@123"
} | ConvertTo-Json

try {
    # Test admin login
    Write-Host "1. Testing admin login..." -ForegroundColor Yellow
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" -Method Post -Body $adminCredentials -ContentType "application/json"
    
    Write-Host "[SUCCESS] Admin login successful!" -ForegroundColor Green
    Write-Host "   Admin: $($loginResponse.admin.name) ($($loginResponse.admin.email))" -ForegroundColor Cyan
    Write-Host "   Role: $($loginResponse.admin.role)" -ForegroundColor Cyan
    Write-Host "   Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
    
    # Test admin dashboard
    Write-Host "2. Testing admin dashboard access..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $($loginResponse.token)"
        "Content-Type" = "application/json"
    }
    
    $dashboardData = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/dashboard" -Method Get -Headers $headers
    
    Write-Host "[SUCCESS] Dashboard access successful!" -ForegroundColor Green
    Write-Host "   Total Users: $($dashboardData.stats.totalUsers)" -ForegroundColor Cyan
    Write-Host "   Total Employers: $($dashboardData.stats.totalEmployers)" -ForegroundColor Cyan
    Write-Host "   Total Jobs: $($dashboardData.stats.totalJobs)" -ForegroundColor Cyan
    Write-Host "   Active Jobs: $($dashboardData.stats.activeJobs)" -ForegroundColor Cyan
    Write-Host ""
    
    # Test user management
    Write-Host "3. Testing user management access..." -ForegroundColor Yellow
    $usersData = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users?limit=3" -Method Get -Headers $headers
    
    Write-Host "[SUCCESS] User management access successful!" -ForegroundColor Green
    Write-Host "   Total Users: $($usersData.totalUsers)" -ForegroundColor Cyan
    Write-Host "   Recent Users:" -ForegroundColor Cyan
    $usersData.users | ForEach-Object { 
        Write-Host "   • $($_.name) ($($_.email))" -ForegroundColor White
    }
    Write-Host ""
    
    # Display admin permissions
    Write-Host "4. Admin Permissions:" -ForegroundColor Yellow
    $permissions = $loginResponse.admin.permissions
    Write-Host "   • User Management: $(if($permissions.userManagement){'[YES]'}else{'[NO]'})" -ForegroundColor White
    Write-Host "   • Employer Management: $(if($permissions.employerManagement){'[YES]'}else{'[NO]'})" -ForegroundColor White
    Write-Host "   • Job Management: $(if($permissions.jobManagement){'[YES]'}else{'[NO]'})" -ForegroundColor White
    Write-Host "   • Analytics: $(if($permissions.analytics){'[YES]'}else{'[NO]'})" -ForegroundColor White
    Write-Host "   • System Settings: $(if($permissions.systemSettings){'[YES]'}else{'[NO]'})" -ForegroundColor White
    Write-Host ""
    
    Write-Host "[SUCCESS] All admin tests passed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Admin Login Details:" -ForegroundColor Magenta
    Write-Host "   Endpoint: POST http://localhost:5000/api/admin/login" -ForegroundColor Gray
    Write-Host "   User ID: admin123" -ForegroundColor Gray
    Write-Host "   Password: admin@123" -ForegroundColor Gray
    Write-Host "   Token expires in: 24 hours" -ForegroundColor Gray
    
} catch {
    Write-Host "[ERROR] Error occurred:" -ForegroundColor Red
    Write-Host "$($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 'NotFound') {
        Write-Host ""
        Write-Host "Possible solutions:" -ForegroundColor Yellow
        Write-Host "   1. Make sure the server is running on port 5000" -ForegroundColor White
        Write-Host "   2. Initialize admin account by running: node jobzee-backend/scripts/initAdmin.js" -ForegroundColor White
        Write-Host "   3. Check if MongoDB is connected" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
