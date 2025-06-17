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
4.  Tambahkan Username pada table users seperti ini
   ```bash
   insert into users values(4, 'admin@example.com', '$2a$10$7Uvq3IgSNJ9dVQ3bWOf3IeQZdoJ8vdIUqBBJ9LYDN5g1aUA18hWg2', 'ADMIN', 'adminuser');
```

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

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.
