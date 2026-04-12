# Desain Karakter - Game Survival (Gaya Survival.io)

## Ringkasan

Game ini akan memiliki **3 karakter** dengan gaya visual **Cartoon** yang memiliki stat dan kemampuan **identik**, hanya berbeda secara visual/aestetik.

---

## Karakter 1: Warrior (Kesatria)

### Informasi Dasar
- **Nama:** Warrior / Ksatria
- **Peran:** Fighter depan
- **Tema:** Petarung berani dengan senjata dan perisai
- **Kepribadian:** Berani, kuat, pelindung

### Deskripsi Visual
**Bentuk Tubuh:**
- Karakter humanoid dengan proporsi cartoon (kepala lebih besar dari tubuh)
- Tinggi: ~60 piksel, Lebar: ~40 piksel
- Postur tegap dan atletis

**Warna Utama:**
- Armor: Biru tua (#2563EB) dengan aksen emas (#FBBF24)
- Kulit: Warna peach (#FDBA74)
- Rambut: Coklat tua (#78350F)
- Mata: Hitam dengan pupil putih

**Peralatan:**
- **Helm:** Helm knights dengan visor terbuka
- **Armor:** Plate armor biru dengan detail emas
- **Perisai:** Perisai bundar dengan emblem bintang
- **Senjata:** Pedang satu tangan di pinggang

**Detail Kartun:**
- Mata besar dan ekspresif
- Senyum percaya diri
- Garis outline tebal (3px) untuk tampilan cartoon
- Shadow sederhana di bawah karakter

### Animasi
- **Idle:** Napas naik-turun halus, pedang bergoyang sedikit
- **Jalan:** Kaki bergantian bergerak, tubuh sedikit miring ke arah gerakan
- **Serang:** Ayunkan pedang ke depan dengan efek slash
- **Kena Damage:** Mundur sedikit, mata terbelalak, flash merah singkat

### Stats (Identik untuk semua karakter)
```javascript
{
    hp: 100,
    speed: 200, // piksel per detik
    damage: 10,
    defense: 0,
    attackSpeed: 1.0, // serangan per detik
    pickupRange: 50 // piksel
}
```

### Senjata Awal
- **Pedang Dasar** (Basic Sword)
- Damage: 10
- Attack Speed: 1.0/detik
- Range: 60px
- Tipe: Melee arc

---

## Karakter 2: Mage (Penyihir)

### Informasi Dasar
- **Nama:** Mage / Penyihir
- **Peran:** Magic user
- **Tema:** Ahli sihir misterius dengan kekuatan elementer
- **Kepribadian:** Bijaksana, tenang, fokus

### Deskripsi Visual
**Bentuk Tubuh:**
- Karakter humanoid dengan proporsi cartoon
- Tinggi: ~60 piksel, Lebar: ~40 piksel
- Postur sedikit membungkuk (seperti sedang berkonsentrasi)

**Warna Utama:**
- Jubah: Ungu gelap (#7C3AED) dengan aksen cyan (#06B6D4)
- Kulit: Warna peach (#FED7AA)
- Rambut: Putih/abu-abu (#E5E7EB) - seperti tua/bijaksana
- Mata: Cyan menyala (#06B6D4) - efek magic

**Peralatan:**
- **Topi:** Topi penyihir runcing klasik (warna ungu)
- **Jubah:** Jubah panjang dengan simbol bintang dan bulan
- **Tangan:** Sarung tangan coklat tua
- **Senjata:** Tongkat sihir dengan orb bercahaya di ujungnya

**Detail Kartun:**
- Jenggot panjang (jika karakter pria) atau rambut panjang (jika wanita)
- Mata bersinar cyan (efek magic)
- Orb di tongkat berkedip dengan animasi glow
- Efek partikel magic kecil mengelilingi karakter

### Animasi
- **Idle:** Tongkat bergetar halus, orb bersinar, partikel magic naik
- **Jalan:** Jubah bergoyang, tongkat tetap mengarah ke depan
- **Serang:** Tongkat diayunkan, orb sihir terbang keluar
- **Kena Damage:** Terhuyung, orb meredup sebentar, mata membesar

### Stats (Identik)
```javascript
{
    hp: 100,
    speed: 200,
    damage: 10,
    defense: 0,
    attackSpeed: 1.0,
    pickupRange: 50
}
```

### Senjata Awal
- **Orb Sihir** (Magic Orb)
- Damage: 8
- Attack Speed: 0.8/detik
- Range: 300px
- Tipe: Homing projectile (mencari musuh terdekat)

---

## Karakter 3: Ranger (Penembak Jitu)

### Informasi Dasar
- **Nama:** Ranger / Penjelajah
- **Peran:** Ranged attacker
- **Tema:** Penembak handal dari alam liar
- **Kepribadian:** Lincah, waspada, mandiri

### Deskripsi Visual
**Bentuk Tubuh:**
- Karakter humanoid dengan proporsi cartoon
- Tinggi: ~60 piksel, Lebar: ~40 piksel
- Postur atletis dan siap bertindak

**Warna Utama:**
- Pakaian: Hijau hutan (#15803D) dengan aksen coklat (#92400E)
- Kulit: Sawo matang (#D97706)
- Rambut: Merah/copper (#DC2626) - diikat kuda-kuda
- Mata: Hijau (#16A34A) - tajam dan fokus

**Peralatan:**
- **Topi:** Hood atau topi ranger dengan bulu
- **Armor:** Leather armor ringan dengan pouch
- **Tangan:** Arm guard di lengan kiri
- **Senjata:** Busur panah di punggung

**Detail Kartun:**
- Quiver (tempat panah) di punggung dengan 3-4 panah terlihat
- Pose siap dengan busur di tangan
- Ekspresi fokus dan determinasi
- Daun atau elemen alam di pakaian

### Animasi
- **Idle:** Busur dipegang siap, panah di quiver bergoyang halus
- **Jalan:** Gerakan lincah, busur tetap siap, pakaian bergoyang
- **Serang:** Tarik busur, lepas panah, panah terbang ke musuh
- **Kena Damage:** Terkejut, mata membesar, mundur cepat

### Stats (Identik)
```javascript
{
    hp: 100,
    speed: 200,
    damage: 10,
    defense: 0,
    attackSpeed: 1.0,
    pickupRange: 50
}
```

### Senjata Awal
- **Busur Panah** (Arrow Bow)
- Damage: 15
- Attack Speed: 0.6/detik
- Range: 400px
- Tipe: Piercing projectile (tembus musuh)

---

## Perbandingan Karakter

| Aspek | Warrior | Mage | Ranger |
|-------|---------|------|--------|
| **Tema Warna** | Biru + Emas | Ungu + Cyan | Hijau + Coklat |
| **Senjata Awal** | Pedang (Melee) | Orb Sihir (Homing) | Busur (Piercing) |
| **Gaya Serang** | Fisik/dekat | Magic/jauh | Ranged/akurat |
| **Visual Khas** | Armor + Perisai | Jubah + Tongkat | Hood + Busur |
| **Efek Khusus** | Slash effect | Magic particles | Arrow trail |
| **Kepribadian** | Berani | Bijaksana | Lincah |

---

## Spesifikasi Teknis Render Karakter

### Canvas Drawing Approach

Setiap karakter akan dirender menggunakan Canvas 2D API dengan:

**Layer Rendering (dari bawah ke atas):**
1. **Shadow:** Ellipse gelap di bawah karakter
2. **Body:** Shape tubuh utama (rounded rectangle/ellipse)
3. **Clothing/Armor:** Warna dan detail pakaian
4. **Head:** Kepala dengan mata dan ekspresi
5. **Equipment:** Senjata dan peralatan
6. **Effects:** Glow, partikel, animasi

**Ukuran Karakter:**
```javascript
const CHARACTER_SIZE = {
    width: 40,    // piksel
    height: 60,   // piksel
    headRadius: 15
};
```

**Warna per Karakter:**
```javascript
const CHARACTER_COLORS = {
    warrior: {
        primary: '#2563EB',      // biru armor
        secondary: '#FBBF24',    // emas accent
        skin: '#FDBA74',         // kulit
        hair: '#78350F',         // rambut
        outline: '#1E3A8A'       // outline
    },
    mage: {
        primary: '#7C3AED',      // ungu jubah
        secondary: '#06B6D4',    // cyan magic
        skin: '#FED7AA',         // kulit
        hair: '#E5E7EB',         // putih/abu
        outline: '#5B21B6'       // outline
    },
    ranger: {
        primary: '#15803D',      // hijau pakaian
        secondary: '#92400E',    // coklat accent
        skin: '#D97706',         // kulit sawo
        hair: '#DC2626',         // merah
        outline: '#14532D'       // outline
    }
};
```

---

## Sistem Pemilihan Karakter

### Flow Pemilihan Karakter

```
MAIN MENU
    ↓
 klik "PLAY"
    ↓
CHARACTER SELECT SCREEN
    ↓
Tampilkan 3 karakter card
    ↓
Pilih 1 karakter
    ↓
START GAME dengan karakter tersebut
```

### UI Character Select Screen

**Layout:**
```
┌─────────────────────────────────────┐
│     Pilih Karakter Kamu             │
├─────────┬─────────┬─────────────────┤
│         │         │                 │
│ WARRIOR │  MAGE   │    RANGER       │
│         │         │                 │
│ [Pedang]│[Orb]    │  [Busur]        │
│         │         │                 │
│ Melee   │ Magic   │  Ranged         │
│         │         │                 │
│ [PILIH] │ [PILIH] │  [PILIH]        │
└─────────┴─────────┴─────────────────┘
```

**Setiap Character Card Menampilkan:**
- Preview karakter (sprite/gambar)
- Nama karakter
- Senjata awal
- Gaya pertarungan (Melee/Magic/Ranged)
- Tombol "PILIH"

---

## Implementasi Code Structure

### Data Structure

```javascript
// Character definitions
const CHARACTERS = {
    warrior: {
        id: 'warrior',
        name: 'Warrior',
        nameId: 'warrior', // untuk translate
        description: 'Petarung berani dengan senjata dan perisai',
        weapon: 'basic_sword',
        colors: {
            primary: '#2563EB',
            secondary: '#FBBF24',
            skin: '#FDBA74',
            hair: '#78350F',
            outline: '#1E3A8A'
        },
        stats: {
            hp: 100,
            speed: 200,
            damage: 10,
            defense: 0,
            attackSpeed: 1.0,
            pickupRange: 50
        }
    },
    mage: {
        id: 'mage',
        name: 'Mage',
        nameId: 'mage',
        description: 'Ahli sihir dengan kekuatan elementer',
        weapon: 'magic_orb',
        colors: {
            primary: '#7C3AED',
            secondary: '#06B6D4',
            skin: '#FED7AA',
            hair: '#E5E7EB',
            outline: '#5B21B6'
        },
        stats: {
            hp: 100,
            speed: 200,
            damage: 10,
            defense: 0,
            attackSpeed: 1.0,
            pickupRange: 50
        }
    },
    ranger: {
        id: 'ranger',
        name: 'Ranger',
        nameId: 'ranger',
        description: 'Penembak handal dari alam liar',
        weapon: 'arrow_bow',
        colors: {
            primary: '#15803D',
            secondary: '#92400E',
            skin: '#D97706',
            hair: '#DC2626',
            outline: '#14532D'
        },
        stats: {
            hp: 100,
            speed: 200,
            damage: 10,
            defense: 0,
            attackSpeed: 1.0,
            pickupRange: 50
        }
    }
};

// Player object dengan selected character
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 40,
    height: 60,
    character: null, // 'warrior', 'mage', atau 'ranger'
    colors: {}, // akan diisi berdasarkan karakter
    weapon: null, // akan diisi berdasarkan karakter
    hp: 100,
    maxHp: 100,
    speed: 200,
    damage: 10,
    defense: 0,
    attackSpeed: 1.0,
    pickupRange: 50,
    // ... properti lainnya
};

// Function untuk select character
function selectCharacter(characterId) {
    const charData = CHARACTERS[characterId];
    player.character = characterId;
    player.colors = charData.colors;
    player.weapon = charData.weapon;
    player.hp = charData.stats.hp;
    player.maxHp = charData.stats.maxHp;
    player.speed = charData.stats.speed;
    player.damage = charData.stats.damage;
    player.defense = charData.stats.defense;
    player.attackSpeed = charData.stats.attackSpeed;
    player.pickupRange = charData.stats.pickupRange;
}
```

---

## Character Rendering Functions

### Render Warrior

```javascript
function drawWarrior(ctx, x, y, colors, animationState) {
    ctx.save();
    ctx.translate(x, y);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body (armor)
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    roundRect(ctx, -15, -10, 30, 35, 5);
    ctx.fill();
    ctx.stroke();
    
    // Gold trim
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.stroke();
    
    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Helmet
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(0, -22, 16, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-5, -20, 2, 0, Math.PI * 2);
    ctx.arc(5, -20, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Confident smile
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -17, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    
    // Sword (at side)
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(15, 5);
    ctx.lineTo(25, 20);
    ctx.stroke();
    
    // Shield
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-20, 5, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Star emblem on shield
    ctx.fillStyle = colors.secondary;
    drawStar(ctx, -20, 5, 4, 5, 2);
    
    ctx.restore();
}
```

### Render Mage

```javascript
function drawMage(ctx, x, y, colors, animationState, time) {
    ctx.save();
    ctx.translate(x, y);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Robe
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.lineTo(-18, 30);
    ctx.lineTo(18, 30);
    ctx.lineTo(15, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Robe decorations (stars and moons)
    ctx.fillStyle = colors.secondary;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(-8 + i * 8, 5 + i * 8, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Wizard hat
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.moveTo(-18, -25);
    ctx.lineTo(0, -50);
    ctx.lineTo(18, -25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Hat brim
    ctx.beginPath();
    ctx.ellipse(0, -25, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Glowing eyes
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-5, -20, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Staff
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, -30);
    ctx.lineTo(20, 30);
    ctx.stroke();
    
    // Glowing orb on staff
    const glowIntensity = Math.sin(time * 0.003) * 0.3 + 0.7;
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 15 * glowIntensity;
    ctx.beginPath();
    ctx.arc(20, -35, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Magic particles
    for (let i = 0; i < 5; i++) {
        const angle = (time * 0.002) + (i * Math.PI * 2 / 5);
        const radius = 25 + Math.sin(time * 0.005 + i) * 5;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius - 10;
        
        ctx.fillStyle = colors.secondary;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    ctx.restore();
}
```

### Render Ranger

```javascript
function drawRanger(ctx, x, y, colors, animationState) {
    ctx.save();
    ctx.translate(x, y);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body (leather armor)
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    roundRect(ctx, -15, -10, 30, 35, 5);
    ctx.fill();
    ctx.stroke();
    
    // Belt and pouches
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(-15, 10, 30, 5);
    
    // Pouches
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-12, 11, 8, 8);
    ctx.fillRect(4, 11, 8, 8);
    
    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Hood
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(0, -22, 16, Math.PI, Math.PI * 2);
    ctx.lineTo(16, -15);
    ctx.lineTo(-16, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Feather on hood
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, -35);
    ctx.quadraticCurveTo(15, -45, 12, -48);
    ctx.stroke();
    
    // Focused eyes
    ctx.fillStyle = '#16A34A';
    ctx.shadowColor = '#16A34A';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(-5, -20, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Determined expression
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-3, -15);
    ctx.lineTo(3, -15);
    ctx.stroke();
    
    // Bow (in hand)
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(22, 0, 18, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();
    
    // Bow string
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(22 + 18 * Math.cos(-Math.PI * 0.4), 0 + 18 * Math.sin(-Math.PI * 0.4));
    ctx.lineTo(22 + 18 * Math.cos(Math.PI * 0.4), 0 + 18 * Math.sin(Math.PI * 0.4));
    ctx.stroke();
    
    // Quiver on back
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-25, -15, 8, 25);
    ctx.strokeRect(-25, -15, 8, 25);
    
    // Arrows in quiver
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-23 + i * 2, -15);
        ctx.lineTo(-23 + i * 2, -25);
        ctx.stroke();
        
        // Arrow tips
        ctx.fillStyle = '#64748B';
        ctx.beginPath();
        ctx.moveTo(-23 + i * 2, -25);
        ctx.lineTo(-24 + i * 2, -28);
        ctx.lineTo(-22 + i * 2, -28);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}
```

---

## Character Select Screen Implementation

### HTML Structure

```html
<div id="characterSelectScreen" class="screen hidden">
    <h1>Pilih Karakter Kamu</h1>
    <div class="character-select-container">
        <div class="character-card" data-character="warrior">
            <div class="character-preview" id="warriorPreview"></div>
            <h2>Warrior</h2>
            <p class="character-desc">Petarung berani dengan senjata dan perisai</p>
            <div class="character-info">
                <div class="info-item">
                    <span class="info-label">Senjata:</span>
                    <span class="info-value">Pedang (Melee)</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Gaya:</span>
                    <span class="info-value">Serangan jarak dekat</span>
                </div>
            </div>
            <button class="select-btn">PILIH</button>
        </div>
        
        <div class="character-card" data-character="mage">
            <div class="character-preview" id="magePreview"></div>
            <h2>Mage</h2>
            <p class="character-desc">Ahli sihir dengan kekuatan elementer</p>
            <div class="character-info">
                <div class="info-item">
                    <span class="info-label">Senjata:</span>
                    <span class="info-value">Orb Sihir (Homing)</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Gaya:</span>
                    <span class="info-value">Magic jarak jauh</span>
                </div>
            </div>
            <button class="select-btn">PILIH</button>
        </div>
        
        <div class="character-card" data-character="ranger">
            <div class="character-preview" id="rangerPreview"></div>
            <h2>Ranger</h2>
            <p class="character-desc">Penembak handal dari alam liar</p>
            <div class="character-info">
                <div class="info-item">
                    <span class="info-label">Senjata:</span>
                    <span class="info-value">Busur (Piercing)</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Gaya:</span>
                    <span class="info-value">Tembakan akurat</span>
                </div>
            </div>
            <button class="select-btn">PILIH</button>
        </div>
    </div>
    <button id="backToMenuBtn" class="menu-btn">Kembali ke Menu</button>
</div>
```

### CSS Styles

```css
.character-select-container {
    display: flex;
    gap: 30px;
    margin: 40px auto;
    justify-content: center;
    flex-wrap: wrap;
    max-width: 1200px;
}

.character-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    border: 3px solid #00ffff;
    border-radius: 15px;
    padding: 30px;
    width: 300px;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
}

.character-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 40px rgba(0, 255, 255, 0.4);
    border-color: #00ffff;
}

.character-preview {
    width: 150px;
    height: 150px;
    margin: 0 auto 20px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.character-card h2 {
    color: #00ffff;
    font-size: 28px;
    margin-bottom: 10px;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.character-desc {
    color: #aaa;
    font-size: 14px;
    margin-bottom: 20px;
    font-style: italic;
}

.character-info {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 20px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.info-item:last-child {
    margin-bottom: 0;
}

.info-label {
    color: #888;
    font-weight: bold;
}

.info-value {
    color: #fff;
}

.select-btn {
    padding: 15px 40px;
    font-size: 18px;
    background: linear-gradient(90deg, #00ffff 0%, #0080ff 100%);
    border: none;
    border-radius: 30px;
    color: #000;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
}

.select-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
}
```

### JavaScript Integration

```javascript
// Character select screen logic
let selectedCharacter = null;

function showCharacterSelect() {
    hideAllScreens();
    document.getElementById('characterSelectScreen').classList.remove('hidden');
    
    // Render character previews
    renderCharacterPreview('warrior');
    renderCharacterPreview('mage');
    renderCharacterPreview('ranger');
}

function renderCharacterPreview(characterId) {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    const previewDiv = document.getElementById(`${characterId}Preview`);
    previewDiv.innerHTML = '';
    previewDiv.appendChild(canvas);
    
    // Draw character in center
    const charData = CHARACTERS[characterId];
    const drawFunc = characterId === 'warrior' ? drawWarrior : 
                     characterId === 'mage' ? drawMage : drawRanger;
    
    drawFunc(ctx, 75, 75, charData.colors, 'idle', Date.now());
}

// Event listeners for character cards
document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('click', () => {
        const characterId = card.dataset.character;
        selectedCharacter = characterId;
        
        // Highlight selected card
        document.querySelectorAll('.character-card').forEach(c => {
            c.style.borderColor = '#00ffff';
            c.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)';
        });
        
        card.style.borderColor = '#FBBF24';
        card.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)';
    });
});

// Event listener for select button
document.querySelectorAll('.select-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const characterId = ['warrior', 'mage', 'ranger'][index];
        if (selectedCharacter && selectedCharacter === characterId) {
            startGameWithCharacter(characterId);
        } else if (!selectedCharacter) {
            alert('Pilih karakter terlebih dahulu!');
        }
    });
});

function startGameWithCharacter(characterId) {
    selectCharacter(characterId);
    hideAllScreens();
    showStartScreen();
}
```

---

## Translations

### English
```javascript
{
    characterSelect: 'Select Your Character',
    warrior: 'Warrior',
    mage: 'Mage',
    ranger: 'Ranger',
    warriorDesc: 'Brave fighter with sword and shield',
    mageDesc: 'Wise spellcaster with elemental power',
    rangerDesc: 'Skilled sharpshooter from the wild',
    weapon: 'Weapon:',
    style: 'Style:',
    melee: 'Melee Combat',
    magic: 'Long-range Magic',
    ranged: 'Accurate Shooting',
    sword: 'Sword (Melee)',
    orb: 'Magic Orb (Homing)',
    bow: 'Bow (Piercing)',
    select: 'SELECT',
    selectCharacterFirst: 'Please select a character first!'
}
```

### Bahasa Indonesia
```javascript
{
    characterSelect: 'Pilih Karakter Kamu',
    warrior: 'Warrior',
    mage: 'Mage',
    ranger: 'Ranger',
    warriorDesc: 'Petarung berani dengan senjata dan perisai',
    mageDesc: 'Ahli sihir dengan kekuatan elementer',
    rangerDesc: 'Penembak handal dari alam liar',
    weapon: 'Senjata:',
    style: 'Gaya:',
    melee: 'Serangan jarak dekat',
    magic: 'Magic jarak jauh',
    ranged: 'Tembakan akurat',
    sword: 'Pedang (Melee)',
    orb: 'Orb Sihir (Homing)',
    bow: 'Busur (Piercing)',
    select: 'PILIH',
    selectCharacterFirst: 'Pilih karakter terlebih dahulu!'
}
```

---

## Ringkasan

### Yang Sudah Didesain:
✅ **3 Karakter** dengan gaya Cartoon  
✅ **Stat identik** untuk semua karakter (hanya beda visual)  
✅ **Senjata awal berbeda** per karakter  
✅ **Spesifikasi warna** lengkap (primary, secondary, skin, hair, outline)  
✅ **Animasi dasar** (idle, jalan, serang, kena damage)  
✅ **Struktur data** untuk implementasi  
✅ **UI Character Select Screen**  
✅ **Render functions** untuk setiap karakter  
✅ **Translations** (EN dan ID)  

### Langkah Selanjutnya:
1. **Review** desain karakter ini
2. **Modifikasi** jika ada yang ingin diubah
3. **Implementasi** ke kode game.js, index.html, dan style.css

Apakah ada yang ingin diubah atau ditambahkan pada desain karakter ini?
