# Pre-Med Election System - PowerShell API Test Helper
# Run this script to test all new endpoints

param(
    [string]$BaseUrl = "http://localhost:5000",
    [string]$DeveloperKey = "dev-key",
    [string]$AdminResetKey = "dev-reset-key"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pre-Med Election System API Test Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n[TEST 1] Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/health" -UseBasicParsing
    Write-Host "✅ Server is running" -ForegroundColor Green
    Write-Host "Response: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not running: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Get Voter Stats (Developer View)
Write-Host "`n[TEST 2] Get Voter Stats (Developer View)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest `
        -Uri "$BaseUrl/api/admin/stats" `
        -Headers @{"x-developer-key" = $DeveloperKey} `
        -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Got stats" -ForegroundColor Green
    Write-Host "Total Registered: $($data.summary.totalRegisteredVoters)" -ForegroundColor Green
    Write-Host "Total Verified: $($data.summary.totalVerified)" -ForegroundColor Green
    Write-Host "Total Voted: $($data.summary.totalVoted)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# Test 3: Get Pending Users
Write-Host "`n[TEST 3] Get Pending Users..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/admin/pending-users" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Got pending users" -ForegroundColor Green
    Write-Host "Count: $($data.count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# Test 4: Get Voting Progress
Write-Host "`n[TEST 4] Get Voting Progress..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/election/progress" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Got voting progress" -ForegroundColor Green
    Write-Host "Eligible: $($data.eligible)" -ForegroundColor Green
    Write-Host "Voted: $($data.totalVoted)" -ForegroundColor Green
    Write-Host "Progress: $($data.progressPercent)%" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# Test 5: Notification Status Check
Write-Host "`n[TEST 5] Check Notification Status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest `
        -Uri "$BaseUrl/api/notifications/status?userId=test-user-123" `
        -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Got notification status" -ForegroundColor Green
    Write-Host "Has Subscription: $($data.hasSubscription)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  User not found (expected for new system)" -ForegroundColor Yellow
}

# Test 6: Load Swagger Docs
Write-Host "`n[TEST 6] Swagger API Documentation" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api-docs" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Swagger UI is available at: $BaseUrl/api-docs" -ForegroundColor Green
        Write-Host "Open in browser to explore all endpoints" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Swagger not available: $_" -ForegroundColor Red
}

# Optional: Reset Database (Dev Only)
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Optional: Database Reset (Dev Only)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$shouldReset = Read-Host "Clear database and start fresh election? (yes/no)"
if ($shouldReset -eq "yes") {
    Write-Host "`nResetting database..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest `
            -Uri "$BaseUrl/api/admin/reset/hard" `
            -Method POST `
            -Headers @{"x-admin-key" = $AdminResetKey} `
            -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✅ Database reset successful" -ForegroundColor Green
        Write-Host "Cleared: $($data.clearedCollections -join ', ')" -ForegroundColor Green
    } catch {
        Write-Host "❌ Reset failed: $_" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "All tests completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
