# VERA — Voice-Enabled Electronic Medical Record
**"Less Screen. More Connection. Safer Patient Care."**

Sistem Rekam Medis Elektronik Terintegrasi berbasis Pengenalan Suara (Voice Recognition) dan Barcode Closed-Loop untuk Puskesmas Rawat Inap di Indonesia.

---

## 1. Arsitektur Aplikasi
Aplikasi VERA dibangun dengan arsitektur full-stack modern:
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend API**: Node.js + Express (`server.ts`) terintegrasi dengan Vite middleware
- **Kecerdasan Buatan (AI)**: Google Gemini API (`@google/genai`, model `gemini-3.8-flash`) untuk penstrukturan dikte suara klinis otomatis ke format SOAP & TTV, serta multi-turn clinical chat assistant.
- **Voice Recognition**: Web Speech API (`id-ID`) dengan adaptor fallback cerdas untuk pengujian simulasi tanpa mikrofon fisik.
- **Identifikasi Pasien & Barcode Closed-Loop**: Kamera smartphone Android (HTML5 MediaStream) + Code 128 / QR matrix SVG generator.
- **Model Keamanan**: Role-Based Access Control (RBAC), Audit Trail digital, dan pemenuhan regulasi Permenkes No. 24 Tahun 2022.

---

## 2. Kebutuhan Instalasi
- **Node.js**: versi 20+
- **Manajer Paket**: npm atau bun
- **Dependensi Utama**:
  - `@google/genai` (SDK resmi Gemini)
  - `express`, `tsx`, `dotenv`
  - `lucide-react`, `motion`
  - `tailwindcss`

Untuk menginstal dependensi:
```bash
npm install
```

---

## 3. Variabel Lingkungan (.env)
Buat file `.env` di direktori utama:
```env
# Gemini API Key untuk penstrukturan suara & asisten klinis
GEMINI_API_KEY=your_gemini_api_key_here

# Port Server
PORT=3000
NODE_ENV=development
```
*Catatan Keamanan: Jika `GEMINI_API_KEY` tidak diisi, sistem otomatis beralih ke VERA Clinical Rule Engine Adapter (Mode Simulasi) sehingga seluruh fungsi tetap berjalan lancar tanpa error.*

---

## 4. Konfigurasi Database & Penyimpanan
- **Demo & Local State**: Menyimpan mutasi data (admisi, perubahan bed, CPPT, resep, lab, diet, MAR, jejak audit) secara persisten di `localStorage` peramban.
- **Reset State**: Tombol reset data demo tersedia di profil pengguna dan menu System Settings untuk mengembalikan 16 bed ke kondisi awal kapan saja.
- **Integrasi Cloud**: Siap dihubungkan ke Firebase Firestore atau PostgreSQL Cloud SQL dengan schema relational yang selaras dengan `src/types/emr.ts`.

---

## 5. Fitur Utama & Modul VERA

### A. Inpatient Bed Dashboard (EMR Ward)
- Grid 4 ruangan x 4 tempat tidur = **16 Bed Fisik**:
  - Ruang Melati (Kelas 3, Bed A01-A04)
  - Ruang Mawar (Kelas 2, Bed B01-B04)
  - Ruang Dahlia (Kelas 1, Bed C01-C04)
  - Ruang Anggrek (Isolasi, Bed D01-D04)
- **Sistem Warna Okupansi Baku**:
  - **BLUE (#2563EB)**: Bed Kosong / Vacant (Klik untuk Admisi Baru)
  - **BLACK (#111827)**: Bed Terisi / Occupied (Klik untuk Detail EMR Pasien)
  - **GRAY**: Pemeliharaan / Sterilisasi
- **Indikator Kegawatan Klinis (Vertical Strip & Badge)**:
  - Burgundy (#7F1D1D): Kritis / Paliatif
  - Merah (#DC2626): Berat (Severe)
  - Kuning (#FACC15): Sedang (Moderate)
  - Hijau (#16A34A): Stabil / Terkontrol
- **Simbol Klinis**: Risiko Jatuh (⚠️), Terapi Infus (💉), Terapi O2 (🫁), Jadwal Obat (💊), Order Lab (🧪), Diet Khusus (🍽️), dsb.

### B. Voice Recognition & Clinical Structuring (VERA Voice)
- Mengurangi **screen-driven distraction** dari 68% menjadi 18% waktu visite.
- 3 Status rekaman: `IDLE`, `RECORDING`, `PROCESSING`.
- Penstrukturan otomatis oleh Gemini ke dalam format SOAP:
  - Subjektif (S)
  - Objektif (O) & Ekstraksi Tanda-Tanda Vital (TD, HR, RR, Suhu, SpO2, Nyeri)
  - Asesmen (A)
  - Plan (P) & Resep/Lab
- **Wajib Verifikasi Nakes (Human-in-the-Loop)**: AI tidak pernah mengesahkan rekam medis secara otonom tanpa tanda tangan elektronik dokter/perawat.

### C. Barcode Closed-Loop Patient Safety
- Alur 7-Benar pemberian obat & pengambilan spesimen:
  1. Scan Gelang Pasien di Bedside
  2. Scan E-Tiket Obat / Label Tabung Lab
  3. Sistem memverifikasi kesesuaian identitas pasien
  4. **Pencegahan Error**: Jika gelang atau obat tertukar, sistem menampilkan peringatan fatal dan memblokir transaksi!
  5. Konfirmasi nyata oleh perawat pelaksana.

---

## 6. Akun Pengguna Demo (RBAC)
Pilih akun mana saja melalui pemilih profil di pojok kanan atas:
1. **dr. Budi Santoso, Sp.PD** (Dokter DPJP Rawat Inap)
2. **dr. Siti Rahayu** (Dokter Jaga Bangsal)
3. **Ns. Dewi Sartika, S.Kep** (Kepala Tim Perawat)
4. **Ns. Ahmad Fauzi, S.Kep** (Perawat Pelaksana Bedside)
5. **Apt. Rina Kusuma, S.Farm** (Apoteker Penanggung Jawab Farmasi)
6. **Hendra Gunawan, A.Md.AK** (Pranata Laboratorium)
7. **Tri Wahyuni, A.Md.RMIK** (Perekam Medis & Admisi)
8. **Eko Prasetyo, S.Kom** (Administrator Sistem & TI)
9. **Bpk. Agus Setiawan** (Portal Pasien & Keluarga)

---

## 7. Perintah Menjalankan Aplikasi
```bash
# Menjalankan server pengembangan (Port 3000)
npm run dev

# Menjalankan unit tests logika klinis
npm test

# Build untuk produksi
npm run build
```

---

## 8. Batasan Kesiapan Produksi (Production Readiness Limitations)
Aplikasi ini dikembangkan untuk tujuan penelitian, simulasi alur kerja klinis, dan uji coba kegunaan (usability evaluation). Sebelum implementasi di fasilitas kesehatan nyata, sistem harus melalui:
1. Validasi keamanan informasi & penjaminan privasi pasien (Permenkes 24/2022).
2. Integrasi tanda tangan digital tersertifikasi (BSrE / Balai Sertifikasi Elektronik).
3. Uji penetrasi dan enkripsi end-to-end data medik (EHR encryption).
