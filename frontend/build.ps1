$env:NODE_ENV = "production"
Write-Host "Building frontend for production..."
Set-Location -Path "./frontend"
npm run build

Write-Host "Production build completed. Files are in the dist/ directory."
