# Cara Set Admin Claim

Script ini digunakan untuk memberikan atau menghapus custom claim `admin` pada Firebase user.

## Setup (sekali saja)

```bash
# 1. Install dependencies
npm install firebase-admin

# 2. Download service account key
#    - Buka Firebase Console > Project Settings > Service Accounts
#    - Klik "Generate new private key"
#    - Simpan file JSON sebagai "service-account.json" di root project ini
#    - JANGAN commit file ini ke git! (sudah ada di .gitignore)
```

## Usage

### Tambah admin berdasarkan UID:
```bash
node set-admin-claim.js --uid <USER_UID>
```

### Tambah admin berdasarkan email:
```bash
node set-admin-claim.js --email user@example.com
```

### Hapus claim admin:
```bash
node set-admin-claim.js --uid <USER_UID> --remove
node set-admin-claim.js --email user@example.com --remove
```

## Contoh Output

```
✅ Firebase Admin SDK initialized

🔍 Mencari user dengan email: hasan@example.com
✅ User ditemukan, UID: abc123xyz

✅ Claim admin DITAMBAHKAN ke user:
   UID: abc123xyz
   Email: hasan@example.com
   Display Name: Hasan

⚠️  Note: User harus re-login agar claim baru berlaku di client.
```
