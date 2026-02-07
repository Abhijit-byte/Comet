# Cosmic Watch API Testing Script - Windows PowerShell
# Complete test suite for all Next.js API endpoints
# Run: .\test-api.ps1

Write-Host "Cosmic Watch API Testing Suite" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$token = $null
$refresh = $null
$testsPassed = 0
$testsFailed = 0

# Test 1: Login
Write-Host "[TEST 1] Login - Obtain JWT Tokens" -ForegroundColor Yellow
try {
    $body = @{ email = "test@cosmic.watch"; password = "TestPass123" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    $token = $response.access
    $refresh = $response.refresh
    Write-Host "SUCCESS: Login successful" -ForegroundColor Green
    Write-Host "  User: $($response.user.email)" -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 2: Get User Profile
Write-Host "`n[TEST 2] Get Current User Profile" -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $user = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
    Write-Host "SUCCESS: Profile retrieved" -ForegroundColor Green
    Write-Host "  Username: $($user.username)" -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 3: List Asteroids
Write-Host "`n[TEST 3] List Asteroids (7 days)" -ForegroundColor Yellow
try {
    $asteroids = Invoke-RestMethod -Uri "$baseUrl/api/asteroids"
    Write-Host "SUCCESS: Retrieved $($asteroids.Count) asteroids" -ForegroundColor Green
    if ($asteroids.Count -gt 0) {
        Write-Host "  First: $($asteroids[0].name)" -ForegroundColor Gray
    }
    $testsPassed++
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 4: Search Asteroid
Write-Host "`n[TEST 4] Search for Apophis" -ForegroundColor Yellow
try {
    $search = Invoke-RestMethod -Uri "$baseUrl/api/search-asteroid?q=Apophis"
    Write-Host "SUCCESS: Search completed - $($search.total) results" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 5: Dashboard Stats
Write-Host "`n[TEST 5] Get Dashboard Statistics" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/stats"
    Write-Host "SUCCESS: Statistics retrieved" -ForegroundColor Green
    Write-Host "  Total Tracked: $($stats.total_asteroids_tracked)" -ForegroundColor Gray
    Write-Host "  Hazardous: $($stats.hazardous_asteroids_count)" -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 6: Chat API
Write-Host "`n[TEST 6] Chat - Ask about asteroids" -ForegroundColor Yellow
try {
    $chatBody = @{ messages = @( @{ role = "user"; content = "hello" } ) } | ConvertTo-Json -Depth 3
    $chatResponse = Invoke-RestMethod -Uri "$baseUrl/api/chat" -Method Post -Body $chatBody -ContentType "application/json"
    Write-Host "SUCCESS: Chat response received" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 7: Refresh Token
Write-Host "`n[TEST 7] Refresh Access Token" -ForegroundColor Yellow
try {
    $refreshBody = @{ refresh = $refresh } | ConvertTo-Json
    $newToken = Invoke-RestMethod -Uri "$baseUrl/api/auth/refresh" -Method Post -Body $refreshBody -ContentType "application/json"
    Write-Host "SUCCESS: Token refreshed" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 8: Asteroid Lookup
Write-Host "`n[TEST 8] Asteroid Lookup by Name" -ForegroundColor Yellow
try {
    $asteroid = Invoke-RestMethod -Uri "$baseUrl/api/asteroid-lookup?name=Bennu"
    Write-Host "SUCCESS: Lookup completed" -ForegroundColor Green
    Write-Host "  Name: $($asteroid.name)" -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 9: Logout
Write-Host "`n[TEST 9] Logout - Terminate Session" -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $logoutResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/logout" -Method Post -Headers $headers -Body "{}" -ContentType "application/json"
    Write-Host "SUCCESS: Logout completed" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    $testsFailed++
}

# Summary
Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Results:" -ForegroundColor White
Write-Host "  Passed: $testsPassed" -ForegroundColor Green
Write-Host "  Failed: $testsFailed" -ForegroundColor Red
$total = $testsPassed + $testsFailed
if ($total -gt 0) {
    $successRate = [math]::Round(($testsPassed / $total) * 100, 2)
    Write-Host "  Success Rate: $successRate%" -ForegroundColor Cyan
}
Write-Host ""
if ($testsFailed -eq 0) {
    Write-Host "All tests passed! API is fully functional." -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Check error messages above." -ForegroundColor Yellow
}
Write-Host "=================================" -ForegroundColor Cyan
