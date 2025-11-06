param(
    [Parameter(Mandatory = $true)][string] $BaseUrl,
    [string] $OutPath = "docs/_cache/sitemap.xml"
)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $here '..')
$dest = Join-Path $root $OutPath
$destDir = Split-Path -Parent $dest
if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
$uri = ($BaseUrl.TrimEnd('/') + '/sitemap.xml')
Write-Host "Fetching: $uri" -ForegroundColor Cyan
Invoke-WebRequest -Uri $uri -OutFile $dest
Write-Host "Saved sitemap to: $dest" -ForegroundColor Green
