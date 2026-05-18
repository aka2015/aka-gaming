#!/usr/bin/env node
// ============================================================
//  Build script: Inject Firebase config from .env into firebase-config.js
//  Usage: node build-config.js
// ============================================================
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse .env file
function parseEnv(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const env = {};
    content.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    return env;
  } catch (e) {
    console.error('❌ Error reading .env file:', e.message);
    process.exit(1);
  }
}

// Load env
const envPath = resolve(__dirname, '.env');
const env = parseEnv(envPath);

// Validate required variables
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missing = requiredVars.filter(key => !env[key]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  console.error('\n📝 Please update your .env file with these values.');
  process.exit(1);
}

// Generate firebase-config.js
const configContent = `// ============================================================
// FIREBASE CONFIGURATION (Auto-generated from .env)
// ⚠️  JANGAN EDIT FILE INI SECARA MANUAL!
// Edit file: .env kemudian jalankan: npm run build:config
// ============================================================
const firebaseConfig = {
  apiKey: "${env.VITE_FIREBASE_API_KEY}",
  authDomain: "${env.VITE_FIREBASE_AUTH_DOMAIN}",
  projectId: "${env.VITE_FIREBASE_PROJECT_ID}",
  storageBucket: "${env.VITE_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${env.VITE_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${env.VITE_FIREBASE_APP_ID}",
  measurementId: "${env.VITE_FIREBASE_MEASUREMENT_ID || ''}"
};

export default firebaseConfig;
`;

const outputPath = resolve(__dirname, 'firebase-config.js');
writeFileSync(outputPath, configContent, 'utf-8');

console.log('✅ Firebase config generated successfully!');
console.log(`📄 Output: ${outputPath}`);
console.log('🔒 Remember: firebase-config.js is in .gitignore and won\'t be committed.');
