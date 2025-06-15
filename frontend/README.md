# 🛰️ AIRIS (Aplikasi Pemetaan dan Inventarisasi Jaringan Irigasi Berbasis Mobile GIS)

**AIRIS** adalah aplikasi **Mobile GIS** berbasis **React Native** yang dirancang untuk memetakan jaringan irigasi secara real-time dan akurat. Aplikasi ini terintegrasi dengan perangkat **GNSS Low Cost** dan dikembangkan sebagai bagian dari Proyek Akhir Program Studi Sarjana Terapan Sistem Informasi Geografis Universitas Gadjah Mada.

---

## 📌 Fitur Utama

- 🔗 Koneksi Bluetooth dengan perangkat GNSS Low Cost
- 🗺️ Peta interaktif jaringan irigasi (primer, sekunder, tersier)
- 📝 Form survei digital untuk mencatat atribut bangunan irigasi
- 📷 Dokumentasi foto untuk setiap titik bangunan
- 🔄 Fitur tambah, lihat, dan edit data secara langsung dari lapangan
- 📡 Dukungan pengambilan data koordinat RTK dengan akurasi sentimeter

---

## ⚙️ Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Framework | React Native |
| Bahasa Pemrograman | JavaScript |
| Basis Data | PostgreSQL + PostGIS |
| Pemetaan | LeafletJS |
| Perangkat GNSS | TGS EQ1 Receiver |
| API Test | Postman |
| UI/UX Design | Figma |
| Sistem Operasi | Android (min. versi 7.0) |

---

## 🧪 Uji Kelayakan

Aplikasi ini diuji dengan metode **usability testing** berdasarkan 4 aspek utama:

- 📚 Learnability
- 🔄 Flexibility
- ✅ Effectiveness
- 😊 Attitude

---

## 🌍 Lokasi Studi Kasus

> **Saluran Irigasi Van Der Wijck**, Kabupaten Sleman, DI Yogyakarta  
> Dikelola oleh BBWS Serayu Opak dan DPUPESDM DIY

---

## 🗃️ Struktur Database

### Tabel `bangunan_irigasi`

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| gid | Integer (PK) | ID bangunan |
| nama | Varchar(50) | Nama/kode bangunan |
| jenis_bgn | Varchar(50) | Jenis bangunan |
| koor | Geometry(Point, 4326) | Lokasi spasial |
| tgl_survei | Date | Tanggal pemetaan |
| kondisi | Varchar(50) | Kondisi fisik |
| luas_oncoran | Numeric(10,2) | Luas sawah terairi |
| ... | ... | Lainnya |

### Tabel `saluran_irigasi`

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| id | Integer (PK) | ID saluran |
| nama_saluran | Varchar(50) | Nama saluran |
| jenis_saluran | Varchar(50) | Primer/Sekunder/Tersier |
| id_parent | Integer (FK) | Relasi saluran induk |

---

## 🚀 Cara Menjalankan

1. Clone repositori ini:
   ```bash
   git clone https://github.com/RiniHSD/Airis-App.git
   cd Airis-App

2. Install semua dependensi:
   ```bash
   npm install

3. Jalankan aplikasi di emulator atau perangkat Android:
   ```bash
   npx react-native run-android

4. Jika error saat menjalankan aplikasi, coba untuk membersihkan cache terlebih dahulu
   ```bash
   cd android
   ./gradlew clean
   
5. Coba jalankan kembali aplikasi di emulator atau perangkat Android
   ```bash
   cd ../
   npx react-native run-android

6. Pastikan GNSS Low Cost menyala dan Bluetooth diaktifkan di perangkat.


## 👩‍💻 Developer
- Rini Husadiyah
- Program Studi Sarjana Terapan Sistem Informasi Geografis
- Departemen Teknologi Kebumian
- Sekolah Vokasi
- Universitas Gadjah Mada

## 📫 How to reach me
<a href="https://www.linkedin.com/in/rinihusadiyah/"><img src="https://www.vectorlogo.zone/logos/linkedin/linkedin-icon.svg" width="40" height="40" /></a>
<a href="https://mail.google.com/mail/u/rinihusadiyah@gmail.com/#inbox?compose=new"><img src="https://www.vectorlogo.zone/logos/gmail/gmail-icon.svg" width="40" height="40"/></a>

## Tangkapan Layar Aplikasi AIRIS
### Splashscreen, Login, dan Register
<p align="center">
  <img src="ss/1.jpg" width="200"/>
  <img src="ss/2.jpg" width="200"/>
  <img src="ss/3.jpg" width="200"/>
</p>

### Koneksi GNSS
<p>Metode Pengukuran yaitu GNSS Geodetik dan Posisi Internal Hp</p>
<p align="center">
  <img src="ss/4.jpg" width="200"/>
  <img src="ss/5.jpg" width="200"/>
  <img src="ss/6.jpg" width="200"/>
  <img src="ss/22.jpg" width="200"/>
</p>

### Halaman Peta
<p>Lokasi titik bangunan irigasi hasil pengukuran</p>
<p>Tampilan pop-up titik, pop-up saluran irigasi, legenda, dan berbagai basemap</p>
<p align="center">
  <img src="ss/21.jpg" width="200"/>
  <img src="ss/8.jpg" width="200"/>
  <img src="ss/9.jpg" width="200"/>
  <img src="ss/10.jpg" width="200"/>
</p>

### Halaman Survey
<p>Fitur menambahkan data titik bangunan irigasi</p>
<p align="center">
  <img src="ss/11.jpg" width="200"/>
  <img src="ss/12.jpg" width="200"/>
  <img src="ss/13.jpg" width="200"/>
</p>

### Halaman List
<p>Daftar bangunan irigasi beserta fitur lihat, edit, dan hapus</p>
<p align="center">
  <img src="ss/14.jpg" width="200"/>
  <img src="ss/19.jpg" width="200"/>
</p>

<p>Fitur lihat titik di peta dengan validasi topology rules</p>
<p align="center">
  <img src="ss/15.jpg" width="200"/>
  <img src="ss/16.jpg" width="200"/>
  <img src="ss/17.jpg" width="200"/>
  <img src="ss/18.jpg" width="200"/>
</p>

### Halaman Pengguna
<p align="center">
  <img src="ss/20.jpg" width="200"/>
</p>