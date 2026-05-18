# AKA GAMING Portal — Panduan Setup

## Langkah 1: Buat Project Firebase

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Klik **Add project** → beri nama (misal: `aka-gaming`)
3. Aktifkan Google Analytics (opsional) → klik **Create project**

---

## Langkah 2: Daftarkan Web App

1. Di dashboard project, klik ikon **</>** (Web)
2. Beri nama app → klik **Register app**
3. **Salin seluruh `firebaseConfig`** yang muncul

---

## Langkah 3: Konfigurasi Firebase (AMAN!) 🔒

Kami menggunakan sistem environment variables agar config Firebase **tidak terekspos di Git**.

### Cara setup:

1. **Copy file .env.example menjadi .env**
   ```bash
   npm run setup:env
   ```

2. **Edit file `.env`** dan isi dengan config Firebase kamu:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Generate file firebase-config.js**
   ```bash
   npm run build:config
   ```

✅ **Selesai!** File `firebase-config.js` akan otomatis dibuat dan **tidak akan ter-commit ke Git** (sudah ada di `.gitignore`).

---

### ⚠️ Penting saat publish ke website:

- File `.env` dan `firebase-config.js` **TIDAK BOLEH** di-upload ke repository
- Saat deploy ke hosting, pastikan:
  - **Vercel/Netlify**: Upload file `.env` atau set environment variables di dashboard
  - **Firebase Hosting**: Jalankan `npm run build:config` sebelum deploy
  - **Static hosting biasa**: Pastikan `firebase-config.js` ada di folder deploy (tapi jangan commit ke Git)

---

## Langkah 4: Aktifkan Authentication

1. Menu kiri: **Authentication** → **Get started**
2. Tab **Sign-in method** → aktifkan **Google**
3. Pilih **Project support email** → **Save**

---

## Langkah 5: Buat Firestore Database

1. Menu kiri: **Firestore Database** → **Create database**
2. Pilih **Start in test mode** (untuk development)
3. Pilih region terdekat → **Enable**

### Security Rules (untuk production):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Games: siapa saja bisa baca, hanya admin yang bisa tulis
    match /games/{gameId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email in ['admin@example.com'];
    }
    // Comments: user login bisa baca & tulis, admin bisa hapus
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth != null
                    && request.auth.token.email in ['admin@example.com'];
    }
  }
}
```

---

## Langkah 6: Aktifkan Firebase Storage

1. Menu kiri: **Storage** → **Get started**
2. Pilih **Start in test mode** → **Done**

### Storage Rules (untuk production):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email in ['admin@example.com'];
    }
  }
}
```

---

## Langkah 7: Set Admin Email

Buka `js/admin.js`, cari baris:

```js
const ADMIN_EMAILS = [
  "admin@example.com",
];
```

Ganti dengan email Google akun admin kamu.

---

## Langkah 8: Jalankan Aplikasi

Karena menggunakan ES Modules (import), file harus dijalankan dari **HTTP server**, bukan file `file://`.

### Cara mudah dengan VS Code:
- Install ekstensi **Live Server**
- Klik kanan `index.html` → **Open with Live Server**

### Cara dengan Python:
```bash
cd game-portal
python3 -m http.server 8080
# Buka browser: http://localhost:8080
```

### Cara dengan Node.js:
```bash
npx serve .
```

---

## Struktur File

```
aka-gaming/
├── index.html          ← Halaman utama portal
├── game.html           ← Halaman main game + komentar
├── admin.html          ← Panel admin
├── .env                ← Firebase config (JANGAN COMMIT!)
├── .env.example        ← Template .env
├── firebase-config.js  ← Auto-generated (JANGAN COMMIT!)
├── package.json        ← NPM scripts
├── build-config.js     ← Script build config
├── css/
│   ├── style.css       ← Style utama (portal + game)
│   └── admin.css       ← Style khusus admin
├── js/
│   ├── firebase.js     ← Inisialisasi Firebase (import config)
│   ├── app.js          ← Logic halaman utama
│   ├── game.js         ← Logic halaman game
│   └── admin.js        ← Logic admin panel
└── games/
    └── index.json      ← Daftar game ID
```

---

## Fitur Aplikasi

### Halaman Portal (index.html)
- Grid game dengan thumbnail
- Filter by kategori (Puzzle, Aksi, Edukasi, dll)
- Pencarian game
- Login Google (wajib untuk main)

### Halaman Game (game.html)
- Game dimainkan via `<iframe>`
- Tombol fullscreen
- Sistem komentar (dengan pagination)
- Hanya user login yang bisa berkomentar

### Admin Panel (admin.html)
- Dashboard (statistik total game & komentar)
- Upload game (drag & drop thumbnail + file HTML)
- Kelola game (edit/hapus)
- Moderasi komentar

---

## Tips Upload Game HTML

- Game harus berupa **1 file HTML tunggal** (semua CSS & JS inline atau via CDN)
- Game berjalan di dalam `<iframe>` dengan sandbox terbatas
- Ukuran maksimal file: **20MB**
- Thumbnail: **PNG/JPG/GIF**, maks 2MB, rasio 16:9 dianjurkan
