# AKA GAMING 🎮

Portal game seru untuk anak-anak dengan fitur:
- 🎮 Daftar game yang bisa dimainkan langsung di browser
- 🔐 Login dengan Google Account
- 💬 Sistem komentar pada setiap game
- 🔍 Pencarian dan filter berdasarkan kategori
- 👨‍💼 Panel admin untuk mengelola game dan komentar

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Setup Firebase Configuration
```bash
npm run setup:env
# Edit file .env dengan config Firebase kamu
npm run build:config
```

📖 **Panduan lengkap**: Lihat [SETUP.md](SETUP.md)

### 3. Jalankan aplikasi
```bash
# Dengan Python
python3 -m http.server 8080

# Atau dengan Node.js
npx serve .
```

Lalu buka browser: `http://localhost:8080`

## 📁 Struktur Project
```
aka-gaming/
├── index.html          ← Halaman utama portal
├── game.html           ← Halaman main game + komentar
├── admin.html          ← Panel admin
├── .env                ← Firebase config (JANGAN COMMIT!)
├── firebase-config.js  ← Auto-generated (JANGAN COMMIT!)
├── games/              ← Folder game
│   └── index.json      ← Daftar game ID
├── css/                ← Stylesheet
└── js/                 ← JavaScript modules
```

## 🔒 Keamanan Firebase

Config Firebase disimpan di file `.env` yang **tidak akan ter-commit ke Git**. File `firebase-config.js` di-generate otomatis dan juga di-ignore oleh Git.

⚠️ **Penting**: Jangan pernah commit file `.env` atau `firebase-config.js` ke repository publik!

## 🛠️ Scripts

- `npm run setup:env` - Membuat file .env dari template
- `npm run build:config` - Generate firebase-config.js dari .env

## 📖 Lisensi

Project ini dibuat untuk tujuan edukasi.
