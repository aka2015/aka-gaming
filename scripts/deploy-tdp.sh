#!/bin/bash
# Deploy Tower Defense Pro to VPS
# Run this on the VPS: bash deploy-tdp.sh

set -e

echo "🚀 Deploying Tower Defense Pro..."

# 1. Create game directory
mkdir -p /var/www/games/tower-defense-pro

# 2. Copy game files from /tmp/aka-games/tower-defense-pro/
if [ -d "/tmp/aka-games/tower-defense-pro" ]; then
  cp /tmp/aka-games/tower-defense-pro/index.html /var/www/games/tower-defense-pro/
  cp /tmp/aka-games/tower-defense-pro/info.json /var/www/games/tower-defense-pro/
  cp /tmp/aka-games/tower-defense-pro/thumbnail.svg /var/www/games/tower-defense-pro/
  echo "✅ Game files copied!"
else
  echo "❌ Source files not found at /tmp/aka-games/tower-defense-pro/"
  echo "Please copy files manually to /var/www/games/tower-defense-pro/"
  exit 1
fi

# 3. Add game to Firestore using Node.js script
cd /opt/aka-gaming
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const gameData = {
  title: 'Tower Defense Pro',
  description: 'Defend your base with 4 unique towers! Archery, Cannon, Ice, and Magic towers with sprite animations.',
  prompt: 'Create a tower defense game with multiple tower types, waves of enemies, and upgrade system',
  authorId: 'hasanzuke@gmail.com',
  authorName: 'AKA Gaming',
  status: 'published',
  category: 'strategy',
  emoji: '🗼',
  likes: 0,
  plays: 0,
  createdAt: Date.now(),
  publishedAt: Date.now()
};

db.collection('games').doc('tower-defense-pro').set(gameData)
  .then(() => {
    console.log('✅ Added to Firestore!');
    console.log('🎮 Game URL: https://aka-gaming.web.id/game/tower-defense-pro');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
"

echo " Tower Defense Pro deployed successfully!"