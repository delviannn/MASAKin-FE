# MASAKin

MASAKin adalah buku resep keluarga berbasis web untuk menyimpan resep, bahan, langkah memasak, dan kategori dalam satu tempat.

## Fitur

- Tambah, lihat, ubah, dan hapus kategori serta resep.
- Kelola bahan dengan nama, jumlah, dan satuan; tambah, ubah, hapus, dan urutkan langkah memasak.
- Cari resep berdasarkan nama, kategori, atau bahan.
- Tandai resep sebagai favorit dan lihat rekap resep per kategori maupun daftar favorit.
- Buat daftar belanja dari bahan resep yang dipilih.

## Menjalankan aplikasi

Buka `app/index.html` melalui browser atau sajikan folder proyek ini menggunakan web server statis. File awal situs `index.html` mengarahkan ke aplikasi. Tidak diperlukan proses build.

Contoh resep akan dimuat pada penggunaan pertama. Resep, kategori, profil, dan daftar belanja disimpan di `localStorage` browser, sehingga data hanya tersedia pada browser dan perangkat yang sama.

## Catatan keamanan

Aplikasi ini belum memiliki akun, login, atau server untuk menyinkronkan data. Jangan menyimpan kata sandi atau informasi sensitif di aplikasi. Nilai yang ditampilkan sebagai teks pada halaman di-escape untuk mencegah input pengguna diperlakukan sebagai markup HTML.

Pratinjau: [MASAKin](https://delviannn.github.io/MASAKin-FE/)
