#!/bin/bash
# Full deployment script for Tower Defense Pro
# Run this locally: bash deploy-full.sh

set -e

echo "🚀 Full Deployment: Tower Defense Pro"

# 1. Build the app
echo " Building app..."
npm run build

# 2. Copy game files to VPS via scp
echo " Copying game files to VPS..."
scp -r /tmp/aka-games/tower-defense-pro root@aka-gaming.web.id:/tmp/aka-games/

# 3. Copy deployment script to VPS
scp scripts/deploy-tdp.sh root@aka-gaming.web.id:/opt/aka-gaming/

# 4. SSH to VPS and run deployment
echo " Deploying on VPS..."
ssh root@aka-gaming.web.id "cd /opt/aka-gaming && bash deploy-tdp.sh"

# 5. Restart PM2
echo " Restarting PM2..."
ssh root@aka-gaming.web.id "pm2 restart aka-gaming"

echo " Deployment complete!"
echo " Game URL: https://aka-gaming.web.id/game/tower-defense-pro"