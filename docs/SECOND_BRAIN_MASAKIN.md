# MASAKin — Second Brain

Catatan ini menyimpan kebutuhan produk dan hasil audit fitur MASAKin. Gunakan matriks di bawah sebagai checklist saat implementasi atau review berikutnya.

## Kebutuhan fungsional

| ID | Kebutuhan | Status | Bukti di aplikasi |
|---|---|---|---|
| FR-01 | CRUD kategori resep: tambah, tampil, ubah, hapus. | Terpenuhi | Halaman Resep menyediakan tambah dan kelola kategori. Kategori yang masih dipakai resep tidak dapat dihapus sebelum resep dipindahkan. |
| FR-02 | CRUD resep dengan nama, kategori, porsi, waktu memasak, dan deskripsi. | Terpenuhi | Form resep menyimpan semua atribut tersebut dan daftar resep menyediakan ubah serta hapus. |
| FR-03 | CRUD bahan resep: nama bahan, jumlah, dan satuan. | Terpenuhi | Bahan dikelola di form resep; tambah/hapus tersedia dan ubah dilakukan melalui form edit resep. |
| FR-04 | CRUD langkah memasak berurutan: tambah, tampil, ubah, hapus, dan atur urutan. | Terpenuhi | Form resep menyediakan langkah berurutan, ubah instruksi, hapus, serta tombol naik/turun. |
| FR-05 | Cari resep berdasarkan nama, kategori, atau bahan. | Terpenuhi | Cari Resep mendukung nama/deskripsi, filter kategori, dan kata kunci bahan. |
| FR-06 | Tandai resep favorit dan tampilkan di daftar favorit. | Terpenuhi | Favorit dapat ditandai dari koleksi resep dan ditampilkan di halaman Favorit serta Rekap Favorit. |
| FR-07 | Tampilkan rekap jumlah resep per kategori dan daftar resep favorit. | Terpenuhi | Laporan dan halaman Rekap Kategori menampilkan jumlah per kategori; Rekap Favorit menampilkan daftar favorit. |

## Kebutuhan nonfungsional

| ID | Kebutuhan | Status | Catatan audit |
|---|---|---|---|
| NFR-01 | Aplikasi mudah digunakan; menu resep, pencarian, bahan, langkah, dan favorit mudah ditemukan. | Terpenuhi | Navigasi utama menautkan Resep, Cari Resep, Favorit, Laporan, dan halaman terkait. Bahan dan langkah dapat dikelola dari form resep. |
| NFR-02 | Validasi data wajib dan format input. | Terpenuhi | Form memeriksa nama, kategori, porsi 1–20, waktu 1–1440 menit, nama/jumlah bahan, langkah, panjang nama kategori, dan kategori duplikat. |
| NFR-03 | Keamanan dasar dan password tersembunyi saat login. | Sebagian / preview saja | Login preview memiliki kolom password bertipe `password` dan tidak menyimpan kredensial. Form menerima isian apa pun, bukan autentikasi; halaman aplikasi juga dapat dibuka langsung. Data resep/profil disimpan di `localStorage` tanpa perlindungan akun atau enkripsi aplikasi. |
| NFR-04 | Beri informasi jelas setelah tambah, ubah, hapus, cari, atau simpan favorit. | Terpenuhi | Halaman Resep memakai pesan status dan konfirmasi hapus; halaman pencarian menampilkan jumlah hasil; favorit, laporan, dan profil menyediakan status atau ringkasan. |

## Kesimpulan

Untuk cakupan fitur prototipe lokal yang berjalan tanpa akun, seluruh FR terwakili di aplikasi. NFR-01, NFR-02, dan NFR-04 juga terwakili. NFR-03 hanya sebagian: password disamarkan pada form login preview dan tidak disimpan, tetapi tidak ada autentikasi atau perlindungan data akun. Login preview bukan kontrol akses dan semua data tetap di browser.

## Catatan implementasi

- Data tersimpan pada `localStorage`, sehingga tidak otomatis dibagikan antar-browser atau perangkat.
- Login preview menerima nama pengguna dan kata sandi apa pun yang tidak kosong, lalu membuka dashboard. Tidak ada akun demo atau kredensial bawaan.
- Takaran bahan pada pengatur porsi dihitung dari jumlah resep asli; teks jumlah non-numerik seperti “secukupnya” ditampilkan apa adanya.
- Audit ini berdasarkan pembacaan implementasi; pengujian manual/browser belum dijalankan.
