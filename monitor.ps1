# Simple Health Monitoring Script for Windows
# Usage: .\monitor.ps1 -Url "http://localhost:5000" -Interval 30

param(
    [string]$Url = "http://localhost:5000",
    [int]$Interval = 30
)

$HealthEndpoint = "$Url/api/health"

Write-Host "🏥 Starting health monitor for: $HealthEndpoint" -ForegroundColor Cyan
Write-Host "📊 Checking every $Interval seconds" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "---"

while ($true) {
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    try {
        $Response = Invoke-WebRequest -Uri $HealthEndpoint -TimeoutSec 10 -UseBasicParsing
        $StatusCode = $Response.StatusCode
        $Body = $Response.Content | ConvertFrom-Json
        
        if ($StatusCode -eq 200) {
            $HeapUsed = $Body.memory.heapUsed
            $Rss = $Body.memory.rss
            
            Write-Host "[$Timestamp] ✅ OK | Heap: ${HeapUsed}MB | RSS: ${Rss}MB" -ForegroundColor Green
            
            # Warning thresholds
            if ($HeapUsed -gt 200) {
                Write-Host "  ⚠️  WARNING: High heap usage (${HeapUsed}MB > 200MB)" -ForegroundColor Yellow
            }
            if ($Rss -gt 400) {
                Write-Host "  🚨 CRITICAL: High RSS (${Rss}MB > 400MB)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "[$Timestamp] ⚠️  ERROR | Status: $StatusCode" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "[$Timestamp] ❌ UNREACHABLE | Endpoint: $HealthEndpoint" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds $Interval
}
