# Project Context: AKA Gaming Portal

## Overview
Portal game edukasi berbasis web untuk anak-anak. Menggunakan Firebase sebagai backend untuk autentikasi, database, dan hosting.

## Tech Stack
- **Frontend**: HTML, CSS, Vanilla JavaScript (ES6+ module)
- **Backend**: Firebase (Auth, Firestore, Hosting)
- **Build Tools**: Node.js (firebase-admin, build-config.js)

## Struktur Project

```
aka-gaming/
├── index.html              # Homepage portal
├── admin.html              # Admin panel
├── .env                    # Firebase config (local only)
├── firebase-config.js      # Generated from .env
├── games/
│   ├── index.json         # Daftar ID game (semua game harus ada di sini)
│   └── [game-folder]/
│       ├── index.html     # Main game entry
│       ├── info.json      # Metadata game
│       ├── thumbnail.*    # Gambar preview (png/svg)
│       ├── script.js      # Logic game
│       └── style.css     # Styling
├── css/
│   └── style.css          # Global styles
└── firebase-config.js     # Auto-generated
```

## Cara Menambahkan Game Baru

### 1. Buat folder game
Buat folder baru di `games/[nama-game]/` dengan struktur:
```
games/[nama-game]/
├── index.html
├── info.json
├── script.js (atauNamaLain.js)
├── style.css
└── thumbnail.png atau .svg
```

### 2. Buat file info.json
```json
{
  "id": "nama-game",
  "name": "Nama Tampilan Game",
  "description": "Deskripsi singkat game",
  "category": "educational",  // atau "arcade", "puzzle", dll
  "badge": "new",             // opsional: "new", "hot", dll
  "gameFile": "index.html",
  "thumbnail": "thumbnail.png",
  "createdAt": "2026-05-05"
}
```

### 3. Tambahkan ke games/index.json
Tambahkan ID game ke array di `games/index.json`.

## Konvensi Nama File Game
- Gunakan lowercase dengan hyphen: `word-match-adventure`
- Hindari spasi dan karakter khusus
- Unique ID (tanpa duplikasi)

## info.json Fields

| Field | Wajib | Description |
|-------|-------|-------------|
| id | Ya | Unique identifier (sama dengan nama folder) |
| name | Ya | Nama yang ditampilkan di portal |
| description | Ya | Deskripsi singkat |
| category | Ya | Kategori: "educational", "arcade", "puzzle", "action" |
| badge | Tidak | Label khusus: "new", "hot" |
| gameFile | Ya | File HTML utama game |
| thumbnail | Ya | File thumbnail (png/svg), simpan di folder game |
| createdAt | Ya | Tanggal dibuat (format YYYY-MM-DD) |

## Kategori Game
- `educational` - Game edukasi (matematika, bahasa, dll)
- `arcade` - Game arcade klasik
- `puzzle` - Game puzzle/teka-teki
- `action` - Game aksi
- `adventure` - Game petualangan

## Integrasi Firebase
Game menggunakan Firebase SDK yang sudah di-config di `firebase-config.js`. Template ada di `.env.example`.

## Catatan Penting
- **JANGAN commit** file `.env` atau `firebase-config.js` ke repository
- Setiap game wajib punya `info.json` dengan format valid
- Thumbnail disarankan ukuran 300x200px
- Game harus responsive-friendly karena diakses anak-anak