# 🏠 InspeksiKos — Developer Guide v2

> **Implementasi Gemini Vision dan Rule-Based untuk Audit Komparasi Properti pada InspeksiKos Berbasis Cloud Terintegrasi CI/CD**
>
> Zikry Kurniawan · NIM 2311081042 · TRPL 3A · Politeknik Negeri Padang · 2026

---

## Daftar Isi

- [Overview Sistem](#overview-sistem)
- [Tech Stack](#tech-stack)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Struktur Repo](#struktur-repo)
- [Setup Lokal](#setup-lokal)
- [Database Schema (ERD)](#database-schema-erd)
- [Class Diagram — Layer Architecture](#class-diagram--layer-architecture)
- [API Endpoints](#api-endpoints)
- [Alur Bisnis & Flowchart](#alur-bisnis--flowchart)
- [Gemini Vision Integration](#gemini-vision-integration)
- [Rule-Based Audit Engine](#rule-based-audit-engine)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Role & Akses](#role--akses)
- [Halaman Utama (UI)](#halaman-utama-ui)

---

## Overview Sistem

InspeksiKos adalah platform **Cloud SaaS berbasis Automated Fact-Checking** untuk validasi properti kos di Kota Padang. Berdasarkan data primer (wawancara 30 mahasiswa, Januari 2025), **67% mahasiswa perantau** pernah mengalami ketidaksesuaian antara foto iklan dengan kondisi properti asli (_catfishing_).

**Proses kerja sistem dalam 3 tahap:**

```
1. EXTRACT   → Gemini AI Vision mengekstrak fasilitas dari foto aktual lapangan → JSON terstruktur
2. COMPARE   → Rule-Based Engine membandingkan JSON ekstraksi vs data klaim iklan mahasiswa
3. REPORT    → Audit Scorecard digenerate ke PDF + dikirim ke mahasiswa via URL download
```

**Variabel Penelitian:**

| Jenis | Isi |
|---|---|
| **Input** | Citra properti aktual, data klaim iklan, data teknis (TDS meter, Speedtest) |
| **Proses** | Output ekstraksi AI (JSON), aturan logika Rule-Based |
| **Output** | Audit Scorecard PDF + Confidence Level (`VALID` / `PARTIAL_VALID` / `FATAL_FRAUD`) |

---

## Tech Stack

| Layer | Teknologi | Hosting |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS | Vercel |
| Backend | NestJS + TypeScript | Google Cloud Run |
| Database | PostgreSQL | Neon |
| Storage | Supabase Storage | Supabase |
| AI Vision | Gemini 1.5 Flash API | Google AI Studio |
| Auth | JWT (access + refresh token) — RFC 7519 | — |
| CI/CD | GitHub Actions | — |
| ORM | TypeORM | — |

**Library utama NestJS:**

```
@nestjs/common, @nestjs/core     → DI container, dekorator, lifecycle
@nestjs/jwt, @nestjs/passport    → Autentikasi JWT
@nestjs/typeorm                  → ORM ke PostgreSQL
multer                           → File upload (foto properti)
axios                            → HTTP client ke Gemini AI Vision API
@nestjs/config                   → Manajemen environment variables
class-validator, class-transformer → Validasi & transformasi DTO
```

---

## Arsitektur Sistem

Sistem menggunakan **distributed system architecture berbasis decoupled services**, terdiri dari 4 lapisan yang di-deploy secara independen:

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│            Smartphone / Laptop (Browser)                │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│              CDN & FRONTEND (Vercel)                    │
│           Next.js App — Edge Network CDN                │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API / JWT
┌──────────────────────▼──────────────────────────────────┐
│           API GATEWAY — BACKEND (Google Cloud Run)      │
│                NestJS — Titik masuk tunggal             │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│   │ ruleBasedEng │  │ geminiService│  │  pdfService │  │
│   └──────────────┘  └──────┬───────┘  └─────────────┘  │
└─────────────────────────── │ ──────────────────────────┘
            │                │                │
┌───────────▼──┐   ┌─────────▼──────┐  ┌─────▼──────────┐
│  DATABASE    │   │   AI SERVICE   │  │    STORAGE     │
│  Neon        │   │ Google AI      │  │  Supabase      │
│ (PostgreSQL) │   │ Studio (Gemini)│  │  Cloud Storage │
└──────────────┘   └────────────────┘  └────────────────┘
                        ↑ semua dipicu oleh ↑
┌─────────────────────────────────────────────────────────┐
│              CI/CD PIPELINE (GitHub Actions)            │
│         build → test → deploy (Vercel + Cloud Run)      │
└─────────────────────────────────────────────────────────┘
```

---

## Struktur Repo

```
inspeksikos/
├── frontend/                       # Next.js 14 App
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/              # loginPage
│   │   │   └── register/           # registerPage
│   │   ├── (mahasiswa)/
│   │   │   ├── dashboard/          # Dashboard mahasiswa
│   │   │   ├── upload/             # Upload foto & request inspeksi
│   │   │   ├── status/             # Status & manajemen order
│   │   │   ├── riwayat/            # Riwayat order (riwayatPage)
│   │   │   └── laporan/[id]/       # Unduh laporan PDF (laporanPage)
│   │   ├── (inspektur)/
│   │   │   ├── dashboard/          # Dashboard inspektur
│   │   │   └── tugas/[id]/
│   │   │       └── inspeksi/       # inspeksiPage (input TDS, internet, foto)
│   │   └── (admin)/
│   │       └── dashboard/          # auditRulePage (kelola ruleset)
│   ├── components/
│   ├── lib/
│   │   └── api.ts                  # Axios instance + interceptors JWT
│   └── public/
│
├── backend/                        # NestJS App
│   ├── src/
│   │   ├── auth/                   # authController + JWT strategy
│   │   ├── profile/                # profileController + profileService
│   │   ├── properties/             # propertiController + service + entity (property)
│   │   ├── inspections/            # inspeksiController + service + entity (inspection)
│   │   ├── audit/                  # auditController + ruleBasedEngine
│   │   ├── riwayat/                # riwayatController + service
│   │   ├── gemini/                 # geminiService (AI Vision integration)
│   │   ├── pdf/                    # pdfService (generate laporan PDF)
│   │   ├── storage/                # storageService (Supabase)
│   │   └── database/
│   │       └── migrations/
│   └── test/
│
└── .github/
    └── workflows/
        ├── frontend.yml
        └── backend.yml
```

---

## Setup Lokal

### Prerequisites

- Node.js >= 20
- npm >= 10
- PostgreSQL (atau pakai Neon cloud — direkomendasikan)
- Akun Google AI Studio (untuk Gemini API Key)
- Akun Supabase (untuk storage)

### 1. Clone & Install

```bash
git clone https://github.com/<username>/inspeksikos.git
cd inspeksikos

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Setup Environment

Salin file `.env.example` ke `.env` di masing-masing folder (lihat bagian [Environment Variables](#environment-variables)).

### 3. Jalankan Migration Database

```bash
cd backend
npm run migration:run
```

### 4. Seed Audit Rules (opsional)

```bash
npm run seed:audit-rules
```

### 5. Jalankan Dev Server

```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm run start:dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

---

## Database Schema (ERD)

Sistem menggunakan **7 tabel utama** di PostgreSQL dengan notasi Crow's Foot.

### Relasi Antar Tabel

| Relasi | Jenis | Keterangan |
|---|---|---|
| `USERS` → `PROPERTIES` | 1 : N | Mahasiswa bisa mendaftarkan banyak properti |
| `USERS` → `INSPECTIONS` | 1 : N | Inspektur bisa menangani banyak sesi inspeksi |
| `USERS` → `AUDIT_RULES` | 1 : N | Admin membuat banyak set aturan audit |
| `PROPERTIES` → `INSPECTIONS` | 1 : N | Satu properti bisa diinspeksi berkali-kali |
| `INSPECTIONS` → `INSPECTION_PHOTOS` | 1 : N | Satu sesi inspeksi memiliki banyak foto |
| `INSPECTIONS` → `AUDIT_REPORTS` | 1 : 1 | Satu inspeksi menghasilkan tepat satu laporan |
| `AUDIT_RULES` → `AUDIT_RULE_ITEMS` | 1 : N | Satu set aturan terdiri dari banyak item fasilitas |

---

### Tabel `USERS`

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `user_id` | uuid | PK | Identitas unik pengguna |
| `first_name` | varchar | — | Nama depan |
| `last_name` | varchar | — | Nama belakang |
| `email` | varchar | UK | Email unik untuk login |
| `password_hash` | varchar | — | Hash bcrypt password |
| `role` | enum | — | `mahasiswa` / `inspektur` / `admin` |
| `created_at` | timestamp | — | Waktu pembuatan akun |
| `updated_at` | timestamp | — | Waktu terakhir update |

---

### Tabel `PROPERTIES`

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `property_id` | uuid | PK | Identitas unik properti |
| `user_id` | uuid | FK → USERS | Mahasiswa pemilik data |
| `name` | varchar | — | Nama properti/kos |
| `address` | text | — | Alamat lengkap |
| `description` | text | — | Deskripsi umum fasilitas |
| `claim_data` | jsonb | — | Data klaim fasilitas dari iklan (JSON) |
| `status` | enum | — | `pending` / `inspected` / `audited` |
| `created_at` | timestamp | — | Waktu data dibuat |

---

### Tabel `INSPECTIONS`

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `inspection_id` | uuid | PK | Identitas unik sesi inspeksi |
| `property_id` | uuid | FK → PROPERTIES | Properti yang diinspeksi |
| `inspector_id` | uuid | FK → USERS | Inspektur yang bertugas |
| `status` | enum | — | `assigned` / `in_progress` / `completed` |
| `extracted_data` | jsonb | — | Hasil ekstraksi Gemini AI Vision (JSON) |
| `tds_value` | decimal | — | Kualitas air TDS meter (mg/L) |
| `internet_speed` | decimal | — | Kecepatan internet speed test (Mbps) |
| `assigned_at` | timestamp | — | Waktu inspeksi ditugaskan |
| `completed_at` | timestamp | — | Waktu inspeksi selesai |

---

### Tabel `INSPECTION_PHOTOS`

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `photo_id` | uuid | PK | Identitas unik foto |
| `inspection_id` | uuid | FK → INSPECTIONS | Sesi inspeksi terkait |
| `photo_url` | text | — | URL foto di Supabase Storage |
| `room_type` | varchar | — | Jenis ruangan (kamar tidur, kamar mandi, dll) |
| `uploaded_at` | timestamp | — | Waktu foto diupload |

---

### Tabel `AUDIT_REPORTS`

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `report_id` | uuid | PK | Identitas unik laporan |
| `inspection_id` | uuid | FK → INSPECTIONS | Relasi One-to-One |
| `score` | decimal | — | Skor audit akhir (0–100%) |
| `confidence_level` | enum | — | `VALID` / `PARTIAL_VALID` / `FATAL_FRAUD` |
| `breakdown_data` | jsonb | — | Rincian skor per fasilitas (JSON) |
| `pdf_url` | text | — | URL PDF laporan di Cloud Storage |
| `generated_at` | timestamp | — | Waktu laporan digenerate |

---

### Tabel `AUDIT_RULES`

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `rule_id` | uuid | PK | Identitas unik set aturan |
| `name` | varchar | — | Nama set aturan (contoh: Standard Kos v1) |
| `version` | varchar | — | Versi semantic versioning |
| `is_active` | boolean | — | Hanya satu set aktif pada satu waktu |
| `created_by` | uuid | FK → USERS | Admin yang membuat |
| `created_at` | timestamp | — | Waktu dibuat |

---

### Tabel `AUDIT_RULE_ITEMS`

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `item_id` | uuid | PK | Identitas unik item aturan |
| `rule_id` | uuid | FK → AUDIT_RULES | Set aturan induk |
| `facility_name` | varchar | — | Nama fasilitas (AC, WiFi, kamar mandi, dll) |
| `weight` | decimal | — | Bobot dalam perhitungan skor (0.0–1.0) |
| `penalty` | decimal | — | Penalti jika fasilitas tidak sesuai klaim |
| `threshold_type` | varchar | — | Tipe validasi: `boolean` / `range` / `numeric` |
| `threshold_value` | text | — | Nilai ambang batas untuk pengukuran teknis |

---

## Class Diagram — Layer Architecture

Sistem mengikuti arsitektur **4 lapisan NestJS**. Alur dependency (`<<use>>`) mengalir searah: **Page → Controller → Service → Entity**.

---

### Page Layer (Next.js Frontend)

| Kelas | Atribut Utama | Method Utama |
|---|---|---|
| `loginPage` | `emailController: string`, `passwordController: string` | `getSession()`, `showFormLogin()`, `insertData(email, password)`, `errorHandling()`, `redirectDashboardPage()` |
| `registerPage` | `emailController: string`, `passwordController: string`, `nameController: string`, `roleController: string` | `insertData()`, `submit()`, `errorHandling()`, `redirectLoginPage()` |
| `profilePage` | `firstNameController: string`, `lastNameController: string` | `editButton()`, `showFormEdit()`, `updateData()`, `submit()`, `validateInput()`, `errorHandling()` |
| `propertiPage` | `namaController: string`, `alamatController: string`, `claimDataController: map` | `showFormProperti()`, `cekEmailValid()`, `insertData(nama, alamat, claimData)`, `submit()`, `errorHandling()` |
| `inspeksiPage` | `fotoAktualController: file`, `tdsController: float`, `internetController: float`, `roomTypeController: string` | `showFormInspeksi()`, `uploadFoto(file, roomType)`, `inputDataTeknis(tds, internet)`, `triggerAudit()`, `showAuditResult()`, `errorHandling()` |
| `riwayatPage` | `dateTime: date`, `findRiwayat: list` | `loadRiwayat()`, `showGrafik()`, `showData()`, `selectDateCalendar()`, `errorHandling()` |
| `laporanPage` | `reportId: string`, `downloadUrl: string` | `showScorecard()`, `downloadPDF()`, `showBreakdown()`, `errorHandling()` |
| `auditRulePage` | `role_id: uuid`, `name: string`, `version: string`, `is_active: boolean`, `created_at: datetime` | `save()`, `getActiveRule()` — *contains* `auditRuleItem` |

---

### Controller Layer (NestJS Backend)

| Kelas | Method Utama | Catatan |
|---|---|---|
| `authController` | `login()`, `register()`, `validateEmailUniq(): boolean`, `hashPassword(): string`, `generateJWT(): string`, `validateToken(): boolean` | Mengelola autentikasi JWT access + refresh token |
| `profileController` | `updateProfile()`, `validateData(): boolean`, `getProfile()` | Update data profil user |
| `propertiController` | `createProperty()`, `updateProperty()`, `getPropertyByUser(): list`, `deleteProperty()` | CRUD properti kos |
| `inspeksiController` | `createInspeksi()`, `uploadFoto()`, `inputDataTeknis()`, `triggerAudit()`, `getInspeksiById()` | Kelola sesi inspeksi lapangan |
| `auditController` | `executeAudit()`, `getReport()`, `generatePDF()`, `getDownloadUrl(): string` | Orkestrasi alur audit otomatis |
| `riwayatController` | `getRiwayat(): list`, `getRiwayatByDate()`, `getRiwayatByMonth(): list` | Riwayat inspeksi per user |

---

### Service Layer (Core Logic)

| Kelas | Atribut | Method Utama |
|---|---|---|
| `geminiService` | `apiKey: string`, `modelName: string` | `extractFasilitas(imageUrl): map`, `buildPrompt(): string`, `parseResponse(response): json`, `retryRequest(maxRetry): void` |
| `ruleBasedEngine` | `ruleItems: list`, `totalWeight: decimal` | `execute(claimData, extractedData): map`, `compareAttribute(claim, actual): boolean`, `calculateScore(): decimal`, `determineConfidenceLevel(score): string`, `generateBreakdown(): json` |
| `pdfService` | `templatePath: string` | `renderTemplate(reportData): buffer`, `uploadToStorage(buffer): string`, `generateSignedUrl(path): string` |
| `storageService` | `bucketName: string` | `uploadFile(file, path): string`, `getSignedUrl(path, ttl): string`, `deleteFile(path): void` |

---

### Entity Layer (TypeORM — Sesuai ERD)

| Entity | Tabel DB | Relasi |
|---|---|---|
| `user` | `USERS` | `@OneToMany` → `property`, `@OneToMany` → `inspection` (sebagai inspector) |
| `property` | `PROPERTIES` | `@ManyToOne` → `user`, `@OneToMany` → `inspection` |
| `inspection` | `INSPECTIONS` | `@ManyToOne` → `property`, `@ManyToOne` → `user` (inspector), `@OneToMany` → `inspectionPhoto`, `@OneToOne` → `auditReport` |
| `inspectionPhoto` | `INSPECTION_PHOTOS` | `@ManyToOne` → `inspection` |
| `auditReport` | `AUDIT_REPORTS` | `@OneToOne` → `inspection` |
| `auditRule` | `AUDIT_RULES` | `@ManyToOne` → `user` (created_by), `@OneToMany` → `auditRuleItem` |
| `auditRuleItem` | `AUDIT_RULE_ITEMS` | `@ManyToOne` → `auditRule` |

**Method pada setiap entity:**

```
user           → save(), findByEmail(), findById(), update()
property       → save(), findByUserId(): list, update()
inspection     → save(), findByPropertyId(): list, update()
inspectionPhoto→ save(), findByInspectionId(): list
auditReport    → save(), findByInspectionId(), findByUserAndMonth(): list, findByDate(): list
auditRule      → save(), getActiveRule()
auditRuleItem  → save(), findByRuleId(): list
```

---

## API Endpoints

Dokumentasi ini mencakup seluruh endpoint REST API backend InspeksiKos, skema autentikasi, otorisasi berbasis role (`mahasiswa`, `inspektur`, `admin`), parameter request, serta struktur respon JSON sukses dan error secara detail.

---

##### 🔒 Skema Autentikasi & Otorisasi

API InspeksiKos menggunakan **JWT (JSON Web Token)** Bearer Authentication. 
Setiap request yang memerlukan autentikasi harus menyertakan header berikut:

```http
Authorization: Bearer <your_access_token>
```

##### 👥 Pembagian Role Pengguna
*   **`mahasiswa`**: Mendaftarkan properti (kos), melihat kos miliknya, mengajukan permintaan inspeksi, dan melihat hasil laporan audit.
*   **`inspektur`**: Melihat tugas inspeksi aktif yang ditugaskan kepadanya, mengisi data teknis (TDS air, kecepatan internet), mengunggah foto bukti fisik kos, dan menandai inspeksi selesai.
*   **`admin`**: Mengelola seluruh pengguna (mahasiswa & inspektur), menunjuk inspektur ke kos tertentu, mengatur aturan penilaian AI (Audit Rules), memicu audit AI, serta melihat seluruh riwayat kos & laporan kepatuhan.

---

##### 🚀 Daftar Endpoint API

##### 🔑 1. Autentikasi (`/auth`)

##### 📌 A. Registrasi Pengguna Baru (`POST /auth/register`)
Mendaftarkan akun baru. Secara default, pendaftaran publik ditujukan untuk role `mahasiswa`. Admin dapat mendaftarkan akun dengan role lain.

*   **Role Akses:** Publik (Semua Pengguna)
*   **Body Request (JSON):**
    ```json
    {
      "email": "mahasiswa.padang@gmail.com",
      "password": "secretpassword123",
      "first_name": "Rian",
      "last_name": "Pratama",
      "phone_number": "081234567890",
      "role": "mahasiswa"
    }
    ```
*   **Respon Sukses (`210 Created`):**
    ```json
    {
      "message": "Registrasi berhasil",
      "user": {
        "user_id": "8a7c2b6e-ea78-4395-9f5b-1c5c0c9cbcae",
        "email": "mahasiswa.padang@gmail.com",
        "first_name": "Rian",
        "last_name": "Pratama",
        "phone_number": "081234567890",
        "role": "mahasiswa",
        "created_at": "2026-06-10T01:15:30.000Z",
        "updated_at": "2026-06-10T01:15:30.000Z"
      }
    }
    ```
*   **Respon Error (`400 Bad Request` - Email sudah terdaftar):**
    ```json
    {
      "message": "Email sudah terdaftar",
      "error": "Bad Request",
      "statusCode": 400
    }
    ```

##### 📌 B. Login Pengguna (`POST /auth/login`)
Melakukan autentikasi menggunakan email dan password untuk mendapatkan access token dan refresh token.

*   **Role Akses:** Publik (Semua Pengguna)
*   **Body Request (JSON):**
    ```json
    {
      "email": "mahasiswa.padang@gmail.com",
      "password": "secretpassword123"
    }
    ```
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YTdjMmI2ZS1lYTc4LTQzOTUtOWY1Yi0xYzVjMGM5Y2JjYWUiLCJlbWFpbCI6Im1haGFzaXN3YS5wYWRhbmdAZ21haWwuY29tIiwicm9sZSI6Im1haGFzaXN3YSIsImlhdCI6MTc4MTE4ODAwMCwiZXhwIjoxNzgxMTkxNjAwfQ.signature",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YTdjMmI2ZS1lYTc4LTQzOTUtOWY1Yi0xYzVjMGM5Y2JjYWUiLCJpYXQiOjE3ODExODgwMDAsImV4cCI6MTc4MTc5MjgwMH0.signature",
      "role": "mahasiswa",
      "email": "mahasiswa.padang@gmail.com"
    }
    ```
*   **Respon Error (`401 Unauthorized` - Password salah):**
    ```json
    {
      "message": "Email atau password salah",
      "error": "Unauthorized",
      "statusCode": 401
    }
    ```

##### 📌 C. Refresh Access Token (`POST /auth/refresh`)
Memperbarui access token yang telah kedaluwarsa menggunakan refresh token yang valid.

*   **Role Akses:** Publik (Semua Pengguna)
*   **Body Request (JSON):**
    ```json
    {
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YTdjMmI2ZS1lYTc4LTQzOTUtOWY1Yi0xYzVjMGM5Y2JjYWUiLCJpYXQiOjE3ODExODgwMDAsImV4cCI6MTc4MTc5MjgwMH0.signature"
    }
    ```
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YTdjMmI2ZS1lYTc4LTQzOTUtOWY1Yi0xYzVjMGM5Y2JjYWUiLCJlbWFpbCI6Im1haGFzaXN3YS5wYWRhbmdAZ21haWwuY29tIiwicm9sZSI6Im1haGFzaXN3YSIsImlhdCI6MTc4MTE4OTAwMCwiZXhwIjoxNzgxMTkyNjAwfQ.signature"
    }
    ```

##### 📌 D. Logout (`POST /auth/logout`)
Membersihkan session/token (dihandle di client dengan menghapus token dari storage).

*   **Role Akses:** Publik (Semua Pengguna)
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "message": "Logout berhasil"
    }
    ```

##### 📌 E. Ambil Daftar Inspektur (`GET /auth/inspectors`)
Mengambil list seluruh inspektur kos yang aktif. Digunakan oleh Admin untuk penugasan inspeksi.

*   **Role Akses:** `admin`
*   **Respon Sukses (`200 OK`):**
    ```json
    [
      {
        "user_id": "fd9031c2-cbb8-4f81-9b62-11a5b8a0cbcf",
        "first_name": "Deni",
        "last_name": "Setiawan",
        "email": "inspektur.deni@inspeksikos.com",
        "phone_number": "082345678901",
        "role": "inspektur",
        "created_at": "2026-06-01T08:00:00.000Z"
      }
    ]
    ```

##### 📌 F. Ambil Daftar Seluruh Pengguna (`GET /auth/users`)
Mengambil seluruh akun yang terdaftar dalam platform.

*   **Role Akses:** `admin`
*   **Respon Sukses (`200 OK`):**
    ```json
    [
      {
        "user_id": "8a7c2b6e-ea78-4395-9f5b-1c5c0c9cbcae",
        "first_name": "Rian",
        "last_name": "Pratama",
        "email": "mahasiswa.padang@gmail.com",
        "phone_number": "081234567890",
        "role": "mahasiswa",
        "created_at": "2026-06-10T01:15:30.000Z"
      },
      {
        "user_id": "fd9031c2-cbb8-4f81-9b62-11a5b8a0cbcf",
        "first_name": "Deni",
        "last_name": "Setiawan",
        "email": "inspektur.deni@inspeksikos.com",
        "phone_number": "082345678901",
        "role": "inspektur",
        "created_at": "2026-06-01T08:00:00.000Z"
      }
    ]
    ```

---

##### 🏠 2. Pengelolaan Kos/Properti (`/properties`)

##### 📌 A. Tambah Properti Baru (`POST /properties`)
Mahasiswa mendaftarkan properti kos miliknya beserta klaim iklan fasilitas (WiFi, AC, Air Bersih, dll.) beserta koordinat peta.

*   **Role Akses:** `mahasiswa`, `admin`
*   **Body Request (JSON):**
    ```json
    {
      "name": "Kos Putri Syariah Sejahtera",
      "address": "Jalan Gunung Pangilun No. 45, Padang Utara, Padang",
      "description": "Kos khusus mahasiswi dekat kampus UNP, fasilitas lengkap dan bersih.",
      "claim_data": {
        "location": {
          "latitude": -0.923485,
          "longitude": 100.362947
        },
        "fasilitas": {
          "wifi": {
            "ada": true,
            "router_terlihat": true
          },
          "kualitas_air": {
            "nilai": 120.0
          },
          "kecepatan_internet": {
            "nilai": 30.0
          },
          "kasur_springbed": {
            "ada": true
          },
          "kamar_mandi_dalam": {
            "ada": true
          }
        }
      }
    }
    ```
*   **Respon Sukses (`201 Created`):**
    ```json
    {
      "property_id": "df2a9c3e-b811-4258-aa82-938ba0cb924e",
      "user_id": "8a7c2b6e-ea78-4395-9f5b-1c5c0c9cbcae",
      "name": "Kos Putri Syariah Sejahtera",
      "address": "Jalan Gunung Pangilun No. 45, Padang Utara, Padang",
      "description": "Kos khusus mahasiswi dekat kampus UNP, fasilitas lengkap dan bersih.",
      "claim_data": {
        "location": {
          "latitude": -0.923485,
          "longitude": 100.362947
        },
        "fasilitas": {
          "wifi": {
            "ada": true,
            "router_terlihat": true
          },
          "kualitas_air": {
            "nilai": 120
          },
          "kecepatan_internet": {
            "nilai": 30
          },
          "kasur_springbed": {
            "ada": true
          },
          "kamar_mandi_dalam": {
            "ada": true
          }
        }
      },
      "status": "pending",
      "created_at": "2026-06-10T01:20:00.000Z"
    }
    ```

##### 📌 B. Ambil Daftar Properti (`GET /properties`)
Melihat daftar properti. Mahasiswa hanya melihat properti miliknya sendiri. Admin melihat semua properti di platform.

*   **Role Akses:** `mahasiswa`, `admin`
*   **Respon Sukses (`200 OK` - Respon untuk Mahasiswa):**
    ```json
    [
      {
        "property_id": "df2a9c3e-b811-4258-aa82-938ba0cb924e",
        "user_id": "8a7c2b6e-ea78-4395-9f5b-1c5c0c9cbcae",
        "name": "Kos Putri Syariah Sejahtera",
        "address": "Jalan Gunung Pangilun No. 45, Padang Utara, Padang",
        "description": "Kos khusus mahasiswi dekat kampus UNP, fasilitas lengkap dan bersih.",
        "claim_data": {
          "location": {
            "latitude": -0.923485,
            "longitude": 100.362947
          },
          "fasilitas": {
            "wifi": { "ada": true, "router_terlihat": true },
            "kualitas_air": { "nilai": 120 },
            "kecepatan_internet": { "nilai": 30 }
          }
        },
        "status": "pending",
        "created_at": "2026-06-10T01:20:00.000Z"
      }
    ]
    ```

##### 📌 C. Ambil Detail Properti (`GET /properties/:id`)
Mengambil rincian data properti berdasarkan ID.

*   **Role Akses:** Semua role yang terautentikasi
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "property_id": "df2a9c3e-b811-4258-aa82-938ba0cb924e",
      "user_id": "8a7c2b6e-ea78-4395-9f5b-1c5c0c9cbcae",
      "name": "Kos Putri Syariah Sejahtera",
      "address": "Jalan Gunung Pangilun No. 45, Padang Utara, Padang",
      "description": "Kos khusus mahasiswi dekat kampus UNP, fasilitas lengkap dan bersih.",
      "claim_data": {
        "location": {
          "latitude": -0.923485,
          "longitude": 100.362947
        },
        "fasilitas": {
          "wifi": { "ada": true, "router_terlihat": true },
          "kualitas_air": { "nilai": 120 },
          "kecepatan_internet": { "nilai": 30 }
        }
      },
      "status": "pending",
      "created_at": "2026-06-10T01:20:00.000Z"
    }
    ```

##### 📌 D. Update Properti (`PATCH /properties/:id`)
Memperbarui rincian kos (misal: nama, alamat, atau klaim fasilitas).

*   **Role Akses:** Pemilik properti (`mahasiswa`) atau `admin`
*   **Body Request (JSON):**
    ```json
    {
      "name": "Kos Putri Syariah Sejahtera (Updated Name)",
      "description": "Update deskripsi kos: WiFi sekarang up-to 50 Mbps."
    }
    ```
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "property_id": "df2a9c3e-b811-4258-aa82-938ba0cb924e",
      "name": "Kos Putri Syariah Sejahtera (Updated Name)",
      "address": "Jalan Gunung Pangilun No. 45, Padang Utara, Padang",
      "description": "Update deskripsi kos: WiFi sekarang up-to 50 Mbps.",
      "claim_data": {
        "location": {
          "latitude": -0.923485,
          "longitude": 100.362947
        },
        "fasilitas": {
          "wifi": { "ada": true, "router_terlihat": true }
        }
      },
      "status": "pending",
      "created_at": "2026-06-10T01:20:00.000Z"
    }
    ```

##### 📌 E. Hapus Properti (`DELETE /properties/:id`)
Menghapus data kos secara permanen dari platform.

*   **Role Akses:** Pemilik properti (`mahasiswa`) atau `admin`
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "message": "Properti berhasil dihapus"
    }
    ```

---

##### 🔍 3. Alur Inspeksi Fisik (`/inspections`)

##### 📌 A. Ajukan Inspeksi Kos (`POST /inspections`)
Mengajukan permohonan inspeksi untuk properti tertentu agar divalidasi fisik oleh inspektur.

*   **Role Akses:** `mahasiswa` (pemilik kos), `admin`
*   **Body Request (JSON):**
    ```json
    {
      "property_id": "df2a9c3e-b811-4258-aa82-938ba0cb924e"
    }
    ```
*   **Respon Sukses (`201 Created`):**
    ```json
    {
      "inspection_id": "e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
      "property_id": "df2a9c3e-b811-4258-aa82-938ba0cb924e",
      "inspector_id": null,
      "status": "assigned",
      "assigned_at": "2026-06-10T01:25:00.000Z",
      "completed_at": null,
      "tds_value": null,
      "internet_speed": null,
      "extracted_data": null,
      "inspector_data": null
    }
    ```

##### 📌 B. Ambil Daftar Inspeksi (`GET /inspections`)
Melihat daftar antrian inspeksi. 
*   `mahasiswa` melihat inspeksi kos miliknya.
*   `inspektur` melihat inspeksi yang didelegasikan kepadanya.
*   `admin` melihat seluruh daftar antrian inspeksi di platform.

*   **Role Akses:** Semua role terautentikasi
*   **Respon Sukses (`200 OK` - Contoh respon untuk Inspektur):**
    ```json
    [
      {
        "inspection_id": "e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
        "property_id": "df2a9c3e-b811-4258-aa82-938ba0cb924e",
        "inspector_id": "fd9031c2-cbb8-4f81-9b62-11a5b8a0cbcf",
        "status": "in_progress",
        "assigned_at": "2026-06-10T01:25:00.000Z",
        "completed_at": null,
        "tds_value": null,
        "internet_speed": null,
        "property": {
          "name": "Kos Putri Syariah Sejahtera",
          "address": "Jalan Gunung Pangilun No. 45, Padang Utara, Padang",
          "claim_data": {
            "location": {
              "latitude": -0.923485,
              "longitude": 100.362947
            }
          }
        }
      }
    ]
    ```

##### 📌 C. Update Status Inspeksi / Penunjukan Inspektur (`PATCH /inspections/:id/status`)
Mengubah status inspeksi (`assigned`, `in_progress`, `completed`). Admin juga menggunakan ini untuk menugaskan seorang `inspektur` ke inspeksi tersebut.

*   **Role Akses:** `admin`, `inspektur` (hanya jika ditugaskan kepadanya)
*   **Body Request (JSON):**
    ```json
    {
      "status": "in_progress",
      "inspector_id": "fd9031c2-cbb8-4f81-9b62-11a5b8a0cbcf"
    }
    ```
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "inspection_id": "e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
      "property_id": "df2a9c3e-b811-4258-aa82-938ba0cb924e",
      "inspector_id": "fd9031c2-cbb8-4f81-9b62-11a5b8a0cbcf",
      "status": "in_progress",
      "assigned_at": "2026-06-10T01:25:00.000Z"
    }
    ```

##### 📌 D. Input Data Teknis Kos (`PATCH /inspections/:id/teknis`)
Menginputkan nilai TDS (kualitas air), kecepatan internet nyata (speedtest), dan evaluasi checklist manual oleh inspektur.

*   **Role Akses:** `inspektur`, `admin`
*   **Body Request (JSON):**
    ```json
    {
      "tds_value": 115.50,
      "internet_speed": 28.40,
      "inspector_data": {
        "checklist": {
          "kasur_springbed": true,
          "kamar_mandi_dalam": true,
          "keamanan_24_jam": false
        },
        "catatan_tambahan": "Kondisi fisik kos sangat bersih, WiFi stabil, air jernih dan tidak berbau."
      }
    }
    ```
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "inspection_id": "e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
      "tds_value": "115.50",
      "internet_speed": "28.40",
      "status": "in_progress",
      "inspector_data": {
        "checklist": {
          "kasur_springbed": true,
          "kamar_mandi_dalam": true,
          "keamanan_24_jam": false
        },
        "catatan_tambahan": "Kondisi fisik kos sangat bersih, WiFi stabil, air jernih dan tidak berbau."
      }
    }
    ```

##### 📌 E. Upload Foto Inspeksi Kamar/Fasilitas (`POST /inspections/:id/photos`)
Mengunggah foto fisik objek kos untuk dianalisis oleh Vision AI (Gemini). API ini menggunakan format `multipart/form-data`.

*   **Role Akses:** `inspektur`, `admin`
*   **Headers:**
    `Content-Type: multipart/form-data`
*   **Form Data:**
    *   `file`: (Unggah file gambar/foto format JPG/PNG)
    *   `room_type`: `kamar_tidur` (atau `kamar_mandi`, `luar_kos`, `koneksi_router`)
*   **Respon Sukses (`201 Created`):**
    ```json
    {
      "photo_id": "c2ba8f6e-ea78-4395-9f5b-1c5c0c9cbcae",
      "inspection_id": "e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
      "photo_url": "https://tqeryt84mmpwjon44527pq.supabase.co/storage/v1/object/public/inspeksikos-photos/inspections/e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae/kamar_tidur_1781190000.jpg",
      "room_type": "kamar_tidur",
      "uploaded_at": "2026-06-10T01:30:00.000Z"
    }
    ```

##### 📌 F. Ambil Foto-Foto Inspeksi (`GET /inspections/:id/photos`)
Mengambil seluruh daftar bukti foto yang diunggah untuk satu sesi inspeksi.

*   **Role Akses:** Semua role terautentikasi
*   **Respon Sukses (`200 OK`):**
    ```json
    [
      {
        "photo_id": "c2ba8f6e-ea78-4395-9f5b-1c5c0c9cbcae",
        "inspection_id": "e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
        "photo_url": "https://tqeryt84mmpwjon44527pq.supabase.co/storage/v1/object/public/inspeksikos-photos/inspections/e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae/kamar_tidur_1781190000.jpg",
        "room_type": "kamar_tidur",
        "uploaded_at": "2026-06-10T01:30:00.000Z"
      }
    ]
    ```

---

##### 🧠 4. Engine Evaluasi Kepatuhan & AI (`/audit`)

##### 📌 A. Ambil Aturan Evaluasi Aktif (`GET /audit/rules`)
Mendapatkan kriteria evaluasi (bobot dan penalti) yang sedang digunakan platform untuk penilaian AI saat ini.

*   **Role Akses:** Semua role terautentikasi
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "rule_id": "c3e9a4f6-8c11-4ea2-9e22-504339055f75",
      "name": "Aturan Default Platform",
      "version": "1.0.0",
      "is_active": true,
      "created_at": "2026-06-05T08:00:00.000Z",
      "items": [
        {
          "item_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
          "facility_name": "wifi",
          "weight": "20.00",
          "penalty": "20.00",
          "threshold_type": "boolean",
          "threshold_value": "true"
        },
        {
          "item_id": "b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e",
          "facility_name": "kualitas_air",
          "weight": "25.00",
          "penalty": "15.00",
          "threshold_type": "numeric",
          "threshold_value": "150.00"
        },
        {
          "item_id": "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
          "facility_name": "kecepatan_internet",
          "weight": "25.00",
          "penalty": "15.00",
          "threshold_type": "numeric",
          "threshold_value": "10.00"
        },
        {
          "item_id": "d4e5f67a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
          "facility_name": "kasur_springbed",
          "weight": "15.00",
          "penalty": "10.00",
          "threshold_type": "boolean",
          "threshold_value": "true"
        },
        {
          "item_id": "e5f67a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
          "facility_name": "kamar_mandi_dalam",
          "weight": "15.00",
          "penalty": "10.00",
          "threshold_type": "boolean",
          "threshold_value": "true"
        }
      ]
    }
    ```

##### 📌 B. Simpan/Ubah Aturan Evaluasi (`POST /audit/rules`)
Memperbarui aturan pembobotan dan penalti evaluasi untuk platform. Endpoint ini otomatis menonaktifkan aturan lama dan mengaktifkan aturan baru.

*   **Role Akses:** `admin`
*   **Body Request (JSON):**
    ```json
    {
      "items": [
        {
          "facility_name": "wifi",
          "weight": 30.0,
          "penalty": 20.0,
          "threshold_type": "boolean",
          "threshold_value": "true"
        },
        {
          "facility_name": "kualitas_air",
          "weight": 20.0,
          "penalty": 15.0,
          "threshold_type": "numeric",
          "threshold_value": "150.0"
        },
        {
          "facility_name": "kecepatan_internet",
          "weight": 20.0,
          "penalty": 15.0,
          "threshold_type": "numeric",
          "threshold_value": "10.0"
        },
        {
          "facility_name": "kasur_springbed",
          "weight": 15.0,
          "penalty": 10.0,
          "threshold_type": "boolean",
          "threshold_value": "true"
        },
        {
          "facility_name": "kamar_mandi_dalam",
          "weight": 15.0,
          "penalty": 10.0,
          "threshold_type": "boolean",
          "threshold_value": "true"
        }
      ]
    }
    ```
*   **Respon Sukses (`201 Created`):**
    ```json
    {
      "rule_id": "d4e9a4f6-8c11-4ea2-9e22-504339055f99",
      "name": "Aturan Kustom Platform",
      "version": "1781190000",
      "is_active": true,
      "created_by_id": "admin_uuid_here",
      "created_at": "2026-06-10T01:35:00.000Z"
    }
    ```

##### 📌 C. Picu/Jalankan Audit AI Kepatuhan (`POST /audit/:inspection_id/run`)
Menjalankan Gemini AI Vision untuk mengekstrak data dari bukti foto fisik, membandingkannya dengan data klaim mahasiswa berdasarkan logika pembobotan aturan aktif, menghitung skor kepatuhan, serta membuat laporan PDF otomatis.

*   **Role Akses:** Semua role terautentikasi (biasanya dipicu oleh `inspektur` atau `admin` saat inspeksi siap)
*   **Respon Sukses (`201 Created`):**
    ```json
    {
      "report_id": "a3ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
      "inspection_id": "e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
      "score": "80.00",
      "confidence_level": "PARTIAL_VALID",
      "pdf_url": "https://tqeryt84mmpwjon44527pq.supabase.co/storage/v1/object/public/inspeksikos-photos/reports/e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae.pdf",
      "generated_at": "2026-06-10T01:40:00.000Z",
      "breakdown_data": {
        "items": [
          {
            "facility": "wifi",
            "status": "MATCH",
            "weight": 20
          },
          {
            "facility": "kualitas_air",
            "status": "MATCH",
            "weight": 25
          },
          {
            "facility": "kecepatan_internet",
            "status": "MATCH",
            "weight": 25
          },
          {
            "facility": "kasur_springbed",
            "status": "MATCH",
            "weight": 15
          },
          {
            "facility": "kamar_mandi_dalam",
            "status": "MISMATCH",
            "penalty": 10
          }
        ],
        "total": 5,
        "matched": 4,
        "mismatched": 1,
        "neutral": 0
      }
    }
    ```

##### 📌 D. Dapatkan Detail Laporan Audit (`GET /audit/:inspection_id/report`)
Mengambil laporan audit kepatuhan final hasil pengolahan AI.

*   **Role Akses:** Semua role terautentikasi
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "report_id": "a3ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
      "inspection_id": "e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
      "score": "80.00",
      "confidence_level": "PARTIAL_VALID",
      "pdf_url": "https://tqeryt84mmpwjon44527pq.supabase.co/storage/v1/object/public/inspeksikos-photos/reports/e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae.pdf",
      "generated_at": "2026-06-10T01:40:00.000Z",
      "breakdown_data": {
        "items": [
          { "facility": "wifi", "status": "MATCH", "weight": 20 },
          { "facility": "kualitas_air", "status": "MATCH", "weight": 25 },
          { "facility": "kecepatan_internet", "status": "MATCH", "weight": 25 },
          { "facility": "kasur_springbed", "status": "MATCH", "weight": 15 },
          { "facility": "kamar_mandi_dalam", "status": "MISMATCH", "penalty": 10 }
        ],
        "total": 5,
        "matched": 4,
        "mismatched": 1,
        "neutral": 0
      }
    }
    ```

##### 📌 E. Dapatkan URL Laporan PDF (`GET /audit/:inspection_id/pdf`)
Mengambil link unduhan file PDF Scorecard Kepatuhan yang disimpan di cloud storage.

*   **Role Akses:** Semua role terautentikasi
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "pdf_url": "https://tqeryt84mmpwjon44527pq.supabase.co/storage/v1/object/public/inspeksikos-photos/reports/e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae.pdf"
    }
    ```

---

##### 📜 5. Panel Riwayat Kepatuhan (`/riwayat`)

##### 📌 A. Ambil Riwayat Kepatuhan Kos (`GET /riwayat`)
Mengambil log riwayat seluruh sesi inspeksi dan audit yang telah berstatus `completed` (selesai divalidasi). 
Mendukung filter berdasarkan tanggal hari ini (`date`) maupun bulan tertentu (`month`).

*   **Role Akses:** Semua role terautentikasi
*   **Query Parameters:**
    *   `date`: Filter harian (Format: `YYYY-MM-DD`, misal `2026-06-10`)
    *   `month`: Filter bulanan (Format: `YYYY-MM`, misal `2026-06`)
*   **Respon Sukses (`200 OK`):**
    ```json
    [
      {
        "inspection_id": "e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
        "property_id": "df2a9c3e-b811-4258-aa82-938ba0cb924e",
        "inspector_id": "fd9031c2-cbb8-4f81-9b62-11a5b8a0cbcf",
        "status": "completed",
        "tds_value": "115.50",
        "internet_speed": "28.40",
        "assigned_at": "2026-06-10T01:25:00.000Z",
        "completed_at": "2026-06-10T01:40:00.000Z",
        "property": {
          "property_id": "df2a9c3e-b811-4258-aa82-938ba0cb924e",
          "name": "Kos Putri Syariah Sejahtera",
          "address": "Jalan Gunung Pangilun No. 45, Padang Utara, Padang",
          "status": "audited"
        },
        "inspector": {
          "user_id": "fd9031c2-cbb8-4f81-9b62-11a5b8a0cbcf",
          "first_name": "Deni",
          "last_name": "Setiawan",
          "email": "inspektur.deni@inspeksikos.com"
        },
        "audit_report": {
          "report_id": "a3ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
          "score": "80.00",
          "confidence_level": "PARTIAL_VALID",
          "pdf_url": "https://tqeryt84mmpwjon44527pq.supabase.co/storage/v1/object/public/inspeksikos-photos/reports/e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae.pdf"
        }
      }
    ]
    ```

---

##### ⚠️ Format Standar Respon Error

Platform menggunakan standar respon error NestJS bawaan untuk mempermudah integrasi di frontend.

##### 400 Bad Request (Validasi Input Gagal)
```json
{
  "message": [
    "Format email tidak valid",
    "Password minimal harus 6 karakter"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

##### 401 Unauthorized (Token Tidak Valid / Tidak Menyertakan Token)
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

##### 403 Forbidden (Role Pengguna Tidak Sesuai Kebutuhan Otorisasi)
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

##### 404 Not Found (Resource / Data Tidak Ditemukan)
```json
{
  "message": "Inspeksi dengan ID ini tidak ditemukan",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Alur Bisnis & Flowchart

### Alur Mahasiswa

```
Register / Login
  → Daftarkan properti + input klaim fasilitas dari iklan (claim_data JSON)
  → Buat request inspeksi (pilih paket, jadwal, prioritas fitur)
  → Pantau status order di halaman Manajemen Pesanan
  → Terima notifikasi + URL laporan setelah audit selesai
  → Unduh PDF Audit Scorecard
```

### Alur Inspektur

```
Login
  → Lihat daftar tugas di dashboard (filter: minggu ini)
  → Buka detail tugas → navigasi ke lokasi
  → Upload foto aktual per ruangan (inspeksiPage)
  → Input data teknis: TDS meter (mg/L) + kecepatan internet (Mbps)
  → Tandai inspeksi selesai → trigger audit otomatis
```

### Alur Sistem Otomatis (Sesuai Flowchart)

```
START
  ↓
Input Data: Foto Iklan & Foto Aktual
  ↓
┌─ Validasi Input Lengkap? ─────────────────────────────────────┐
│  TIDAK → Pesan Error: "Data tidak lengkap" → END              │
│  YA    → lanjut                                               │
└───────────────────────────────────────────────────────────────┘
  ↓
Foto Aktual Properti dikirim ke Gemini Vision API
  ↓
┌─ Respons Gemini Berhasil? ────────────────────────────────────┐
│  Gagal (coba ulang) → Retry max 3x                           │
│  Gagal >= 3x → Error: "AI Service Tidak Tersedia" → END       │
│  Berhasil → lanjut                                            │
└───────────────────────────────────────────────────────────────┘
  ↓ Ya
Ekstraksi Objek & Fasilitas → JSON
  ↓
Rule-Based Engine: Komparasi Data Klaim Iklan (JSON) vs Aktual (JSON)
  ↓
Hitung Weighted Score: Σ bobot sesuai / Σ total × 100%
  ↓
┌─ Confidence Level? ───────────────────────────────────────────┐
│  < 70%     → FATAL_FRAUD  (Terindikasi manipulasi)            │
│  70% – 94% → PARTIAL_VALID (Perbedaan minor)                  │
│  >= 95%    → VALID         (Sepenuhnya sesuai)                 │
└───────────────────────────────────────────────────────────────┘
  ↓
Susun Audit Scorecard Report
  ↓
Generate Laporan PDF (Skor + Breakdown + Foto)
  ↓
Simpan ke Cloud Storage (Supabase)
  ↓
Kirim Notifikasi + URL Download ke Mahasiswa
  ↓
END
```

---

## Gemini Vision Integration

### `geminiService`

```typescript
// backend/src/gemini/gemini.service.ts

@Injectable()
export class GeminiService {
  private readonly apiUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  private readonly MAX_RETRY = 3;

  constructor(private configService: ConfigService) {}

  async extractFasilitas(imageUrls: string[]): Promise<Record<string, any>> {
    let attempt = 0;
    while (attempt < this.MAX_RETRY) {
      try {
        const prompt = this.buildPrompt();
        const parts = [
          { text: prompt },
          ...imageUrls.map(url => ({
            inline_data: { mime_type: 'image/jpeg', data: url },
          })),
        ];

        const response = await axios.post(
          `${this.apiUrl}?key=${this.configService.get('GEMINI_API_KEY')}`,
          { contents: [{ parts }] },
        );

        const rawText = response.data.candidates[0].content.parts[0].text;
        return this.parseResponse(rawText);
      } catch (err) {
        attempt++;
        if (attempt >= this.MAX_RETRY) throw new Error('AI Service Tidak Tersedia');
      }
    }
  }

  private buildPrompt(): string {
    return `
      Analisis foto-foto properti kos berikut. Identifikasi semua fasilitas yang tersedia.
      Kembalikan HANYA dalam format JSON berikut (tanpa teks lain):
      {
        "fasilitas": {
          "kasur":              { "ada": boolean, "kondisi": "baik|cukup|buruk" },
          "lemari":             { "ada": boolean, "kondisi": "baik|cukup|buruk" },
          "ac":                 { "ada": boolean, "kondisi": "baik|cukup|buruk" },
          "kipas_angin":        { "ada": boolean },
          "kamar_mandi_dalam":  { "ada": boolean },
          "water_heater":       { "ada": boolean },
          "meja_belajar":       { "ada": boolean },
          "kursi":              { "ada": boolean },
          "wifi":               { "router_terlihat": boolean },
          "jendela":            { "ada": boolean },
          "kebersihan":         { "skor": 1-10 }
        },
        "estimasi_ukuran": "kecil|sedang|besar",
        "catatan": "catatan tambahan"
      }
    `;
  }

  private parseResponse(rawText: string): Record<string, any> {
    const clean = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }

  async retryRequest(maxRetry: number): Promise<void> {
    // Retry logic sudah terintegrasi di extractFasilitas
  }
}
```

---

## Rule-Based Audit Engine

### Formula Skor

```
Skor Audit = (Σ bobot fasilitas yang sesuai) / (Σ total bobot semua fasilitas) × 100%
```

### Confidence Level

| Skor | Status | Keterangan |
|---|---|---|
| ≥ 95% | `VALID` | Fakta lapangan sepenuhnya sesuai klaim promosi |
| 70% – 94% | `PARTIAL_VALID` | Sebagian besar sesuai, ada perbedaan minor |
| < 70% | `FATAL_FRAUD` | Tidak sesuai signifikan / terindikasi manipulasi visual |

### Logika IF-THEN

```
IF fasilitas X terdeteksi di citra AND diklaim ada di iklan
  THEN skor += bobot(X)                            → MATCH

IF fasilitas X TIDAK terdeteksi AND diklaim ada di iklan
  THEN skor -= penalti(X)                          → MISMATCH

IF pengukuran teknis Y dalam rentang threshold_value
  THEN skor += bobot(Y)                            → MATCH

IF tidak diklaim dan tidak ada
  THEN NEUTRAL (tidak mempengaruhi skor)
```

### `ruleBasedEngine`

```typescript
// backend/src/audit/rule-based.engine.ts

@Injectable()
export class RuleBasedEngine {
  private ruleItems: AuditRuleItem[];
  private totalWeight: number;

  execute(claimData: Record<string, any>, extractedData: Record<string, any>): AuditResult {
    let matchedWeight = 0;
    this.totalWeight = 0;
    const breakdown: BreakdownItem[] = [];

    for (const item of this.ruleItems) {
      this.totalWeight += item.weight;

      const claimed  = claimData?.fasilitas?.[item.facility_name];
      const detected = extractedData?.fasilitas?.[item.facility_name];
      const match    = this.compareAttribute(claimed, detected, item);

      if (match) {
        matchedWeight += item.weight;
        breakdown.push({ facility: item.facility_name, status: 'MATCH', weight: item.weight });
      } else if (claimed?.ada) {
        matchedWeight -= item.penalty;
        breakdown.push({ facility: item.facility_name, status: 'MISMATCH', penalty: item.penalty });
      } else {
        breakdown.push({ facility: item.facility_name, status: 'NEUTRAL' });
      }
    }

    const score           = this.calculateScore(matchedWeight);
    const confidenceLevel = this.determineConfidenceLevel(score);
    const breakdownData   = this.generateBreakdown(breakdown);

    return { score, confidenceLevel, breakdownData };
  }

  compareAttribute(claim: any, actual: any, item: AuditRuleItem): boolean {
    if (item.threshold_type === 'boolean') {
      return claim?.ada === true && actual?.ada === true;
    }
    if (item.threshold_type === 'numeric' || item.threshold_type === 'range') {
      const [min, max] = item.threshold_value.split('-').map(Number);
      return actual?.nilai >= min && actual?.nilai <= max;
    }
    return false;
  }

  calculateScore(matchedWeight: number): number {
    return Math.max(0, Math.min(100, (matchedWeight / this.totalWeight) * 100));
  }

  determineConfidenceLevel(score: number): ConfidenceLevel {
    if (score >= 95) return 'VALID';
    if (score >= 70) return 'PARTIAL_VALID';
    return 'FATAL_FRAUD';
  }

  generateBreakdown(breakdown: BreakdownItem[]): Record<string, any> {
    return {
      items:      breakdown,
      total:      breakdown.length,
      matched:    breakdown.filter(b => b.status === 'MATCH').length,
      mismatched: breakdown.filter(b => b.status === 'MISMATCH').length,
    };
  }
}
```

---

## CI/CD Pipeline

### Frontend (`.github/workflows/frontend.yml`)

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Lint
        run: cd frontend && npm run lint

      - name: Build
        run: cd frontend && npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_FRONTEND }}
          working-directory: ./frontend
          vercel-args: '--prod'
```

### Backend (`.github/workflows/backend.yml`)

```yaml
name: Backend CI/CD

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install & Test
        run: |
          cd backend
          npm ci
          npm run lint
          npm run test

      - name: Google Auth
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: inspeksikos-backend
          region: asia-southeast2
          source: ./backend
          env_vars: |
            DATABASE_URL=${{ secrets.DATABASE_URL }}
            JWT_SECRET=${{ secrets.JWT_SECRET }}
            GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}
            SUPABASE_URL=${{ secrets.SUPABASE_URL }}
            SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/inspeksikos

# Auth JWT (RFC 7519)
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Gemini AI Vision (Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_BUCKET=inspeksikos-photos

# App
PORT=3001
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=InspeksiKos
```

---

## Deployment

### Frontend → Vercel

```bash
npm i -g vercel
cd frontend
vercel --prod
```

### Backend → Google Cloud Run

```bash
# Build & push container image
gcloud builds submit \
  --tag gcr.io/PROJECT_ID/inspeksikos-backend \
  ./backend

# Deploy ke Cloud Run (region: asia-southeast2 Jakarta)
gcloud run deploy inspeksikos-backend \
  --image gcr.io/PROJECT_ID/inspeksikos-backend \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL,JWT_SECRET=$JWT_SECRET
```

### Database → Neon

1. Buat project di [neon.tech](https://neon.tech)
2. Copy connection string → paste ke `DATABASE_URL`
3. Jalankan migration: `npm run migration:run`

---

## Role & Akses

| Fitur | Mahasiswa | Inspektur | Admin |
|---|---|---|---|
| Daftarkan properti | ✅ | ❌ | ✅ |
| Buat request inspeksi | ✅ | ❌ | ✅ |
| Upload foto aktual | ❌ | ✅ | ✅ |
| Input TDS + internet speed | ❌ | ✅ | ✅ |
| Lihat status inspeksi | ✅ (milik sendiri) | ✅ (ditugaskan) | ✅ (semua) |
| Lihat riwayat | ✅ (milik sendiri) | ✅ (milik sendiri) | ✅ |
| Download laporan PDF | ✅ (milik sendiri) | ✅ | ✅ |
| Kelola user | ❌ | ❌ | ✅ |
| Buat & aktifkan audit rules | ❌ | ❌ | ✅ |

---

## Halaman Utama (UI)

### Login & Register

Kartu autentikasi di tengah layar dengan latar dekoratif garis lengkung. Field: Email, Password, Konfirmasi Password (register), Nama Lengkap (register). Tombol utama full-width navy. Toggle antar halaman login/register di bagian bawah kartu.

### Dashboard Mahasiswa

Header (logo + notifikasi + profil) · Sidebar (Dashboard, Order, Riwayat Order) · Banner hero + tombol CTA "Order Inspeksi" · 3 kartu statistik (Total Order, Order Aktif, Order Selesai) · Panel Order Aktif (status real-time + tombol Lihat Detail Tracking) · Panel Riwayat Order terbaru.

### Upload Foto & Request Inspeksi (`propertiPage` + `inspeksiPage`)

Form 2 langkah. **Step 1:** Detail kos (Link Maps, Alamat, Harga Sewa, Nama Pemilik). Pilih paket (Single Rp 60.000 / Komparasi Rp 120.000). Kalender jadwal + grid slot waktu 08.00–19.00. **Step 2:** Checklist 6 fitur inspeksi (Kualitas Air/TDS, Kelembaban & Suhu, Kecepatan Internet, Ukuran Kamar, Kondisi Bangunan, Kebersihan) bisa diurutkan drag-and-drop. Textarea catatan khusus.

### Status Inspeksi — Manajemen Pesanan

Tabel order: kolom Nama Kost, Paket, Tanggal, Status, Aksi. Badge status berwarna: Inspektor Dilokasi / Pesan Dibuat / Dikonfirmasi. Tombol "+ Buat Order" di kanan atas.

### Dashboard Inspektur

Sidebar (Dashboard, Tugas, Komisi) · Filter periode minggu/bulan · 4 kartu statistik (Total Tugas, Tugas Selesai, Komisi Rp, Rating /5) · Tabel Tugas Hari Ini + Tabel Tugas Mendatang masing-masing dengan tombol "Lihat" per baris.

### Unduh Laporan PDF (`laporanPage`)

Breadcrumb "Laporan Pesanan > Detail" · Header (foto properti, nama kos, alamat, inspektur, paket, jadwal, **Skor xx/100**, badge LAYAK/TIDAK LAYAK) · Donut chart distribusi skor per kategori (Kualitas Air, Kecepatan Internet, Kelembapan) · Data Teknis (TDS PPM, Hygro Meter, Speed Test Download/Upload Mbps, Ukuran Ruangan m²) · Detail per fasilitas dengan rating bintang 1–5 + foto dokumentasi · Tabel Rekomendasi Perbaikan (Urgensi / Deskripsi / Estimasi Biaya) · Tombol aksi: **Download PDF** · Bagikan · Beri Rating.

### `riwayatPage`

Kalender interaktif untuk filter tanggal/bulan · Grafik riwayat order (bar/line chart) · Tabel list inspeksi selesai dengan kolom: Nama Kos, Tanggal, Skor, Confidence Level, Aksi (Lihat Laporan).

### `auditRulePage` (Admin)

Form buat ruleset baru: Nama, Versi, daftar `auditRuleItem` (facility_name, weight, penalty, threshold_type, threshold_value) dengan drag-and-drop urutan · Toggle aktifkan satu ruleset · Tabel history ruleset lama.

---

> Dibuat untuk keperluan Capstone Project — TRPL 3A Politeknik Negeri Padang 2026
