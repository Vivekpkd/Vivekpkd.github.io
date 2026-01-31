$ErrorActionPreference = "Continue"

Write-Host "Initializing Git..."
git init

Write-Host "Adding files..."
git add .

Write-Host "Committing changes..."
git commit -m "Initial commit - Monetized Portfolio with Blog Refactor"

Write-Host "Renaming branch to main..."
git branch -M main

Write-Host "Configuring remote..."
# Try to remove it first (suppressing error if it doesn't exist)
git remote remove origin *>$null
# Add fresh
git remote add origin https://github.com/Vivekpkd/Vivekpkd.github.io.git

Write-Host "Pushing to GitHub..."
git push -u origin main
