# 📑 Dokumentasi API InspeksiKos

Dokumentasi ini mencakup seluruh **30 endpoint** REST API backend InspeksiKos, skema autentikasi, otorisasi berbasis role (`mahasiswa`, `inspektur`, `admin`), parameter request, serta struktur respon JSON sukses dan error secara detail.

---

## 🔒 Skema Autentikasi & Otorisasi

API InspeksiKos menggunakan **JWT (JSON Web Token)** Bearer Authentication. 
Setiap request yang memerlukan autentikasi harus menyertakan header berikut:

```http
Authorization: Bearer <your_access_token>
```

### 👥 Pembagian Role Pengguna
*   **`mahasiswa`**: Mendaftarkan properti (kos), melihat kos miliknya, mengajukan permintaan inspeksi, dan melihat hasil laporan audit.
*   **`inspektur`**: Melihat tugas inspeksi aktif yang ditugaskan kepadanya, mengisi data teknis (TDS air, kecepatan internet), mengunggah foto bukti fisik kos, dan menandai inspeksi selesai.
*   **`admin`**: Mengelola seluruh pengguna (mahasiswa & inspektur), menunjuk inspektur ke kos tertentu, mengatur aturan penilaian AI (Audit Rules), memicu audit AI, serta melihat seluruh riwayat kos & laporan kepatuhan.

---

## 🚀 Daftar Endpoint API

Sistem ini memiliki **30 endpoint** aktif yang terbagi dalam 6 modul utama:

| No | Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| **Root (1)** | | | | |
| 1 | `GET` | `/` | Publik | Health Check / Cek Status Backend |
| **Autentikasi (8)** | | | | |
| 2 | `POST` | `/auth/register` | Publik | Registrasi pengguna baru |
| 3 | `POST` | `/auth/login` | Publik | Login pengguna |
| 4 | `POST` | `/auth/refresh` | Publik | Refresh access token |
| 5 | `POST` | `/auth/logout` | Publik | Logout pengguna |
| 6 | `GET` | `/auth/inspectors` | `admin` | Ambil daftar semua inspektur |
| 7 | `GET` | `/auth/users` | `admin` | Ambil daftar semua pengguna |
| 8 | `POST` | `/auth/forgot-password` | Publik | Permintaan kode verifikasi lupa password |
| 9 | `POST` | `/auth/reset-password` | Publik | Setel ulang password menggunakan kode verifikasi |
| **Properti (5)** | | | | |
| 10 | `POST` | `/properties` | `mahasiswa`, `admin` | Tambah properti/kos baru |
| 11 | `GET` | `/properties` | `mahasiswa` (milik sendiri), `admin` (semua) | Ambil daftar properti |
| 12 | `GET` | `/properties/:id` | Terautentikasi | Ambil detail properti |
| 13 | `PATCH` | `/properties/:id` | Pemilik, `admin` | Update detail properti |
| 14 | `DELETE` | `/properties/:id` | Pemilik, `admin` | Hapus properti secara permanen |
| **Inspeksi (9)** | | | | |
| 15 | `POST` | `/inspections` | `mahasiswa`, `admin` | Ajukan permohonan inspeksi kos |
| 16 | `GET` | `/inspections` | Terautentikasi (terfilter) | Ambil daftar sesi inspeksi |
| 17 | `GET` | `/inspections/:id` | Terautentikasi | Ambil detail sesi inspeksi |
| 18 | `POST` | `/inspections/:id/payment-token` | `mahasiswa`, `admin` | Dapatkan Midtrans Snap token / Simulator URL |
| 19 | `GET` | `/inspections/:id/check-payment` | `mahasiswa`, `admin` | Cek status pembayaran inspeksi |
| 20 | `PATCH` | `/inspections/:id/status` | `admin`, `inspektur` | Update status inspeksi / penugasan inspektur |
| 21 | `PATCH` | `/inspections/:id/teknis` | `admin`, `inspektur` | Input hasil pengujian teknis (TDS & Internet speed) |
| 22 | `POST` | `/inspections/:id/photos` | `admin`, `inspektur` | Unggah foto bukti fisik fasilitas kos |
| 23 | `GET` | `/inspections/:id/photos` | Terautentikasi | Ambil seluruh foto bukti fisik |
| **Audit AI & Laporan (6)** | | | | |
| 24 | `GET` | `/audit/rules` | Terautentikasi | Dapatkan kriteria evaluasi (rules) aktif |
| 25 | `POST` | `/audit/rules` | `admin` | Tambah/ubah aturan evaluasi aktif |
| 26 | `POST` | `/audit/:inspection_id/run` | Terautentikasi | Picu analisis Vision AI Gemini & generate laporan |
| 27 | `GET` | `/audit/:inspection_id/report` | Terautentikasi | Dapatkan hasil audit & detail breakdown |
| 28 | `GET` | `/audit/:inspection_id/pdf` | Terautentikasi | Dapatkan URL PDF scorecard kepatuhan |
| 29 | `POST` | `/audit/:inspection_id/chat` | Terautentikasi | Chatbot tanya-jawab seputar laporan audit |
| **Riwayat (1)** | | | | |
| 30 | `GET` | `/riwayat` | Terautentikasi | Ambil riwayat audit selesai (mendukung filter harian/bulanan) |

---

## 🌐 0. Health Check / Root Endpoint (`/`)

#### 📌 A. Health Check Status Backend (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/`)
Mengecek status kesehatan (health check) backend server.

*   **Role Akses:** Publik (Semua Pengguna)
*   **Respon Sukses (`200 OK`):**
    ```http
    Hello World!
    ```

---

### 🔑 1. Autentikasi (`/auth`)

#### 📌 A. Registrasi Pengguna Baru (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/auth/register`)
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

#### 📌 B. Login Pengguna (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/auth/login`)
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

#### 📌 C. Refresh Access Token (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/auth/refresh`)
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

#### 📌 D. Logout (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/auth/logout`)
Membersihkan session/token (dihandle di client dengan menghapus token dari storage).

*   **Role Akses:** Publik (Semua Pengguna)
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "message": "Logout berhasil"
    }
    ```

#### 📌 E. Ambil Daftar Inspektur (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/auth/inspectors`)
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

#### 📌 F. Ambil Daftar Seluruh Pengguna (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/auth/users`)
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

#### 📌 G. Lupa Password (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/auth/forgot-password`)
Mengirimkan kode OTP verifikasi 6 digit ke email dan WhatsApp terdaftar.

*   **Role Akses:** Publik (Semua Pengguna)
*   **Body Request (JSON):**
    ```json
    {
      "email": "mahasiswa.padang@gmail.com"
    }
    ```
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "message": "Kode verifikasi berhasil dikirim ke email dan WhatsApp Anda"
    }
    ```
*   **Respon Error (`400 Bad Request` - Email tidak terdaftar):**
    ```json
    {
      "message": "Email tidak terdaftar",
      "error": "Bad Request",
      "statusCode": 400
    }
    ```

#### 📌 H. Reset Password (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/auth/reset-password`)
Mengatur ulang password baru dengan menggunakan kode verifikasi OTP yang dikirimkan ke email/WhatsApp.

*   **Role Akses:** Publik (Semua Pengguna)
*   **Body Request (JSON):**
    ```json
    {
      "email": "mahasiswa.padang@gmail.com",
      "code": "834192",
      "new_password": "newsecurepassword123"
    }
    ```
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "message": "Kata sandi berhasil diatur ulang"
    }
    ```
*   **Respon Error (`400 Bad Request` - Kode salah/kedaluwarsa):**
    ```json
    {
      "message": "Kode verifikasi salah",
      "error": "Bad Request",
      "statusCode": 400
    }
    ```

---

### 🏠 2. Pengelolaan Kos/Properti (`/properties`)

#### 📌 A. Tambah Properti Baru (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/properties`)
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

#### 📌 B. Ambil Daftar Properti (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/properties`)
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

#### 📌 C. Ambil Detail Properti (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/properties/:id`)
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

#### 📌 D. Update Properti (`PATCH https://inspeksikos-backend-391757769207.asia-southeast2.run.app/properties/:id`)
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

#### 📌 E. Hapus Properti (`DELETE https://inspeksikos-backend-391757769207.asia-southeast2.run.app/properties/:id`)
Menghapus data kos secara permanen dari platform.

*   **Role Akses:** Pemilik properti (`mahasiswa`) atau `admin`
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "message": "Properti berhasil dihapus"
    }
    ```

---

### 🔍 3. Alur Inspeksi Fisik (`/inspections`)

#### 📌 A. Ajukan Inspeksi Kos (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/inspections`)
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

#### 📌 B. Ambil Daftar Inspeksi (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/inspections`)
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

#### 📌 C. Ambil Detail Sesi Inspeksi (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/inspections/:id`)
Mengambil rincian data sesi inspeksi tertentu berdasarkan ID sesi.

*   **Role Akses:** Semua role terautentikasi
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "inspection_id": "e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
      "property_id": "df2a9c3e-b811-4258-aa82-938ba0cb924e",
      "inspector_id": "fd9031c2-cbb8-4f81-9b62-11a5b8a0cbcf",
      "status": "in_progress",
      "assigned_at": "2026-06-10T01:25:00.000Z",
      "completed_at": null,
      "tds_value": "115.50",
      "internet_speed": "28.40",
      "inspector_data": {
        "checklist": {
          "kasur_springbed": true,
          "kamar_mandi_dalam": true,
          "keamanan_24_jam": false
        },
        "catatan_tambahan": "Kondisi fisik kos sangat bersih, WiFi stabil, air jernih dan tidak berbau."
      },
      "property": {
        "property_id": "df2a9c3e-b811-4258-aa82-938ba0cb924e",
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
    }
    ```

#### 📌 D. Dapatkan Token Pembayaran Inspeksi (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/inspections/:id/payment-token`)
Mendapatkan Midtrans Snap token / URL pembayaran Snap Sandbox atau link simulator lokal (jika API key Midtrans tidak dikonfigurasi).

*   **Role Akses:** `mahasiswa` (pemilik kos) atau `admin`
*   **Respon Sukses (`201 Created` - Mode Sandbox Midtrans):**
    ```json
    {
      "token": "d718b577-0c7f-44e2-8951-fc6a97825d19",
      "redirect_url": "https://app.sandbox.midtrans.com/snap/v1/transactions/d718b577-0c7f-44e2-8951-fc6a97825d19",
      "mode": "sandbox"
    }
    ```
*   **Respon Sukses (`201 Created` - Mode Simulator):**
    ```json
    {
      "token": "mock_token_1781190000",
      "redirect_url": "/payment/simulate?id=e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae",
      "mode": "simulator"
    }
    ```

#### 📌 E. Periksa Status Pembayaran Inspeksi (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/inspections/:id/check-payment`)
Memeriksa status pembayaran dari Midtrans/Simulator dan memperbarui data pembayaran properti ke database secara otomatis jika lunas.

*   **Role Akses:** `mahasiswa` (pemilik kos) atau `admin`
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "paid": true
    }
    ```

#### 📌 F. Update Status Inspeksi / Penunjukan Inspektur (`PATCH https://inspeksikos-backend-391757769207.asia-southeast2.run.app/inspections/:id/status`)
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

#### 📌 G. Input Data Teknis Kos (`PATCH https://inspeksikos-backend-391757769207.asia-southeast2.run.app/inspections/:id/teknis`)
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

#### 📌 H. Upload Foto Inspeksi Kamar/Fasilitas (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/inspections/:id/photos`)
Mengunggah foto fisik objek kos untuk dianalisis oleh Vision AI (Gemini). API ini menggunakan format `multipart/form-data`.
*Catatan Keamanan:* Untuk mencegah kecurangan, pengambilan foto harus menggunakan kamera realtime dengan menyertakan tanda air (watermark) data lokasi GPS (latitude/longitude) dan nama kos.

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

#### 📌 I. Ambil Foto-Foto Inspeksi (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/inspections/:id/photos`)
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

### 🧠 4. Engine Evaluasi Kepatuhan & AI (`/audit`)

#### 📌 A. Ambil Aturan Evaluasi Aktif (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/audit/rules`)
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

#### 📌 B. Simpan/Ubah Aturan Evaluasi (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/audit/rules`)
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

#### 📌 C. Picu/Jalankan Audit AI Kepatuhan (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/audit/:inspection_id/run`)
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

#### 📌 D. Dapatkan Detail Laporan Audit (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/audit/:inspection_id/report`)
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

#### 📌 E. Dapatkan URL Laporan PDF (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/audit/:inspection_id/pdf`)
Mengambil link unduhan file PDF Scorecard Kepatuhan yang disimpan di cloud storage.

*   **Role Akses:** Semua role terautentikasi
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "pdf_url": "https://tqeryt84mmpwjon44527pq.supabase.co/storage/v1/object/public/inspeksikos-photos/reports/e2ba9f6c-8a11-4259-b95d-1c5c0c9cbcae.pdf"
    }
    ```

#### 📌 F. Tanya Jawab Chatbot Laporan Kepatuhan (`POST https://inspeksikos-backend-391757769207.asia-southeast2.run.app/audit/:inspection_id/chat`)
Melakukan diskusi tanya jawab interaktif dengan AI Assistant (Gemini) seputar hasil evaluasi kepatuhan. AI dapat menjelaskan kenapa suatu fasilitas dinilai tidak sesuai (mismatch) atau memberi saran optimasi.

*   **Role Akses:** Semua role terautentikasi
*   **Body Request (JSON):**
    ```json
    {
      "message": "Kenapa air di kos saya diberi penalti?",
      "history": []
    }
    ```
*   **Respon Sukses (`200 OK`):**
    ```json
    {
      "reply": "Berdasarkan hasil pengukuran TDS oleh inspektur, air di kos Anda bernilai 160 mg/L, yang mana melebihi ambang batas (threshold) aturan aktif platform yaitu 150 mg/L. Oleh karena itu, terdapat ketidaksesuaian (MISMATCH) sehingga dikenai penalti bobot sebesar 15%."
    }
    ```

---

### 📜 5. Panel Riwayat Kepatuhan (`/riwayat`)

#### 📌 A. Ambil Riwayat Kepatuhan Kos (`GET https://inspeksikos-backend-391757769207.asia-southeast2.run.app/riwayat`)
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

## ⚠️ Format Standar Respon Error

Platform menggunakan standar respon error NestJS bawaan untuk mempermudah integrasi di frontend.

### 400 Bad Request (Validasi Input Gagal)
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

### 401 Unauthorized (Token Tidak Valid / Tidak Menyertakan Token)
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden (Role Pengguna Tidak Sesuai Kebutuhan Otorisasi)
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 Not Found (Resource / Data Tidak Ditemukan)
```json
{
  "message": "Inspeksi dengan ID ini tidak ditemukan",
  "error": "Not Found",
  "statusCode": 404
}
```
