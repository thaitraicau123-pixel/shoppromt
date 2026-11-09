<#
.SYNOPSIS
    1-Command Health, Security & Build Verification Suite for PromptMMO / Bui Thai AI Studio
#>
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Set-Location "C:\Users\admin\.gemini\antigravity\scratch\onthi-hub"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[PROMPTMMO / BUI THAI STUDIO] VERIFICATION GATE" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Check Required Assets
Write-Host "`n[1/2] Checking Required Assets..." -ForegroundColor Yellow
$required = @("index.html", "favicon.svg", "manifest.json", "sw.js", "cloud-db.json", "build.cjs", "js\app.js", "js\state.js", "js\data.js")
foreach ($f in $required) {
    if (-not (Test-Path $f)) {
        Write-Error "Missing required asset: $f"
        exit 1
    }
}
Write-Host "   [PASS] All essential assets and scripts verified." -ForegroundColor Green

# Step 2: Run Production Build
Write-Host "`n[2/2] Running Production Build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "   [FAIL] Production build failed!"
    exit 1
}

if (-not (Test-Path "dist\index.html") -or -not (Test-Path "dist\js\app.js")) {
    Write-Error "   [FAIL] dist folder missing output files!"
    exit 1
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] 100% CHECKS PASSED! READY FOR VERCEL DEPLOY." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
