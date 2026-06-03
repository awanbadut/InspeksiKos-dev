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

### Auth

```
POST   /auth/register          Daftar akun baru (mahasiswa/inspektur)
POST   /auth/login             Login, dapat JWT access + refresh token
POST   /auth/refresh           Refresh access token
POST   /auth/logout            Invalidate token
```

### Profile

```
GET    /profile/me             Ambil profil sendiri
PATCH  /profile/me             Update first_name, last_name, dll
```

### Properties

```
POST   /properties             Daftarkan properti baru + claim_data JSON
GET    /properties             List properti milik user (by JWT)
GET    /properties/:id         Detail satu properti
PATCH  /properties/:id         Update data properti
DELETE /properties/:id         Hapus properti
```

### Inspections

```
POST   /inspections                      Buat request inspeksi baru (mahasiswa)
GET    /inspections                      List inspeksi (filter by role otomatis)
GET    /inspections/:id                  Detail satu sesi inspeksi
PATCH  /inspections/:id/status           Update status (inspektur/admin)
POST   /inspections/:id/photos           Upload foto aktual lapangan (multipart)
GET    /inspections/:id/photos           List foto satu inspeksi
PATCH  /inspections/:id/teknis           Input TDS value + internet speed
```

### Audit

```
POST   /audit/:inspection_id/run         Trigger proses audit (Gemini → Rule-Based → PDF)
GET    /audit/:inspection_id/report      Ambil hasil audit report
GET    /audit/:inspection_id/pdf         Get URL download PDF laporan
```

### Riwayat

```
GET    /riwayat                          List riwayat inspeksi user
GET    /riwayat?date=YYYY-MM-DD          Filter by tanggal
GET    /riwayat?month=YYYY-MM            Filter by bulan
```

### Admin

```
GET    /admin/users                      List semua user
PATCH  /admin/users/:id                  Update role/status user
GET    /admin/inspections                List semua inspeksi
GET    /admin/audit-rules                List set aturan audit
POST   /admin/audit-rules                Buat set aturan baru
PATCH  /admin/audit-rules/:id/activate   Aktifkan satu set aturan
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
