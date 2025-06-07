# 🚗💨 Aplikasi Web Rental Mobil

[![Java](https://img.shields.io/badge/Java-17+-%23EA2D2E.svg?style=for-the-badge&logo=java&logoColor=white)](https://www.java.com/en/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.1-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-%234479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)


Selamat datang di repositori proyek **Aplikasi Web Rental Mobil**! Proyek ini adalah platform komprehensif yang memungkinkan pengguna untuk menyewa mobil dengan mudah dan admin untuk mengelola seluruh operasi rental dengan efisien. Dibangun sebagai monorepo yang memadukan kekuatan **Spring Boot** untuk *backend* yang kuat dan **React.js** dengan **Tailwind CSS** untuk *frontend* yang modern dan responsif.

## ✨ Fitur Utama

Proyek ini telah dilengkapi dengan serangkaian fitur canggih untuk memberikan pengalaman terbaik bagi pengguna dan admin:

### Fungsionalitas Pengguna Umum 👤
* **Pendaftaran & Login Aman:** Pengguna dapat membuat akun baru atau login dengan otentikasi JWT (JSON Web Token) yang kuat.
* **Daftar Mobil Interaktif:** Lihat semua mobil yang tersedia, dilengkapi dengan opsi pencarian (berdasarkan merek/model) dan filter (hanya yang tersedia).
* **Halaman Detail Mobil Lengkap:** Halaman khusus untuk setiap mobil menampilkan informasi detail dan gambar.
* **Proses Penyewaan Mudah:** Alur pembayaran dan penyewaan mobil yang intuitif, didukung dengan **kalender pemilihan tanggal interaktif** 📅.
* **Riwayat Penyewaan Saya:** Pelanggan dapat melihat semua riwayat penyewaan mereka yang lalu.
* **Sewa Kembali / Booking Lagi:** Fitur cepat untuk menyewa kembali mobil yang pernah disewa dari riwayat penyewaan, sangat nyaman! 🔄.
* **Notifikasi Ramah Pengguna:** Pesan sukses, error, dan informasi yang jelas dan tidak mengganggu menggunakan React Toastify ✨.
* **Validasi Formulir Canggih:** Formik dan Yup memastikan semua input formulir valid secara real-time dan memberikan *feedback* instan kepada pengguna ✅.
* **Layout Responsif:** Tampilan aplikasi yang adaptif untuk berbagai ukuran layar, memastikan pengalaman optimal di perangkat mobile (misalnya iPhone 14 Pro Max) hingga desktop 📱💻.

### Fungsionalitas Admin 👑
* **Dashboard Admin Komprehensif:** Panel kontrol khusus untuk semua operasi manajemen.
* **Manajemen Mobil Lengkap (CRUD):** Admin dapat Menambah ➕, Melihat 👀, Mengedit ✏️, dan Menghapus 🗑️ data mobil.
    * **Unggah & Tampilkan Gambar Mobil:** Admin dapat mengunggah gambar saat menambah atau mengedit mobil, dengan pratinjau gambar dan opsi hapus gambar.
    * **Paginasi Data Mobil:** Tabel mobil dilengkapi dengan paginasi untuk penanganan data besar 📄.
    * **Pencarian & Pengurutan Mobil:** Cari mobil berdasarkan merek/model dan urutkan berdasarkan kriteria berbeda (ID, Merek, Harga Harian, Tahun).
* **Manajemen Pengguna:**
    * Lihat daftar semua pengguna terdaftar.
    * Ubah peran pengguna (Customer/Admin).
    * Hapus akun pengguna.
    * **Paginasi Data Pengguna:** Tabel pengguna dilengkapi dengan paginasi.
    * **Pencarian & Pengurutan Pengguna:** Cari pengguna berdasarkan username/email dan urutkan berdasarkan kriteria berbeda.
* **Manajemen Rental Detail:**
    * Lihat semua transaksi rental (pending, confirmed, picked up, returned, cancelled, completed) dengan paginasi.
    * **Konfirmasi Pembayaran:** Admin dapat mengonfirmasi pembayaran dari pengguna.
    * **Perbarui Status Rental Komprehensif:** Admin dapat mengubah status rental ke berbagai tahapan (`PENDING`, `CONFIRMED`, `PICKED_UP`, `RETURNED`, `OVERDUE`, `CANCELLED`, `COMPLETED`).
    * **Pencarian & Pengurutan Rental:** Cari rental berdasarkan penyewa/merek mobil dan filter berdasarkan status, serta urutkan berdasarkan kriteria.
* **Chart Pendapatan Bulanan (Dalam Pengembangan):** Akan memvisualisasikan total pendapatan bulanan untuk analisis bisnis 📈.

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun dengan teknologi modern dan powerful, mengikuti arsitektur monorepo:

### Backend (Java Spring Boot)
* **Java 17+**
* **Spring Boot 3.3.1**: Framework Java yang kuat untuk membangun RESTful APIs.
* **MySQL 8.0+**: Sistem manajemen database relasional yang andal.
* **Spring Security:** Untuk otentikasi (JWT) dan otorisasi berbasis peran.
* **Spring Data JPA / Hibernate:** Untuk interaksi database yang mudah.
* **Lombok:** Mengurangi boilerplate code Java.
* **Apache Commons IO:** Utilitas untuk operasi file (digunakan untuk manajemen unggahan gambar).
* **Maven:** Alat manajemen proyek dan build.

### Frontend (React.js)
* **React.js:** Library JavaScript untuk membangun antarmuka pengguna yang dinamis.
* **Tailwind CSS:** Framework CSS utility-first untuk desain responsif yang cepat.
* **React Router DOM:** Untuk navigasi dan routing di aplikasi.
* **React Toastify:** Menampilkan notifikasi yang menarik.
* **Formik:** Mempermudah pembangunan formulir dan pengelolaan state.
* **Yup:** Untuk validasi skema formulir yang kuat dan deklaratif.
* **React Datepicker:** Komponen kalender interaktif untuk pemilihan tanggal.
* **HTML5, CSS3, JavaScript:** Dasar-dasar pengembangan web.
* **Bootstrap:** (Disebutkan di README lama Anda, bisa dihapus jika tidak lagi digunakan secara aktif).
* **Chart.js:** (Akan diimplementasikan) Library charting untuk visualisasi data.

## 🚀 Memulai Proyek (Lokal)

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

### Prasyarat
Pastikan Anda telah menginstal:
* Java Development Kit (JDK) 17 atau lebih tinggi
* Apache Maven
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

Proyek ini dapat di-*deploy* ke **Render** untuk *hosting* *backend* (sebagai `Web Service`) dan *frontend* (sebagai `Static Site`).

### 1. Persiapan Database Render

* Buat Database PostgreSQL baru di [Render Dashboard](https://dashboard.render.com/new/database).
* Catat `External Database URL`, `Username`, dan `Password`.

### 2. Deployment Backend (Web Service)

* Di [Render Dashboard](https://dashboard.render.com/new/web-service), buat `Web Service` baru.
* Hubungkan ke repositori GitHub Anda (pilih repositori `car-rental-project`).
* **Root Directory:** `car-rental-backend`
* **Build Command:** `./mvnw clean install -DskipTests`
* **Start Command:** `java -jar target/*.jar`
* **Environment Variables:** Tambahkan:
    * `JWT_SECRET_KEY`: `your_strong_jwt_secret_key` (string acak yang panjang dan kuat)
    * `SPRING_DATASOURCE_URL`: `External Database URL` dari Render PostgreSQL Anda.
    * `SPRING_DATASOURCE_USERNAME`: `Username` dari Render PostgreSQL Anda.
    * `SPRING_DATASOURCE_PASSWORD`: `Password` dari Render PostgreSQL Anda.
    * `SPRING_JPA_HIBERNATE_DDL_AUTO`: `update`
    * `FILE_UPLOAD_DIR`: `/var/data/images/` (Ini adalah path untuk *persistent disk* di Render, yang harus dikonfigurasi terpisah. Jika tidak ada disk, gunakan `/tmp/images/` untuk penyimpanan sementara yang akan hilang saat deploy ulang). **Untuk produksi, sangat disarankan menggunakan AWS S3 atau Cloudinary untuk gambar.**
    * `SERVER_PORT`: `8080` (Render akan meng-*override* ke *port* yang tersedia secara otomatis).

### 3. Deployment Frontend (Static Site)

* Setelah Backend di-*deploy* dan Anda mendapatkan URL publiknya (misalnya `https://car-rental-backend-abc.onrender.com`).
* **Perbarui semua URL *backend* di kode Frontend Anda (`car-rental-frontend`):**
    * Ganti semua `http://localhost:8080` menjadi URL publik Backend Render Anda di file-file seperti `DashboardPage.js`, `HomePage.js`, `PaymentPage.js`, `CarDetailPage.js`.
* **Perbarui CORS di Backend Render Anda:**
    * Di pengaturan `Web Service` Backend Anda di Render, tambahkan domain *frontend* publik Anda ke daftar `Allowed Origins` di konfigurasi CORS. Contoh: jika *frontend* di-*deploy* ke `https://car-rental-frontend-xyz.onrender.com`, maka di `car-rental-backend/src/main/java/com/rental/car_rental_backend/security/SecurityConfig.java`, ubah `configuration.setAllowedOrigins(List.of("http://localhost:3000"));` menjadi `configuration.setAllowedOrigins(List.of("http://localhost:3000", "https://car-rental-frontend-xyz.onrender.com"));`.
* Di [Render Dashboard](https://dashboard.render.com/new/static-site), buat `Static Site` baru.
* Hubungkan ke repositori GitHub Anda.
* **Root Directory:** `car-rental-frontend`
* **Build Command:** `npm run build`
* **Publish Directory:** `build`

## 🤝 Kontribusi

Merasa ingin berkontribusi? Ide-ide, laporan bug, atau permintaan fitur selalu disambut!

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.
