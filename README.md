# 📱 DMS KODEIN - Device Management System

Sistem Manajemen Perangkat terpadu untuk **Kodein School**, dirancang untuk kecepatan tinggi dalam menangani penitipan laptop dan handphone siswa menggunakan teknologi QR Code dan Progressive Web App (PWA).

## 🚀 Fitur Utama

- **PWA Ready**: Dapat diinstal di Android & iOS sebagai aplikasi native untuk penggunaan lapangan yang praktis.
- **High-Speed Scanner**: Menggunakan teknologi `html5-qrcode` dengan optimasi performa tinggi.
- **Mode Lightning (Ultra-Speed)**: Alur kerja tanpa klik (zero-interaction). Scan langsung proses, otomatis restart kamera dalam < 1 detik.
- **Device-Specific Stations**:
  - **Scan Laptop**: Pos khusus untuk memproses unit Laptop.
  - **Scan HP**: Pos khusus untuk memproses unit Handphone.
  - **Dual-Sided Badge Support**: Mendukung identitas siswa dengan QR berbeda di tiap sisi (Laptop/HP).
- **Live Debug Terminal**: Panel HUD real-time di halaman scan untuk memantau aktivitas sistem tanpa membuka browser console.
- **RBAC (Role Based Access Control)**: Pemisahan akses antara Admin dan Staff.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router & Turbopack)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Next-Auth v4
- **UI/UX**: Vanilla CSS + Tailwind CSS (Shadcn-inspired components)
- **PWA**: @ducanh2912/next-pwa

## 🏃 Cara Menjalankan

### 1. Instalasi
```bash
npm install
```

### 2. Konfigurasi Database
Pastikan PostgreSQL berjalan dan sesuaikan `.env`:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/dms_kodein?schema=public"
NEXTAUTH_SECRET="rahasia-anda"
NEXTAUTH_URL="http://[IP-LOCAL-ANDA]:3000"
```

### 3. Sync Database & Seeding
```bash
npx prisma db push
npm run dev
```

### 4. Menjalankan untuk Produksi (Mode PWA Aktif)
Agar fitur PWA dan Offline Mode bisa dites di HP:
```bash
npm run build
npm run start
```

## 📸 Panduan Operasional

1. **Persiapan QR**: 
   - Gunakan format `ID_DEVICE` atau `STUDENT_TOKEN` pada kartu siswa.
   - Contoh ID Tes: `DEVICE_LAPTOP_SITI`, `DEVICE_PHONE_SITI`, `token-siti`.
2. **Scan Cepat**: 
   - Masuk ke menu **Scan Laptop** atau **Scan HP**.
   - Aktifkan **Mode Lightning** (Ikon Petir Oranye).
   - Pastikan toggle **Penyerahan/Pengembalian** sudah sesuai.
   - Scan QR, dan biarkan sistem bekerja otomatis.

---
© 2026 Developed by Antigravity for **KODEIN SCHOOL**.
