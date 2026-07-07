# TaskKampus — Firebase + GitHub Pages

## Setup (lakukan sekali)

### 1. Firebase
- Buat project baru di [Firebase Console](https://console.firebase.google.com)
- Aktifkan **Authentication** → Sign-in method → **Email/Password**
- Aktifkan **Firestore Database** (pilih mode production)
- Di Firestore → **Rules**, paste isi `firestore.rules`
- Di Project Settings → Your apps → tambah **Web App**
- Copy `firebaseConfig`-nya, paste ke `js/firebase-config.js`

### 2. GitHub Pages
- Push semua file ini ke repo GitHub kamu
- Repo Settings → Pages → Source: **main branch / root**
- Tunggu 1-2 menit, situs kamu hidup di `https://username.github.io/nama-repo/`
- Entry point: `login.html` (set ini sebagai halaman utama)

### 3. Redirect otomatis ke login
Tambahkan file `index.html` kecil di root:
```html
<!DOCTYPE html>
<html><head>
<meta http-equiv="refresh" content="0;url=login.html">
</head></html>
```

## Struktur file
```
├── index.html          (redirect ke login)
├── login.html
├── register.html
├── dashboard.html
├── tambah.html
├── edit.html
├── notifikasi.html
├── style.css
├── firestore.rules     (paste ke Firebase Console, bukan diupload ke GitHub Pages)
└── js/
    ├── firebase-config.js  (isi dengan config Firebase kamu)
    └── common.js
```
## open in
https://aether-asahina.github.io/taskkampus/
