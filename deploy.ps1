$ErrorActionPreference = "Stop"

Write-Host "Initializing Git..."
git init

Write-Host "Adding files..."
git add .

Write-Host "Committing changes..."
git commit -m "Initial commit - Monetized Portfolio with Blog Refactor"

Write-Host "Renaming branch to main..."
git branch -M main

Write-Host "Adding remote origin..."
if (git remote get-url origin 2>$null) {
    git remote set-url origin https://github.com/Vivekpkd/Vivekpkd.github.io.git
} else {
    git remote add origin https://github.com/Vivekpkd/Vivekpkd.github.io.git
}

Write-Host "Pushing to GitHub..."
git push -u origin main

Write-Host "Deployment Complete!"
