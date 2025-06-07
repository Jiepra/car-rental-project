# 🚗💨 Car Rental Web Application

Selamat datang di proyek Aplikasi Web Rental Mobil! Proyek ini adalah platform komprehensif yang memungkinkan pengguna untuk menyewa mobil dan admin untuk mengelola seluruh operasi rental. Dibangun menggunakan **Spring Boot** untuk *backend* yang kuat dan **React.js** dengan **Tailwind CSS** untuk *frontend* yang modern dan responsif.

## ✨ Fitur Unggulan

Proyek ini telah dilengkapi dengan serangkaian fitur canggih untuk memberikan pengalaman terbaik bagi pengguna dan admin:

### Fungsionalitas Pengguna Umum 👤
* **Pendaftaran & Login Aman:** Pengguna dapat membuat akun baru atau login dengan otentikasi JWT yang aman.
* **Daftar Mobil Interaktif:** Lihat semua mobil yang tersedia, dengan opsi pencarian (berdasarkan merek/model) dan filter (hanya yang tersedia).
* **Detail Mobil Lengkap:** Halaman khusus untuk setiap mobil menampilkan informasi detail dan gambar.
* **Proses Penyewaan Mudah:** Alur pembayaran dan penyewaan mobil yang intuitif.
* **Riwayat Penyewaan Saya:** Pelanggan dapat melihat semua riwayat penyewaan mereka.
* **Sewa Kembali/Booking Lagi:** Fitur cepat untuk menyewa kembali mobil dari riwayat penyewaan.
* **Notifikasi Ramah Pengguna:** Pesan sukses/error yang jelas dan tidak mengganggu menggunakan React Toastify.
* **Validasi Formulir Canggih:** Formik dan Yup memastikan semua input formulir valid dan memberikan feedback instan.
* **Layout Responsif:** Tampilan aplikasi yang adaptif untuk berbagai ukuran layar, termasuk perangkat mobile.

### Fungsionalitas Admin 👑
* **Dashboard Admin Komprehensif:** Panel kontrol khusus untuk semua operasi manajemen.
* **Manajemen Mobil Lengkap (CRUD):** Tambah ➕, Lihat 👀, Edit ✏️, Hapus 🗑️ data mobil.
* **Manajemen Gambar Mobil:** Unggah 🖼️, tampilkan, perbarui, dan hapus gambar mobil.
* **Manajemen Pengguna:** Lihat daftar pengguna, ubah peran (Customer/Admin), dan hapus akun.
* **Manajemen Rental Detail:**
    * Lihat semua transaksi rental (pending, confirmed, picked up, returned, cancelled, completed).
    * Konfirmasi pembayaran rental.
    * Ubah status rental (misalnya, dari 'CONFIRMED' menjadi 'PICKED_UP' saat mobil diambil).
* **Paginasi Data:** Tabel mobil, pengguna, dan rental dilengkapi dengan paginasi untuk penanganan data besar.
* **Pencarian & Pengurutan Lanjut:** Cari dan urutkan daftar mobil, pengguna, dan rental berdasarkan berbagai kriteria.
* **Chart Pendapatan Bulanan (Dalam Pengembangan/Akan Datang):** Visualisasi pendapatan bulanan untuk analisis bisnis.

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun dengan teknologi modern dan powerful:

### Backend
* **Spring Boot:** Framework Java yang kuat untuk membangun RESTful APIs.
* **MySQL:** Sistem manajemen database relasional yang andal.
* **Spring Security:** Untuk otentikasi (JWT) dan otorisasi.
* **Spring Data JPA / Hibernate:** Untuk interaksi database yang mudah.
* **Lombok:** Mengurangi boilerplate code Java.
* **Apache Commons IO:** Utilitas untuk operasi file (misalnya, manajemen unggahan gambar).

### Frontend
* **React.js:** Library JavaScript untuk membangun antarmuka pengguna yang dinamis.
* **Tailwind CSS:** Framework CSS yang cepat untuk desain responsif dan kustomisasi cepat.
* **React Router DOM:** Untuk navigasi dan routing di aplikasi.
* **React Toastify:** Menampilkan notifikasi yang menarik.
* **Formik:** Membangun formulir yang lebih mudah dan cepat.
* **Yup:** Untuk validasi skema formulir yang kuat dan deklaratif.
* **React Datepicker:** Komponen kalender interaktif untuk pemilihan tanggal.
* **Recharts / Chart.js:** (Akan diimplementasikan) Untuk visualisasi data chart.

## 🚀 Memulai Proyek

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

### Prasyarat

Pastikan Anda telah menginstal:
* Java Development Kit (JDK) 17 atau lebih tinggi
* Maven
* Node.js (versi LTS direkomendasikan)
* MySQL Server (dan klien seperti MySQL Workbench/DBeaver/cli)
* Git

### ⚙️ Setup Database MySQL

1.  Buat database MySQL baru dengan nama `car_rental_db`.
2.  Perbarui kredensial database di `car-rental-backend/src/main/resources/application.properties` (bagian `spring.datasource.url`, `username`, `password`) sesuai dengan setup MySQL lokal Anda.
3.  Spring JPA akan secara otomatis membuat skema tabel (Car, User, Rental) saat aplikasi backend pertama kali berjalan (karena `ddl-auto=update`).

### ▶️ Menjalankan Backend (Spring Boot)

1.  Buka terminal baru.
2.  Navigasi ke direktori `car-rental-backend`:
    ```bash
    cd car-rental-backend
    ```
3.  Lakukan clean build (ini akan mengompilasi ulang semua kode dan mengunduh dependensi):
    ```bash
    mvn clean install
    ```
4.  Jalankan aplikasi Spring Boot:
    ```bash
    mvn spring-boot:run
    ```
    Backend akan berjalan di `http://localhost:8080`.

### ▶️ Menjalankan Frontend (React.js)

1.  Buka terminal baru.
2.  Navigasi ke direktori `car-rental-frontend`:
    ```bash
    cd car-rental-frontend
    ```
3.  Instal dependensi Node.js:
    ```bash
    npm install
    ```
4.  Jalankan aplikasi React:
    ```bash
    npm start
    ```
    Frontend akan berjalan di `http://localhost:3000`.

### 🌐 Mengakses Aplikasi

* Buka browser Anda dan navigasi ke `http://localhost:3000`.

## ☁️ Deployment ke Cloud (dengan Render)

Proyek ini siap untuk di-*deploy* ke Render!

### 1. Persiapan Database Render

* Buat Database PostgreSQL baru di [Render Dashboard](https://dashboard.render.com/new/database).
* Catat `External Database URL`, `Username`, dan `Password`.

### 2. Deployment Backend (Web Service)

* Di [Render Dashboard](https://dashboard.render.com/new/web-service), buat `Web Service` baru.
* Hubungkan ke repositori GitHub Anda.
* **Root Directory:** `car-rental-backend`
* **Build Command:** `./mvnw clean install -DskipTests`
* **Start Command:** `java -jar target/*.jar`
* **Environment Variables:** Tambahkan:
    * `JWT_SECRET_KEY`: `your_strong_jwt_secret_key` (string acak yang panjang)
    * `SPRING_DATASOURCE_URL`: `External Database URL` dari Render PostgreSQL Anda.
    * `SPRING_DATASOURCE_USERNAME`: `Username` dari Render PostgreSQL Anda.
    * `SPRING_DATASOURCE_PASSWORD`: `Password` dari Render PostgreSQL Anda.
    * `SPRING_JPA_HIBERNATE_DDL_AUTO`: `update`
    * `FILE_UPLOAD_DIR`: `/var/data/images/` (Untuk persistent disk, akan membutuhkan konfigurasi tambahan) atau `/tmp/images/` (untuk penyimpanan sementara, akan hilang saat deploy ulang). **Untuk produksi, gunakan AWS S3 atau Cloudinary.**
    * `SERVER_PORT`: `8080` (Render akan mengoverride ke port yang tersedia).

### 3. Deployment Frontend (Static Site)

* Setelah Backend di-*deploy* dan Anda mendapatkan URL publiknya (misalnya `https://car-rental-backend-abc.onrender.com`).
* **Perbarui semua URL di kode Frontend Anda (`car-rental-frontend`):**
    * Ganti semua `http://localhost:8080` menjadi URL publik Backend Render Anda.
* **Perbarui CORS di Backend Render Anda:**
    * Di pengaturan `Web Service` Backend Anda di Render, tambahkan `car-rental-frontend-xyz.onrender.com` (domain frontend Anda) ke daftar `Allowed Origins` di pengaturan CORS. Atau, di `SecurityConfig.java`, ubah `configuration.setAllowedOrigins(List.of("http://localhost:3000"));` menjadi `configuration.setAllowedOrigins(List.of("http://localhost:3000", "https://your-frontend-domain.onrender.com"));`.
* Di [Render Dashboard](https://dashboard.render.com/new/static-site), buat `Static Site` baru.
* Hubungkan ke repositori GitHub Anda.
* **Root Directory:** `car-rental-frontend`
* **Build Command:** `npm run build`
* **Publish Directory:** `build`


## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.
