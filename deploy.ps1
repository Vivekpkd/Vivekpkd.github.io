$ErrorActionPreference = "Continue"

Write-Host "Running Build Script..."
python build.py

Write-Host "Initializing Git..."
git init

Write-Host "Adding files..."
git add .

Write-Host "Committing changes..."
git commit -m "Automotive Content Pivot - 14 Articles"

Write-Host "Renaming branch to main..."
git branch -M main

Write-Host "Configuring remote..."
git remote remove origin *>$null
git remote add origin https://github.com/Vivekpkd/Vivekpkd.github.io.git

Write-Host "Pushing to GitHub (Forced)..."
git push -u origin main --force
