param(
    [int] $Port = 5173
)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Join-Path $here '..'
Set-Location $root
Write-Host "Starting http-server on port $Port serving ./" -ForegroundColor Cyan
npx --yes http-server '.' -p $Port -c-1
