$env:NODE_ENV = "production"
Write-Host "Starting backend in production mode..."
Set-Location -Path "./backend"
npm start
