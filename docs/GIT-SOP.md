# SOP Git Branching — AKA Gaming

## Branch Utama

| Branch | Fungsi |
|--------|--------|
| `main` | Production-ready. Hanya menerima merge dari `dev` yang sudah stabil. |
| `dev` | Development. Semua fitur di-merge ke sini sebelum ke `main`. |

## Aturan Branching

### 1. Setiap fitur baru = branch baru

```bash
# Selalu buat branch dari dev
git checkout dev
git pull origin dev
git checkout -b feature/nama-fitur
```

### 2. Naming Convention

| Tipe | Format | Contoh |
|------|--------|--------|
| Fitur baru | `feature/nama-fitur` | `feature/ai-game-builder` |
| Bug fix | `fix/nama-bug` | `fix/login-error` |
| Dokumentasi | `docs/nama-doc` | `docs/architecture` |
| Hotfix production | `hotfix/nama-fix` | `hotfix/critical-crash` |

### 3. Workflow

```
main ← (merge dari dev, production release)
  │
  └── dev ← (merge dari feature branches)
        │
        ├── feature/ai-game-builder
        ├── feature/user-dashboard
        ├── fix/login-error
        └── docs/architecture
```

### 4. Merge ke Dev

Setelah fitur selesai:

```bash
# Pastikan branch up-to-date
git checkout dev
git pull origin dev
git checkout feature/nama-fitur
git rebase dev  # atau merge, tergantung preferensi

# Merge ke dev
git checkout dev
git merge feature/nama-fitur

# Push dev
git push origin dev

# Hapus branch fitur (opsional)
git branch -d feature/nama-fitur
```

### 5. Merge ke Main (Release)

Hanya ketika `dev` sudah stabil dan siap release:

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
```

## Aturan Penting

1. **JANGAN** commit langsung ke `main` atau `dev`
2. **SELALU** buat branch baru untuk setiap perubahan
3. **JANGAN** force push ke `main` atau `dev`
4. Commit message yang jelas dan deskriptif
5. Satu branch = satu fitur/fix (jangan campur)

## Commit Message Format

```
<tipe>: <deskripsi singkat>

Contoh:
feat: tambah AI game builder page
fix: perbaiki error login Google
docs: tambah dokumen arsitektur
style: rapikan format kode
refactor: restructure API routes
```
