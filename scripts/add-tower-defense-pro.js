#!/usr/bin/env node
// Run this on the VPS: node scripts/add-tower-defense-pro.js

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../service-account.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const GAMES_DIR = '/var/www/games';

async function addTowerDefensePro() {
  const gameId = 'tower-defense-pro';
  
  const gameData = {
    title: "Tower Defense Pro",
    description: "Defend your base with 4 unique towers! Archery, Cannon, Ice, and Magic towers with sprite animations.",
    prompt: "Create a tower defense game with multiple tower types, waves of enemies, and upgrade system",
    authorId: "hasanzuke@gmail.com",
    authorName: "AKA Gaming",
    status: "published",
    category: "strategy",
    emoji: "🗼",
    likes: 0,
    plays: 0,
    createdAt: Date.now(),
    publishedAt: Date.now()
  };

  try {
    // Add to Firestore
    await db.collection('games').doc(gameId).set(gameData);
    console.log('✅ Added to Firestore!');
    
    // Create game directory
    const gameDir = path.join(GAMES_DIR, gameId);
    if (!fs.existsSync(gameDir)) {
      fs.mkdirSync(gameDir, { recursive: true });
    }
    
    // Copy game files from /tmp/aka-games/tower-defense-pro/
    const sourceDir = '/tmp/aka-games/tower-defense-pro';
    if (fs.existsSync(sourceDir)) {
      fs.copyFileSync(path.join(sourceDir, 'index.html'), path.join(gameDir, 'index.html'));
      fs.copyFileSync(path.join(sourceDir, 'info.json'), path.join(gameDir, 'info.json'));
      fs.copyFileSync(path.join(sourceDir, 'thumbnail.svg'), path.join(gameDir, 'thumbnail.svg'));
      console.log('✅ Game files copied!');
    } else {
      console.log('️ Source files not found at', sourceDir);
      console.log('Please copy files manually to', gameDir);
    }
    
    console.log('🎮 Tower Defense Pro is ready!');
    console.log('Game URL: https://aka-gaming.web.id/game/' + gameId);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

addTowerDefensePro();