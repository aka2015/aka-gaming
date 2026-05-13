# Game Development Plan

## Ide Game Edukasi Membaca (Target: Anak 5 Tahun)

### 1. 🫧 Bubble Pop ABC
Pop balon berisi huruf sesuai urutan untuk membentuk kata.
- **Mekanik**: Balon muncul dengan huruf, anak tap urut sesuai kata target
- **Kata**: 3-4 huruf (baju, api, ibu, bola, dll)
- **Visual**: Balon warna-warni melayang, animasi pop
- **Input**: Tap/touch
- **Progress**: Level dengan kata semakin panjang

### 2. 🧩 Suku Kata
Gabungkan dua suku kata jadi kata utuh.
- **Mekanik**: Dua kartu suku kata, anak tap/drag untuk menggabung
- **Contoh**: "ba" + "li" = "bali", "bu" + "ku" = "buku"
- **Visual**: Kartu bergambar hewan/benda
- **Input**: Tap atau drag & drop

### 3. 🔤 Huruf Hilang
Lengkapi kata dengan huruf yang hilang.
- **Mekanik**: Gambar + kata dengan huruf kosong, pilih huruf tepat
- **Contoh**: Gambar apel → "a_p_l", pilih "e"
- **Visual**: Gambar besar + huruf warna-warni
- **Input**: Tap pilihan huruf

### 4. 🐛 Ulat Kata
Ulat berjalan di lintasan huruf, tap huruf benar sebelum sampai ujung.
- **Mekanik**: Ulat bergerak otomatis, anak tap huruf urut
- **Visual**: Ulat lucu, lintasan huruf
- **Input**: Tap cepat dan tepat

---

## Ide Game Baru: Siapa Alien? 🛸

### Informasi Game
| Item | Detail |
|------|--------|
| **Nama** | Siapa Alien? |
| **ID** | `siapa-alien` |
| **Kategori** | `educational` |
| **Target** | Anak 5+ tahun |
| **Author** | Ummi AKA |
| **Folder** | `games/siapa-alien/` |

### Konsep
Sekelompok orang berjajar, salah satunya adalah alien yang menyamar. Pemain harus mencari petunjuk dan menebak siapa aliennya. Cocok untuk melatih observasi dan logika anak.

### Mekanik Utama
- **5 orang** berjajar di layar, 1 adalah alien
- Setiap orang punya **kartu identitas** dengan 3 sifat (contoh: nama, makanan favorit, warna kesukaan)
- Pemain tap orang → buka kartu → baca/cari keanehan
- Clue visual di karakter (mata merah, kuping lancip, bayangan aneh, kulit pucat/kehijauan, senyum aneh)
- Pemain tap tombol **"Alien!"** untuk menuduh
- Benar = +100 poin, Salah = -50 poin

### Alur Game
1. **Intro** — Cerita: "Hari ini di desa ada festival! Tapi... alien menyamar! Cari siapa aliennya!"
2. **Observasi** — 5 karakter muncul, pemain bisa tap untuk investigasi
3. **Clue muncul** — Clue visual + teks di kartu identitas
4. **Tebak** — Tap karakter → tombol tuduh "Alien!" atau "Manusia"
5. **Hasil** — Animasi terungkap + skor + bonus
6. **Next** — Ronde berikutnya dengan karakter berbeda

### Level Progresif
| Level | Jumlah Orang | Jumlah Alien | Clue |
|-------|-------------|-------------|------|
| 1-3 (Mudah) | 4 | 1 | 3 clue jelas (warna kulit beda, mata merah) |
| 4-6 (Sedang) | 5 | 1 | 2 clue jelas + 1 clue samar |
| 7-9 (Sulit) | 6 | 1-2 | 1 clue jelas + 2 clue samar |
| 10+ (Expert) | 6 | 2 | Semua clue samar |

### Jenis Clue
**Clue Visual (di karakter):**
- 👁️ Mata merah/bersinar
- 🟢 Kulit kehijauan/pucat
- 👂 Kuping lancip
- 🌑 Bayangan tidak normal/glitch
- 😬 Senyum aneh/terlalu lebar
- 🖐️ Jari lebih panjang

**Clue Teks (di kartu identitas):**
- Tidak tahu makanan bumi
- Salah menyebut nama benda
- Tidak kenal hewan lokal
- Jawaban aneh ("warna favoritku? merah darah!")
- Tidak bisa tersenyum

### Tools & Power-Up
| Item | Harga | Efek |
|------|-------|------|
| 🔍 Kaca Pembesar | Gratis (3x/ronde) | Sorot 1 clue visual |
| ❓ Petunjuk | 50 koin | Munculin 1 clue teks tambahan |
| 🛡️ Shield | 30 koin | Salah tebak tidak kena minus |
| 🔄 Ganti Soal | 80 koin | Acak ulang karakter |

### Sistem Skor
| Aksi | Poin |
|------|------|
| Tebak alien benar | +100 |
| Streak 3x | x1.5 |
| Streak 5x | x2.0 |
| Salah tebak | -50 |
| Bonus semua benar (Perfect) | +200 |

### Visual Style
- Karakter **chibi lucu** (style Bubble Pop ABC)
- Warna cerah, background festival/desa
- Efek **glitch** + sinar laser saat alien terungkap
- Animasi karakter: idle bergoyang, ekspresi kaget saat dituduh
- Particle: bintang untuk benar, asap untuk salah

### Audio
- Musik ceria ala festival
- SFX tap kartu, buka clue
- Alarm peringatan saat mendekati alien
- Suara "Ding!" benar, "Boo!" salah

### Struktur File
```
games/siapa-alien/
├── index.html
├── info.json
├── script.js
├── style.css
└── thumbnail.svg
```

### Data Karakter
```js
{
  id: "pak_rt",
  name: "Pak RT",
  emoji: "👨‍💼",
  clues: {
    visual: ["mata_merah", "kulit_hijau"],
    text: ["Tidak tahu rasa es krim", "Bilang matahari itu dingin"]
  },
  isAlien: true,
  difficulty: 1
}
```

### TODO Implementasi
1. Buat struktur folder + file dasar
2. HTML layout: 5 slot karakter + kartu identitas + tombol tuduh
3. CSS: mobile-first, karakter chibi, animasi
4. JS: data karakter, logika investigasi, skor, streak
5. Clue system: visual overlay di karakter + kartu teks
6. Animasi reveal alien (glitch/transform)
7. Result screen + statistik
8. Audio & polish

## Catatan Dev
- Struktur folder: `games/[nama-game]/`
- Wajib ada: `index.html`, `info.json`, `script.js`, `style.css`, `thumbnail`
- Konvensi nama: lowercase-hyphen
- Kategori: `educational`
