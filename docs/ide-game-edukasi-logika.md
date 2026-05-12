# Daftar Ide Game Edukasi - Logika Berpikir

Dokumen ini berisi ide-ide game edukasi yang dirancang untuk mengasah kemampuan logika dan berpikir kritis anak-anak.

---

## 1. Pattern Detective (Detektif Pola)

**ID:** `pattern-detective`
**Kategori:** puzzle, educational
**Target Usia:** 6-10 tahun (Kelas 1-4)
**Thumbnail:** `thumbnail.svg`

### Deskripsi
Game puzzle序列 untuk melengkapi urutan pola. Anak harus menemukan aturan pola dan melanjutkannya. Pola mencakup warna, bentuk, angka, dan kombinasi.

### Fitur
- 3 jenis pola: warna, bentuk, angka
- 5 tingkat kesulitan (Mudah - Expert)
- Sistem hint jika stuck
- Sistem skor berdasarkan streak dan waktu
- Sistem bintang (1-3) per level

### Gameplay
1. Lihat urutan pola yang incompleto
2. Pilih opsi yang benar untuk melengkapi
3. Pola makin kompleks seiring level naik

### Contoh Pola
```
Merah, Biru, Merah, Biru, ? → jawab: Merah
Segitiga, Kotak, Segitiga, ? → jawab: Kotak
2, 4, 6, 8, ? → jawab: 10
```

---

## 2. Logic Grid (Teka-Teki Logika)

**ID:** `logic-grid`
**Kategori:** puzzle, educational
**Target Usia:** 8-12 tahun (Kelas 3-6)
**Thumbnail:** `thumbnail.svg`

### Deskripsi
Puzzle deduksi logika where anak harus menemukan hubungan antar objek berdasarkan petunjuk. Contoh klasik: "Siapa punya hewan apa" atau "Siapa tinggal di mana".

### Fitur
- Template puzzle: Hewan-Pemilik, Kerjaan-Kota, Makanan-Minuman
- 3x3 sampai 5x5 grid
- Sistem petunjuk bertahap
- Animasi "aha moment" saat dapat pencerahan

### Gameplay
1. Baca petunjuk satu per satu
2. Coret/centang di grid
3. Gunakan logika deduksi untuk temukan jawaban
4. Validasi setiap langkah

---

## 3. Robot Builder (Builder Robot)

**ID:** `robot-builder`
**Kategori:** puzzle, educational
**Target Usia:** 7-11 tahun (Kelas 2-5)
**Thumbnail:** `thumbnail.svg`

### Deskripsi
Game programming visual sederhana. Anak menyusun blok perintah (move, turn, grab, use) untuk menggerakkan robot menyelesaikan misi di maze.

### Fitur
- 20+ level dengan misi berbeda
- Blok perintah: Forward, Back, Turn Left, Turn Right, Grab, Use
- Sistem loop (untuk level lanjutan)
- Preview path sebelum eksekusi
- Debug mode

### Gameplay
1. Lihat posisi awal dan tujuan robot
2. Susun blok perintah secara berurutan
3. Tekan "Run" untuk execute
4. Jika salah, edit dan coba lagi

---

## 4. Balance Challenge (Tantangan Keseimbangan)

**ID:** `balance-challenge`
**Kategori:** educational
**Target Usia:** 8-12 tahun (Kelas 3-6)
**Thumbnail:** `thumbnail.svg`

### Deskripsi
Game matematika tentang keseimbangan dan berat. Anak harus menyeimbangkan timbangan, menghitung berat benda, dan menyelesaikan soal matematika praktis.

### Fitur
- 3 jenis tantangan:
  - Timpa timbangan (seimbang/tidak)
  - Hitung berat benda
  - Selesaikan persamaan berat
- Konsep matematika: penjumlahan, pengurangan, perkalian sederhana
- Visual skala timbangan yang interaktif

### Gameplay
1. Lihat konfigurasi timbangan
2. Hitung total berat di setiap sisi
3. Jawab pertanyaan atau selesaikan tantangan

---

## 5. Sequence Maze (Labirin Berurutan)

**ID:** `sequence-maze`
**Kategori:** puzzle, educational
**Target Usia:** 6-9 tahun (Kelas 1-3)
**Thumbnail:** `thumbnail.svg`

### Deskripsi
Game navigasi robot melalui labirin dengan mengikuti instruksi angka/arah berurutan. Melatih planning, pengenalan arah, dan последовательность berpikir.

### Fitur
- Grid-based maze
- Command: Up, Down, Left, Right
- Sistem langkah terbatas
- Bintang berdasarkan efisiensi
- Tema: hutan ajaib, ruang angkasa, di laut

### Gameplay
1. Lihat tujuan di maze
2. Susun urutan perintah gerakan
3. Execute dan lihat hasilnya
4. Optimasi untuk dapat bintang penuh

---

## 6. Logic Blocks (Balok Logika)

**ID:** `logic-blocks`
**Kategori:** puzzle, educational
**Target Usia:** 7-11 tahun (Kelas 2-5)
**Thumbnail:** `thumbnail.svg`

### Deskripsi
Game spatial reasoning. Anak menyusun balok untuk mencocokkan pola 2D atau membangun struktur 3D sesuai referensi.

### Fitur
- 2 mode: 2D Pattern dan 3D Build
- Berbagai bentuk balok: cube, pyramid, cylinder
- Sistem rotasi dan flip
- Visualisasi 3D interaktif

### Gameplay
2D Mode:
1. Lihat pola target
2. Drag & drop balok ke posisi yang benar

3D Mode:
1. Lihat struktur 3D dari berbagai sudut
2. Bangun struktur yang sama

---

## 7. Mystery Number (Angka Misteri)

**ID:** `mystery-number`
**Kategori:** educational
**Target Usia:** 6-10 tahun (Kelas 1-4)
**Thumbnail:** `thumbnail.svg`

### Deskripsi
Game tebak angka dengan sistem "lebih besar" / "lebih kecil". Melatih kemampuan estimasi, rentang angka, dan berpikir sistematis.

### Fitur
- Range angka sesuai level:
  - Easy: 1-10
  - Medium: 1-50
  - Hard: 1-100
  - Expert: 1-1000
- Sistem percobaan terbatas
- Histori tebakan dengan petunjuk
- Leaderboard

### Gameplay
1. Sistem pilih angka antara range
2. Lihat hasil "lebih besar" atau "lebih kecil"
3. Gunakan logika untuk persempit range
4. Tebak dengan jumlah percobaan minimal

---

## 8. Circuit Builder (Pembuat Rangkaian)

**ID:** `circuit-builder`
**Kategori:** educational
**Target Usia:** 9-12 tahun (Kelas 4-6)
**Thumbnail:** `thumbnail.svg`

### Deskripsi
Game logika tentang rangkaian listrik. Susun komponen (baterai, saklar, лампа, resistor) untuk menyalakan lampu sesuai target.

### Fitur
- Komponen: Baterai, Saklar, Lampu, Kabel, Resistor, AND Gate, OR Gate
- Level dengan target tertentu (semi specific)
- Sistem energi/tegangan
- Konsep logika AND/OR/NOT

### Gameplay
1. Lihat komponen yang tersedia
2. Susun rangkaian di grid
3. Test rangkaian
4. Indikator hidup/mati untuk setiap komponen

---

## 9. Color Code Decoder (Dekoder Kode Warna)

**ID:** `color-code-decoder`
**Kategori:** puzzle, educational
**Target Usia:** 7-10 tahun (Kelas 2-4)
**Thumbnail:** `thumbnail.svg`

### Deskripsi
Game decrypting sederhana. Anak menerima pesan terenkripsi dengan kode warna/angka dan harus decode menggunakan kunci.

### Fitur
- Kode: Warna, Angka, Simbol
- Sistem kunci yang berubah setiap level
- Pesan motivasi atau fakta menarik untuk di-decode
- Timer mode untuk speed challenge

### Gameplay
1. Lihat pesan terenkripsi
2. Gunakan kunci untuk decode
3. Ketik jawaban yang sudah di-decode
4. Validasi dan lanjut ke level berikutnya

---

## 10. Sorting Factory (Pabrik Penyortir)

**ID:** `sorting-factory`
**Kategori:** puzzle, educational
**Target Usia:** 6-9 tahun (Kelas 1-3)
**Thumbnail:** `thumbnail.svg`

### Deskripsi
Game sortasi di pabrik conveyor belt. Anak harus menyortir barang berdasarkan criteria (warna, bentuk, ukuran) ke jalur yang benar.

### Fitur
- Kriteria sortasi: warna, bentuk, ukuran, angka
- Conveyor belt animation
- Multi-tier sorting
- Skor berdasarkan akurasi dan kecepatan

### Gameplay
1. Barang datang di conveyor belt
2. Klik/tap untuk arahkan ke jalur yang benar
3. Gunakan kriteria untuk menentukan tujuan
4. Jangan sampai salah sortir

---

## Implementasi Priority

| Priority | Game | Alasan |
|----------|------|--------|
| 1 | Pattern Detective | Konsep sederhana, membangun dasar logika |
| 2 | Sequence Maze | Menggabungkan navigasi dan urutan |
| 3 | Logic Grid | Melatih deduksi tingkat tinggi |
| 4 | Mystery Number | Melatih estimasi dan berpikir sistematis |
| 5 | Robot Builder | Konsep coding dasar |

---

## Tech Stack (Standard)

```
games/[game-id]/
├── index.html
├── info.json
├── script.js
├── style.css
└── thumbnail.svg
```

## Template info.json

```json
{
  "id": "game-id",
  "name": "Nama Game",
  "description": "Deskripsi singkat game",
  "category": "educational",
  "badge": "new",
  "gameFile": "index.html",
  "thumbnail": "thumbnail.svg",
  "createdAt": "2026-MM-DD",
  "author": "AKA Gaming"
}
```

---

*Dokumen ini adalah daftar ide game edukasi yang berfokus pada pengembangan kemampuan logika berpikir anak-anak.*