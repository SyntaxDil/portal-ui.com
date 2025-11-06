$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Join-Path $here '..'
$dist = Join-Path $root 'dist'
if (Test-Path $dist) { Remove-Item -Recurse -Force $dist }
New-Item -ItemType Directory -Path $dist | Out-Null

# Copy only public assets from the flattened structure
Copy-Item -Force (Join-Path $root 'index.html') $dist
if (Test-Path (Join-Path $root '404.html')) {
    Copy-Item -Force (Join-Path $root '404.html') $dist
}
if (Test-Path (Join-Path $root 'assets')) {
    Copy-Item -Recurse -Force (Join-Path $root 'assets') (Join-Path $dist 'assets')
}
Write-Host "Built placeholder to: $dist" -ForegroundColor Green
