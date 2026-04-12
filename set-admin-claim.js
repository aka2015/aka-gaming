/**
 * Script untuk set custom claim admin pada Firebase user.
 * 
 * Usage:
 *   node set-admin-claim.js --uid USER_UID
 *   node set-admin-claim.js --email user@example.com
 *   node set-admin-claim.js --uid USER_UID --remove
 * 
 * Requirements:
 *   1. npm install firebase-admin dotenv
 *   2. Set FIREBASE_SERVICE_ACCOUNT_PATH atau taruh service-account.json di root project
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---- Parse CLI arguments ----
const args = process.argv.slice(2);
const argMap = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    argMap[args[i].slice(2)] = args[i + 1];
    i++;
  }
}

const { uid, email, remove } = argMap;

if (!uid && !email) {
  console.error('❌ Error: Harus specify --uid atau --email');
  console.log('\nUsage:');
  console.log('  node set-admin-claim.js --uid <USER_UID>');
  console.log('  node set-admin-claim.js --email <user@example.com>');
  console.log('  node set-admin-claim.js --uid <USER_UID> --remove');
  process.exit(1);
}

// ---- Initialize Firebase Admin SDK ----
function initializeAdmin() {
  const serviceAccountPath = join(__dirname, 'service-account.json');

  try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized');
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('❌ File service-account.json tidak ditemukan di:', serviceAccountPath);
      console.error('\nCara setup:');
      console.error('1. Buka Firebase Console > Project Settings > Service Accounts');
      console.error('2. Klik "Generate new private key"');
      console.error('3. Simpan sebagai service-account.json di root project');
    } else {
      console.error('❌ Gagal initialize Firebase Admin:', err.message);
    }
    return false;
  }
}

// ---- Main logic ----
async function setAdminClaim() {
  const initialized = initializeAdmin();
  if (!initialized) process.exit(1);

  try {
    let targetUid = uid;

    // Kalau yang dikasih email, cari UID-nya dulu
    if (email && !uid) {
      console.log(`\n🔍 Mencari user dengan email: ${email}`);
      const userRecord = await admin.auth().getUserByEmail(email);
      targetUid = userRecord.uid;
      console.log(`✅ User ditemukan, UID: ${targetUid}`);
    }

    // Get current user data
    const userRecord = await admin.auth().getUser(targetUid);
    const currentClaims = userRecord.customClaims || {};

    if (remove) {
      // Remove admin claim
      if (!currentClaims.admin) {
        console.log('ℹ️ User ini sudah tidak punya claim admin.');
        process.exit(0);
      }

      await admin.auth().setCustomUserClaims(targetUid, { admin: null });
      console.log(`\n✅ Claim admin DIHAPUS dari user:`);
      console.log(`   UID: ${targetUid}`);
      console.log(`   Email: ${userRecord.email}`);
      console.log(`   Display Name: ${userRecord.displayName || '-'}`);
    } else {
      // Add admin claim
      if (currentClaims.admin) {
        console.log('ℹ️ User ini sudah punya claim admin.');
        process.exit(0);
      }

      await admin.auth().setCustomUserClaims(targetUid, { admin: true });
      console.log(`\n✅ Claim admin DITAMBAHKAN ke user:`);
      console.log(`   UID: ${targetUid}`);
      console.log(`   Email: ${userRecord.email}`);
      console.log(`   Display Name: ${userRecord.displayName || '-'}`);
    }

    console.log('\n⚠️  Note: User harus re-login agar claim baru berlaku di client.');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Error:', err.message);

    if (err.code === 'auth/user-not-found') {
      console.error('User tidak ditemukan. Cek ulang UID/email.');
    } else if (err.code === 'auth/insufficient-permission') {
      console.error('Service account tidak punya permission yang cukup.');
    }

    process.exit(1);
  }
}

setAdminClaim();
