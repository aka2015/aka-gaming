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

## Catatan Dev
- Struktur folder: `games/[nama-game]/`
- Wajib ada: `index.html`, `info.json`, `script.js`, `style.css`, `thumbnail`
 -Konvensi nama: lowercase-hyphen
- Kategori: `educational`
