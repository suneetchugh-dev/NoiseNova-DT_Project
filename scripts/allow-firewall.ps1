# Open the Noise Nova hub port to phones on the same Wi-Fi.
#
# Windows only allows inbound traffic on Private networks by default, so a phone
# can see the laptop and still time out on port 8787. This adds one idempotent
# rule. Run it once:  npm run firewall   (it will ask for elevation)

$ErrorActionPreference = "Stop"
$port = if ($env:PORT) { [int]$env:PORT } else { 8787 }
$name = "Noise Nova hub ($port)"

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)

if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host "Elevation required - reopening in an administrator window..." -ForegroundColor Yellow
  $args = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
  Start-Process powershell -Verb RunAs -ArgumentList $args
  exit
}

$existing = Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Rule already present: $name" -ForegroundColor Green
} else {
  New-NetFirewallRule `
    -DisplayName $name `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort $port `
    -Profile Private `
    -Description "Allows Noise Nova phone nodes to reach the hub on the local network." | Out-Null
  Write-Host "Added inbound rule: TCP $port (Private networks only)" -ForegroundColor Green
}

$address = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
  Select-Object -First 1 -ExpandProperty IPAddress

if ($address) {
  Write-Host ""
  Write-Host "Pair a phone with:  $address`:$port" -ForegroundColor Cyan
} else {
  Write-Host "No LAN IPv4 address found - are you connected to Wi-Fi?" -ForegroundColor Yellow
}
