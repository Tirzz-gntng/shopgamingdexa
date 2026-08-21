# ORDERHUB V2 — Auto Order + Admin Panel

## Upgrade baru
- Admin Panel
- Tambah produk
- Edit produk
- Hapus produk
- Atur harga
- Atur kategori
- Atur stok
- Atur badge
- Atur icon
- URL gambar produk
- Dashboard statistik
- Data pesanan demo
- Pengurangan stok otomatis saat order
- Pengaturan biaya layanan
- Keranjang LocalStorage
- Produk LocalStorage
- Pesanan LocalStorage
- Placeholder payment gateway

## Menjalankan
Buka `index.html`.

## Production
Versi ini adalah frontend demo. Untuk web production:
1. Ganti LocalStorage dengan API/backend.
2. Gunakan database MySQL/PostgreSQL/Supabase/Firebase.
3. Buat autentikasi admin.
4. Buat endpoint create-order.
5. Hubungkan payment gateway dari backend.
6. Gunakan webhook payment gateway untuk mengubah status pesanan.

Jangan menaruh secret key payment gateway di JavaScript frontend.
