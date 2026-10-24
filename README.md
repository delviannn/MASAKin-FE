# MASAKin

MASAKin adalah buku resep keluarga berbasis web untuk menyimpan resep, bahan, langkah memasak, dan kategori dalam satu tempat.

## Fitur

- Tambah, lihat, ubah, dan hapus kategori serta resep.
- Kelola bahan dengan nama, jumlah, dan satuan; tambah, ubah, hapus, dan urutkan langkah memasak.
- Cari resep berdasarkan nama, kategori, atau bahan.
- Tandai resep sebagai favorit dan lihat rekap resep per kategori maupun daftar favorit.
- Buat daftar belanja dari bahan resep yang dipilih.

## Menjalankan aplikasi

Buka `index.html` atau sajikan folder proyek ini menggunakan web server statis. Halaman awal mengarahkan ke login preview; isi nama pengguna dan kata sandi apa saja untuk membuka dashboard. Login ini hanya demonstrasi antarmuka, tidak memverifikasi identitas dan tidak menyimpan kredensial. Halaman aplikasi tetap dapat dibuka langsung, sehingga login bukan pengamanan akses. Tidak diperlukan proses build. Bootstrap 5.3.8 dimuat dari CDN, jadi koneksi internet diperlukan untuk styling dan komponen Bootstrap.

Contoh resep akan dimuat pada penggunaan pertama. Resep, kategori, profil, dan daftar belanja disimpan di `localStorage` browser, sehingga data hanya tersedia pada browser dan perangkat yang sama.

## Catatan keamanan

Aplikasi belum memiliki akun sungguhan atau server untuk menyinkronkan data. Login preview hanya memerlukan isian non-kosong; kata sandi disamarkan di kolom input dan tidak disimpan. Data resep dan profil tersimpan di `localStorage` browser. Jangan menyimpan kata sandi atau informasi sensitif di aplikasi. Nilai yang ditampilkan sebagai teks pada halaman di-escape untuk mencegah input pengguna diperlakukan sebagai markup HTML.

Pratinjau: [MASAKin](https://delviannn.github.io/MASAKin-FE/)
