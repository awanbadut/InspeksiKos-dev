# 🏠 InspeksiKos

<p align="center">
  <img src="./frontend/public/logo.jpg" alt="Logo InspeksiKos" width="180" style="border-radius: 12px;"/>
</p>

<h3 align="center">
  Platform Automated Fact-Checking Fasilitas Kos Berbasis Cloud, AI Vision & Real-time Notifications
</h3>

<p align="center">
  <a href="https://www.inspeksikos.web.id"><strong>🌐 Live Website: https://www.inspeksikos.web.id</strong></a>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16%20(Turbopack)-black?style=for-the-badge&logo=next.js" alt="Next.js"/></a>
  <a href="https://nestjs.com/"><img src="https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs" alt="NestJS"/></a>
  <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Gemini%20AI%20Vision-Multi--Model-blue?style=for-the-badge&logo=google-gemini" alt="Gemini AI"/></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"/></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-NeonDB-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL"/></a>
  <a href="https://fonnte.com/"><img src="https://img.shields.io/badge/WhatsApp-Fonnte%20API-25D366?style=for-the-badge&logo=whatsapp" alt="WhatsApp"/></a>
  <a href="https://midtrans.com/"><img src="https://img.shields.io/badge/Payment-Midtrans%20Sandbox-002D62?style=for-the-badge" alt="Midtrans"/></a>
  <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-Frontend-black?style=for-the-badge&logo=vercel" alt="Vercel"/></a>
</p>

---

## 📌 Tentang InspeksiKos

**InspeksiKos** adalah platform *automated fact-checking* (SaaS) berbasis Cloud dan AI yang dirancang untuk mengatasi masalah **"catfishing iklan kos"** di sekitar kampus Politeknik Negeri Padang (PNP) dan kota Padang.

Melalui perpaduan **Gemini AI Vision Multi-Model**, **Rule-Based Engine**, **Watermarking GPS**, dan **WhatsApp & Email Transactional Notifications**, InspeksiKos menghubungkan mahasiswa pencari kos dengan mitra verifikator independen untuk menghasilkan laporan validasi fisik yang independen dan terpercaya.

---

## ⚙️ Alur Kerja Sistem (System Pipeline)

```mermaid
graph TD
    A[🎓 Mahasiswa Order Inspeksi] --> B[💳 Midtrans / Simulator Payment]
    B --> C{Status Paid?}
    C -- Ya --> D[📡 Broadcast Notifikasi WA & Email ke Inspektur]
    C -- Ya --> E[🔎 Gojek-Style Matchmaking Radar]
    E -- Klaim --> F[🛵 Inspektur Audit Lapangan]
    F --> G[📸 Kamera & Watermarking GPS Canvas]
    G --> H[⚙️ Backend NestJS]
    H --> I[🤖 Gemini AI Vision Multi-Model Rotation]
    I --> J[⚖️ Rule-Based Engine Evaluation]
    J --> K[📄 Dynamic PDF Scorecard + Photo Appendix]
    K --> L[📬 Notifikasi WA & Email Hasil Laporan Selesai]
```

---

## 🔥 Fitur Unggulan (Core Features)

### 🎓 Bagi Mahasiswa (Pencari Kos)
* **Single & Multi-Kos Comparison**: Mengajukan audit kos tunggal atau membandingkan beberapa kos sekaligus dalam satu paket order.
* **Resume Payment**: Tombol *Bayar Sekarang* dinamis jika pemesanan tertunda, lengkap dengan propagasi status lunas otomatis ke semua kos se-grup.
* **Matchmaking Radar 15s Fallback**: Tampilan pencarian inspektur real-time dengan batas waktu 15 detik. Jika verifikator sibuk, pencarian dilanjutkan secara *background* tanpa mengunci layar pengguna.
* **Scorecard PDF & AI Consultant**: Laporan hasil audit resmi dilengkapi nilai kelayakan (%), uji lab TDS & Speedtest, foto bukti lapangan, serta **AI Chatbot Consultant** interaktif untuk konsultasi laporan.

### 🕵️‍♂️ Bagi Inspektur (Verifikator Lapangan)
* **Real-time Order Notification**: Notifikasi pesan WhatsApp (Fonnte API) dan Email instan begitu ada order lunas baru yang siap diklaim.
* **Live Watermark Engine**: Foto fasilitas yang diambil dari kamera HP otomatis diberi stempel nama kos, koordinat GPS presisi, dan timestamp.
* **Speedtest & TDS Meter Input**: Penginputan nilai kelayakan air bersih dan tes kecepatan internet kamar kos.
* **Indikator Upload Loading**: Visualisasi spinner status pengunggahan media secara langsung.

### 👑 Bagi Administrator
* **Custom Audit Ruleset Manager**: Konfigurasi bobot nilai (*weight*) dan penalti (*penalty*) fasilitas secara fleksibel di dashboard admin.
* **Inspector & User Management**: Kelola data pengguna, perizinan akun verifikator, dan monitoring transaksi.

---

## 🤖 Arsitektur Multi-Model AI & Round-Robin Key Rotation

Untuk menjamin layanan AI selalu aktif tanpa hambatan kuota (*Rate Limit / 429 Error*), backend InspeksiKos dilengkapi arsitektur **Round-Robin Key Rotation + 5-Model Fallback Chain**:

```text
[ Incoming Request ]
         │
         ▼
[ Round-Robin Key Selector ] (Rotasi di antara 3 API Keys)
         │
         ▼
[ Primary Model: Gemini 2.5 Flash ]
         │ (Jika Limit Exceeded)
         ▼
[ Fallback 1: Gemini 2.5 Flash Lite ]
         │ (Jika Limit Exceeded)
         ▼
[ Fallback 2: Gemini 3.1 Flash Lite ]
         │ (Jika Limit Exceeded)
         ▼
[ Fallback 3: Gemini 3.5 Flash ]
         │ (Jika Limit Exceeded)
         ▼
[ Fallback 4: Gemini 3 Flash ]
```

---

## 🛠️ Tech Stack & Infrastruktur

| Layer | Teknologi | Fungsi / Peran | Platform Hosting |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router + Turbopack) | Framework UI & Client Routing | **Vercel** |
| **Backend** | NestJS 10 (TypeScript) | API Gateway & Service Logic | **Linux VPS (PM2)** |
| **Database** | PostgreSQL (NeonDB) | Relational Database Serverless | **Neon Cloud** |
| **Storage** | Supabase Storage | Penyimpanan Foto & PDF Report | **Supabase Cloud** |
| **AI Vision** | Gemini AI Multi-Model | Ekstraksi Fitur Visual Foto Audit | **Google AI Studio** |
| **WhatsApp** | Fonnte API Gateway | Broadcast Order & Alert WA | **Fonnte** |
| **Payment** | Midtrans Sandbox / Simulator | Gateaway Pembayaran QRIS & E-Wallet | **Midtrans** |
| **CI/CD** | GitHub Actions (Self-Hosted Runner) | Build & Deploy Otomatis | **VPS Linux** |

---

## 📂 Struktur Repositori

```text
InspeksiKos-dev/
├── frontend/                       # Application Next.js 16 (Vercel)
│   ├── app/                        # App Router Pages & Components
│   │   ├── (auth)/                 # Login & Register (Direct Routing)
│   │   ├── dashboard/              # Dasbor Mahasiswa, Inspektur & Modals
│   │   ├── admin/                  # Dasbor Administrator & Rules Manager
│   │   └── payment/                # Payment Gateway & Simulator
│   ├── public/                     # Optimized WebP Assets & Logos
│   └── lib/                        # Axios Client & Interceptors
├── backend/                        # Application NestJS 10 (VPS PM2)
│   ├── src/
│   │   ├── auth/                   # JWT Authentication & OTP
│   │   ├── properties/             # Manajemen Properti & Grouping
│   │   ├── inspections/            # Sesi Audit & Matchmaking
│   │   ├── audit/                  # Rule-Based Engine Evaluation
│   │   ├── gemini/                 # Multi-Model AI & Key Rotation
│   │   ├── notification/           # Fonnte WhatsApp & Nodemailer SMTP
│   │   └── pdf/                    # Generator PDF Scorecard + Photo Appendix
└── .github/workflows/              # CI/CD Workflows (Backend & Frontend)
```

---

## 💻 Panduan Jalankan Secara Lokal (Local Setup)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/awanbadut/InspeksiKos-dev.git
cd InspeksiKos-dev

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Variables (`backend/.env`)
Buat file `.env` di folder `backend/`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:...@ep-...aws.neon.tech/neondb?sslmode=require
JWT_SECRET=super_secret_inspeksikos_jwt_key_2026

# Gemini Multi-Keys (Dipisahkan koma)
GEMINI_API_KEYS=key_1,key_2,key_3

# Supabase Storage
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_BUCKET=inspeksikos-photos

# WhatsApp Fonnte API
FONNTE_TOKEN=your_fonnte_token
FRONTEND_URL=http://localhost:3000
```

### 3. Jalankan Aplikasi
```bash
# Terminal 1: Backend NestJS
cd backend && npm run start:dev

# Terminal 2: Frontend Next.js
cd frontend && npm run dev
```
Buka **http://localhost:3000** di browser Anda.

---

## ⚡ Pipeline CI/CD Optimization

Pengantaran kode diotomatisasi dengan **GitHub Actions** yang dilengkapi fitur **Automatic Concurrency Cancellation**:
* `concurrency.cancel-in-progress: true` ➔ Secara otomatis membatalkan antrean build usang di VPS ketika ada commit baru yang di-push, menjamin proses deployment selalu berlangsung instan dalam hitungan detik.

---

## 🎓 Pengembang

* **Zikry Kurniawan** — NIM `2311081042` — TRPL 3A — **Politeknik Negeri Padang (2026)**
