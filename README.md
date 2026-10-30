# Quests

Aplikasi manajemen waktu bergaya game yang berjalan sepenuhnya di browser. Ubah daftar tugasmu menjadi **quest** dengan tier prioritas, jadwal mulai, batas waktu, checklist, dan persentase penyelesaian. Kumpulkan XP, naik rank dari Warrior sampai Mythic, jaga streak, dan simpan **note** yang bisa tampil otomatis di hari dan jam tertentu.

- Tanpa server, tanpa akun, tanpa pelacak. Semua data tersimpan di perangkatmu.
- PWA: bisa dipasang ke layar utama dan tetap berjalan tanpa internet.
- Ditulis dengan HTML, CSS, dan JavaScript biasa. Tidak ada framework dan tidak ada proses build.

**Alamat aplikasi:** `https://nidrefyvulna.github.io/quests/` (ganti dengan alamat GitHub Pages milikmu)

## Daftar Isi

1. [Mulai Cepat](#mulai-cepat)
2. [Konsep Dasar](#konsep-dasar)
3. [Panduan Fitur](#panduan-fitur)
4. [Format Data](#format-data)
5. [PWA: Instalasi, Offline, dan Update](#pwa-instalasi-offline-dan-update)
6. [Struktur Proyek](#struktur-proyek)
7. [Pengembangan dan Deploy](#pengembangan-dan-deploy)
8. [Pemecahan Masalah](#pemecahan-masalah)
9. [Batasan](#batasan)
10. [Riwayat Versi](#riwayat-versi)

---

## Mulai Cepat

1. Buka alamat aplikasi di browser (paling nyaman di HP).
2. Pasang ke layar utama supaya terasa seperti aplikasi biasa (lihat bagian [PWA](#pwa-instalasi-offline-dan-update)).
3. Di tab **Quests**, tekan tombol **+**, isi nama quest, pilih tier dan type, lalu **Simpan**.
4. Ketuk lingkaran di kanan kartu untuk menyelesaikan quest dengan cepat (100%). Ketuk kartunya untuk membuka detail: atur persentase, centang checklist, tulis catatan, atau tandai **Gagal**.
5. Buka tab **Profil** untuk melihat level, rank, streak, dan statistik.
6. Buka tab **Data** dan tekan **Export Semua Data** secara berkala sebagai cadangan.

---

## Konsep Dasar

| Istilah | Artinya |
|---|---|
| **Quest** | Satu tugas atau kebiasaan yang ingin kamu kerjakan. |
| **Tier** | Prioritas I sampai X. I paling rendah, X paling tinggi. Juga menentukan poin: XP penuh = tier x 10. |
| **Type** | Pola pengulangan quest: Daily, Weekly, Monthly, atau Custom. |
| **Siklus** | Satu putaran quest. Setelah selesai atau berakhir, quest berulang akan memulai siklus baru. |
| **Quest Dimulai** | Kapan siklus quest dimulai (hari, jam, atau tanggal tertentu). |
| **Quest Berakhir** | Kapan siklus quest berakhir (hitung mundur atau tanggal tertentu). |
| **Progres** | Persentase penyelesaian, dari slider atau checklist. Menentukan XP yang didapat. |
| **XP, Level, Rank** | Poin dari quest yang selesai. Level naik karena XP, rank naik tiap 5 level. |
| **Streak** | Jumlah hari berturut-turut kamu menyelesaikan minimal satu quest. |
| **Note** | Catatan terpisah dari quest, dengan tag dan jadwal tampil sendiri. |

### Status quest

| Status | Arti | Filter |
|---|---|---|
| Sedang berlangsung | Sudah dimulai, belum ditutup, dan belum lewat Quest Berakhir. | Aktif secara default |
| Belum dimulai | Quest Dimulai masih di masa depan. | Perlu dicentang |
| Sudah selesai | Ditutup sebagai selesai pada siklus ini. | Perlu dicentang |
| Sudah gagal | Kamu tandai Gagal pada siklus ini. | Perlu dicentang |
| Sudah berakhir | Waktu Quest Berakhir lewat tanpa diselesaikan. | Perlu dicentang |

Quest tidak hilang sendiri. Selama belum selesai dan belum lewat Quest Berakhir, quest tetap ada, dan jika tidak punya batas waktu, quest menunggu sampai kamu menyelesaikannya.

---

## Panduan Fitur

Navigasi bawah punya empat tab: **Quests**, **Note**, **Profil**, dan **Data**. Di header ada chip rank (ketuk untuk membuka Profil) dan tombol tema terang/gelap.

### Quests

#### Membuat dan mengedit quest

Tekan **+** untuk membuat quest. Untuk mengedit, ketuk kartu quest lalu tekan **Edit**.

| Kolom | Fungsi |
|---|---|
| **Nama** | Nama quest (wajib). |
| **Deskripsi** | Penjelasan singkat. Tampil dua baris di kartu. |
| **Checklist** | Satu item per baris. Dipakai untuk menghitung persentase otomatis. |
| **Tier** | I sampai X (I prioritas rendah, X prioritas tinggi). Warna lingkaran tier berubah dari biru (rendah) sampai merah (tinggi). |
| **Type** | Daily, Weekly, Monthly, atau Custom. |
| **Ulangi tiap berapa hari** | Hanya untuk Custom tanpa jadwal hari. Isi 0 untuk quest sekali saja. |
| **Quest Dimulai** | Pilih hari dan jam mulai (opsional), atau tanggal mulai tertentu (opsional). |
| **Quest Berakhir** | Tidak ada batas waktu, hitung mundur, atau tanggal dan jam tertentu. |

#### Type dan siklus

| Type | Siklus baru dimulai |
|---|---|
| Daily | Setiap hari pukul 00.00 |
| Weekly | Setiap Senin pukul 00.00 |
| Monthly | Setiap tanggal 1 pukul 00.00 |
| Custom | Setiap N hari (0 = sekali saja) |

Jika kamu memilih hari di **Quest Dimulai**, hari dan jam itu menggantikan aturan type. Contohnya Weekly dengan hari Sen, Rab, Jum pukul 17.30 berarti quest dimulai tiga kali seminggu pada jam tersebut. Tombol cepat tersedia: Setiap hari, Hari kerja, Akhir pekan, dan Hapus pilihan.

Isi **Mulai pada tanggal** jika quest baru boleh dimulai pada tanggal dan jam tertentu. Sebelum itu, statusnya Belum dimulai.

#### Quest Berakhir

| Pilihan | Perilaku |
|---|---|
| **Tidak ada batas waktu** | Quest menunggu sampai kamu menyelesaikannya. |
| **Hitung mundur setelah dimulai** | Berakhir N menit, jam, hari, atau minggu setelah siklus dimulai. Berlaku di setiap pengulangan. Contoh: mulai 17.30, berakhir 4 jam kemudian (21.30). |
| **Tanggal dan jam tertentu** | Quest berhenti pada waktu itu. Quest berulang tidak dimulai lagi setelahnya. |

Beberapa catatan perilaku:

- Quest Daily, Weekly, atau Monthly tanpa jadwal dengan hitung mundur yang cukup panjang mengikuti batas periodenya. Misalnya Daily dengan hitung mundur 1 hari berakhir tepat tengah malam, bukan 24 jam dari sekarang. Jika sisa waktunya sudah tidak cukup, hitungan dimulai dari sekarang.
- Hitung mundur yang pendek (misalnya 2 jam) paling cocok dipakai bersama jam di Quest Dimulai. Tanpa jam, quest Daily dimulai pukul 00.00.
- Quest berulang yang berakhir tanpa diselesaikan akan memulai siklus baru pada awal siklus berikutnya.

#### Menyelesaikan quest dan sistem poin

Ada dua cara menutup quest:

1. **Cepat:** ketuk lingkaran di kanan kartu. Quest tanpa checklist langsung selesai. Quest yang punya checklist membuka detail terlebih dahulu supaya persentasenya bisa diatur.
2. **Lewat detail:** ketuk kartu, atur progres, lalu tekan **Selesai** atau **Gagal**.

Persentase progres ditentukan seperti ini:

| Kondisi | Persentase |
|---|---|
| Tanpa checklist dan tanpa slider | 100% |
| Ada checklist | Item tercentang dibagi jumlah item |
| Slider digeser | Nilai slider (menimpa checklist) |
| Tombol 25%, 50%, 75%, 100% | Mengisi slider langsung |

Mencentang atau menghapus item checklist membuat persentase kembali otomatis mengikuti checklist.

**XP = tier x 10 x persentase.** Contoh: quest tier VIII (80 XP penuh) yang selesai 50% mendapat 40 XP. Tombol **Selesai** tidak aktif saat 0%. Jika memang tidak dikerjakan, pilih **Gagal**.

**Gagal** tidak memberi XP dan tidak mengurangi XP. Kejadiannya tercatat di Log. Quest berulang tetap memulai siklus baru di waktunya.

Salah ketuk? Lingkaran pada kartu yang sudah selesai atau gagal berfungsi sebagai tombol **Batalkan**. Di detail juga ada tombol Batalkan selesai atau Batalkan gagal.

Setiap siklus baru mengosongkan centang checklist dan persentase.

#### Mengatur daftar quest

- **Tab type:** Semua, Daily, Weekly, Monthly, Custom. Angka kecil di tab adalah jumlah quest yang sedang berlangsung.
- **Pencarian:** mencari di nama, deskripsi, dan catatan quest.
- **Urutkan:**

  | Pilihan | Urutan |
  |---|---|
  | Quest Dimulai A (default) | Yang dimulai paling awal di atas |
  | Quest Dimulai D | Yang dimulai paling baru di atas |
  | Quest Berakhir A | Yang berakhir paling dekat di atas |
  | Quest Berakhir D | Yang berakhir paling jauh di atas |
  | Tier D | X ke I |
  | Tier A | I ke X |

  Quest tanpa batas waktu selalu di bawah saat mengurutkan berdasarkan Quest Berakhir. Daftar juga dikelompokkan berdasarkan status (berlangsung, belum dimulai, selesai, gagal, berakhir).
- **Filter tier:** menampilkan satu tier saja.
- **Tampilkan quest yang:** lima kotak status (Sedang berlangsung, Belum dimulai, Sudah selesai, Sudah gagal, Sudah berakhir). Default hanya Sedang berlangsung.

#### Isi kartu quest

Lingkaran tier (angka Romawi), nama, deskripsi, lalu chip: type, jadwal mulai, sisa waktu (misalnya "Berakhir dalam 3 jam 20 mnt"), persentase dan jumlah item checklist, dan jumlah catatan. Chip sisa waktu berwarna kuning di bawah 24 jam dan merah di bawah 1 jam.

#### Catatan di dalam quest

Di detail quest ada bagian **Catatan** untuk menulis hal yang kamu temukan saat mengerjakan quest. Ketuk **+ Tambah note**, ketik langsung di kolomnya. Perubahan tersimpan otomatis. Catatan ini terpisah dari tab Note dan ikut terhapus bersama quest-nya.

#### Target harian dan Note aktif

Di bawah header tab Quests ada bar **Target hari ini** (misalnya "2 dari 3"). Jumlah targetnya diatur di Profil. Jika ada note berjadwal yang sedang tampil, bagian **Note aktif** muncul di bawahnya.

#### Menghapus quest

Ketuk kartu lalu **Hapus**. Riwayat quest di Log tetap tersimpan.

### Note

Tab **Note** untuk catatan umum: ide, pengingat, daftar belanja, materi belajar, dan sejenisnya. Berbeda dari catatan di dalam quest, note punya tag, jadwal tampil, dan tampilan baca.

#### Membuat dan membaca note

- Tekan **+** untuk membuat note. Note baru langsung dalam mode edit dengan kursor di judul. Note yang dibiarkan kosong tidak disimpan.
- Ketuk sebuah note untuk membukanya dalam **mode baca** hampir layar penuh: hanya judul, tag, dan isi.
- Tombol **Baca | Edit** di atas beralih antara membaca dan menulis. Perubahan tersimpan otomatis.
- Tombol **Properti** membuka pengaturan tag, jadwal tampil, sematkan, arsip, dan hapus.
- Tombol **Salin isi** di bawah menyalin judul dan isi ke clipboard.
- Tombol **Escape** atau **X** menutup note.

#### Format teks

Di mode baca, format sederhana ini dirender:

| Ketik | Hasil |
|---|---|
| `# Judul`, `## Judul`, `### Judul` | Judul bagian |
| `- item` atau `* item` | Daftar poin |
| `1. item` | Daftar bernomor |
| `- [ ] tugas`, `- [x] tugas` | Daftar centang (tampilan saja, tidak bisa diketuk) |
| `**tebal**`, `*miring*`, `` `kode` `` | Tebal, miring, kode |
| `> kutipan` | Kutipan |
| `---` | Garis pemisah |
| `https://...` | Tautan yang bisa diketuk |

#### Tag

Isi tag di Properti, dipisahkan koma (contoh: `kuliah, ide, penting`). Tag yang sudah pernah dipakai muncul sebagai saran yang bisa diketuk. Maksimal 12 tag per note, 24 karakter per tag, tidak membedakan huruf besar kecil. Di daftar note, strip tag di atas dipakai untuk menyaring berdasarkan satu tag.

#### Jadwal tampil

Note bisa selalu tampil, atau hanya tampil di waktu yang kamu tentukan. Atur di **Properti, bagian Jadwal tampil**:

| Pilihan | Contoh pemakaian |
|---|---|
| **Tidak berulang** | Selalu tampil, atau hanya mengikuti rentang "Berlaku antara". |
| **Setiap hari** | Tampil tiap hari, misalnya pukul 08.00 sampai 10.00. |
| **Hari tertentu dalam seminggu** | Tampil setiap Senin, atau Senin sampai Jumat. |
| **Tanggal tertentu dalam sebulan** | Tampil tiap tanggal 1 dan 15, atau di akhir bulan (pilih "Akhir"). |

Untuk semua jadwal berulang kamu bisa membatasi jam dengan **Dari jam** dan **Sampai jam** (tombol cepat: Pagi, Siang, Sore, Malam, Sepanjang hari). Jika jam sampai lebih awal dari jam dari, misalnya 22.00 sampai 06.00, note tampil melewati tengah malam. Kosongkan jam agar tampil sepanjang hari.

**Berlaku antara** (Tampil mulai dan Tampil sampai) membatasi periode berlakunya jadwal. Contoh: "setiap Senin, tetapi hanya sampai akhir bulan". Tanpa jadwal berulang, note langsung tampil terus di antara dua waktu itu. Tombol cepat: Hari ini, Besok, 7 hari.

Saat jadwal tiba dan aplikasi sedang terbuka, muncul pemberitahuan "Note tampil". Note yang sedang tampil dan berjadwal juga muncul di bagian **Note aktif** pada tab Quests.

#### Status, filter, dan urutan

Status note: **Sedang tampil** (default), **Belum tampil** (termasuk note berulang yang sedang di luar jadwalnya), **Sudah lewat** (waktu "Tampil sampai" terlewati), dan **Arsip**. Kamu juga bisa mencari lewat kolom pencarian (judul, isi, tag).

Note yang disematkan selalu di atas. Pilihan urutan: Diedit D (default), Dibuat D atau A, Judul A atau D, Tampil Berikutnya A atau D, Tampil Sampai A atau D.

### Profil

Tab **Profil** menunjukkan perkembanganmu. Ketuk **Atur profil** untuk mengubah nama, target quest per hari (1 sampai 30, default 3), dan hari libur.

#### Level dan rank

Setiap quest yang selesai menambah XP. Level naik tiap XP mencapai ambang berikutnya, dan angka level ditampilkan di dalam cincin. Cincin mengisi sesuai progres menuju level berikutnya. Setiap **5 level naik satu tingkat rank**, dan garis kecil di bawah nama rank menunjukkan posisimu di dalam 5 level itu.

| Rank | Level |
|---|---|
| Warrior I sampai X | 1 sampai 50 |
| Elite I sampai X | 51 sampai 100 |
| Master I sampai X | 101 sampai 150 |
| Grandmaster I sampai X | 151 sampai 200 |
| Epic I sampai X | 201 sampai 250 |
| Legend I sampai X | 251 sampai 300 |
| Mythic I, II, III, ... | 301 ke atas, angka Romawi terus bertambah tanpa batas |

Contoh: Level 1 = Warrior I, Level 6 = Warrior II, Level 46 = Warrior X, Level 51 = Elite I, Level 301 = Mythic I.

XP total yang dibutuhkan untuk mencapai level `n` adalah `5(n-1)^2 + 95(n-1)`. Artinya level pertama butuh 100 XP, lalu tiap level berikutnya butuh 10 XP lebih banyak dari sebelumnya (100, 110, 120, ...).

| Level | XP total | Rank |
|---|---|---|
| 2 | 100 | Warrior I |
| 6 | 600 | Warrior II |
| 46 | 14.400 | Warrior X |
| 51 | 17.250 | Elite I |
| 101 | 59.500 | Master I |
| 301 | 478.500 | Mythic I |

Saat sebuah quest membuatmu naik rank, muncul pemberitahuan "Naik rank".

#### Sub-tab Ringkasan

Target harian, streak sekarang dan terbaik, jumlah quest selesai (dan berapa yang 100%), jumlah gagal, rata-rata persentase selesai, XP 7 hari terakhir, jumlah quest berlangsung, dan grafik XP per hari (pilih 7 atau 30 hari).

#### Sub-tab Statistik

- **Aktivitas 18 minggu:** peta panas bergaya kalender. Makin pekat warna kotak, makin banyak XP di hari itu. Ketuk kotak untuk melihat detail harinya.
- **Selesai per hari dalam seminggu** dan **Selesai per tier.**
- **Pola produktivitas:** hari dan jam paling aktif, quest paling sering selesai atau gagal (muncul setelah minimal 3 quest selesai).

#### Sub-tab Log

Riwayat quest yang selesai atau gagal, dikelompokkan per tanggal dengan total harian. Bisa difilter Semua, Selesai, atau Gagal. Yang ditampilkan adalah 300 catatan terbaru, sedangkan semua catatan tetap tersimpan.

#### Streak dan hari libur

Streak menghitung hari berturut-turut dengan minimal satu quest **selesai** (quest gagal tidak dihitung). Hari ini tidak memutus streak selama harinya belum berakhir. **Hari libur** yang kamu pilih tidak memutus streak jika tidak ada quest yang selesai di hari itu. Target harian dihitung terpisah dari streak.

### Data dan cadangan

Karena data hanya ada di perangkat, gunakan tab **Data** untuk memindahkan atau mencadangkan.

| Tombol | Isi file |
|---|---|
| **Export / Import Semua Data** | Quest beserta progres dan checklist, log, note, dan profil dalam satu file. Paling cocok untuk cadangan atau pindah perangkat. |
| **Export / Import Quests** | Definisi quest saja (nama, tier, jadwal, checklist, catatan quest). Tanpa status selesai. |
| **Export / Import Progres** | Log, profil, dan status selesai quest saat ini. |
| **Export / Import Note** | Semua note beserta tag dan jadwal tampilnya. |

Halaman ini juga menampilkan kapan terakhir kali kamu mengekspor semua data.

**Mode import** (berlaku untuk semua tombol import):

| Mode | Perilaku |
|---|---|
| **Gabungkan dengan data yang ada** (default) | Data baru ditambahkan. Data dengan `id` yang sama diperbarui. Data lain dibiarkan. |
| **Ganti data yang ada** | Kategori yang diimpor diganti seluruhnya. |

Detail penggabungan: quest dicocokkan lewat `id` (status selesai quest yang sudah ada dipertahankan); note dicocokkan lewat `id`; log hanya menambah entri yang belum ada; profil diganti jika ada di file. Pada Import Semua Data mode Gabungkan, quest dan note yang `id`-nya sama diganti dengan isi file.

Tombol lain di halaman Data:

- **Perbarui aplikasi:** menghapus cache aplikasi dan memuat ulang versi terbaru. Data quest dan note tidak terhapus.
- **Hapus semua data:** menghapus quest, note, log, dan profil dari perangkat ini (dua kali konfirmasi). Ekspor dulu bila perlu.

### Pengaturan lain

- **Tema:** tombol bulat di pojok kanan atas beralih terang dan gelap. Awalnya mengikuti pengaturan perangkat dan pilihanmu diingat.
- **Bahasa dan waktu:** antarmuka berbahasa Indonesia, memakai zona waktu perangkat, dan minggu dimulai hari Senin.
- **Pemberitahuan di layar:** pesan singkat muncul saat quest atau note mulai tampil, quest selesai, dan naik rank. Ini hanya muncul saat aplikasi terbuka.

---

## Format Data

### Tempat penyimpanan

Data disimpan di `localStorage` browser (per alamat situs dan per browser). Kunci yang dipakai:

| Kunci | Isi |
|---|---|
| `quests.v1` | Seluruh data aplikasi sebagai satu objek JSON (lihat di bawah). |
| `quests.theme` | `"light"` atau `"dark"`. |
| `quests.bk` | Waktu (epoch ms) terakhir "Export Semua Data". |
| `quests.bak` | Salinan satu kali dari data yang ada saat aplikasi pertama kali memuat data tersimpan. Dibuat otomatis sebagai pengaman saat pembaruan format, tidak diperbarui lagi. Bukan pengganti export. |

Struktur `quests.v1`:

```json
{
  "quests":  [ /* objek quest */ ],
  "log":     [ /* entri log */ ],
  "notes":   [ /* objek note */ ],
  "profile": { "name": "Petualang", "goal": 3, "rest": [] }
}
```

Semua waktu disimpan sebagai **epoch milidetik** (angka). Penomoran hari mengikuti JavaScript: `0` = Minggu, `1` = Senin, ..., `6` = Sabtu. Semua `id` berupa teks (huruf, angka, `_`, `-`, maksimal 40 karakter).

### Objek quest

```json
{
  "id": "mvkdtlq0nh10l",
  "name": "Work Out",
  "desc": "Full-body tanpa alat.",
  "tier": 9,
  "type": "weekly",
  "every": 0,
  "sch": { "days": [1, 3, 5], "time": "17:30", "at": 1792724402232 },
  "start": null,
  "dl": { "k": "after", "at": null, "n": 4, "u": "h" },
  "cl": [ { "id": "mvkdtlq0j6nso", "t": "Pemanasan 5 menit", "d": false } ],
  "notes": [ { "id": "mvkdtm1abc", "text": "Catat repetisi.", "ts": 1792724402232 } ],
  "created": 1792724402232,
  "cs": 1792724402232,
  "doneAt": null,
  "doneLog": null,
  "res": null,
  "pct": null
}
```

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | Pengenal unik. |
| `name` | string | Nama, maksimal 120 karakter. |
| `desc` | string | Deskripsi, maksimal 1000 karakter. |
| `tier` | number | 1 sampai 10 (I sampai X). |
| `type` | string | `daily`, `weekly`, `monthly`, atau `custom`. |
| `every` | number | 0 sampai 3650. Hanya berlaku untuk `custom` tanpa `sch`. `0` = sekali saja. |
| `sch` | object atau null | Quest Dimulai berjadwal: `days` (array hari), `time` (`"HH:MM"`), `at` (penanda internal untuk migrasi). |
| `start` | number atau null | "Mulai pada tanggal" (epoch ms). |
| `dl` | object | Quest Berakhir. `k` = `none`, `after` (hitung mundur), atau `custom` (tanggal tertentu). `at` = waktu untuk `custom`. `n` = jumlah (1 sampai 9999) dan `u` = satuan (`m` menit, `h` jam, `d` hari, `w` minggu) untuk `after`. |
| `cl` | array | Checklist. Item: `id`, `t` (teks, maks 200), `d` (tercentang). Maksimal 100 item. |
| `notes` | array | Catatan di dalam quest: `id`, `text` (maks 5000), `ts`. Maksimal 200. |
| `created` | number | Waktu dibuat. |
| `cs` | number | Awal siklus yang sedang berjalan. Jika lebih besar dari waktu sekarang, status Belum dimulai. |
| `doneAt` | number atau null | Waktu quest ditutup (selesai atau gagal) pada siklus ini. |
| `doneLog` | string atau null | `id` entri log yang bersangkutan. |
| `res` | string atau null | `"fail"` jika ditandai gagal. `null` berarti selesai (bila `doneAt` terisi). |
| `pct` | number atau null | Persentase. `null` = otomatis (checklist atau 100). Saat selesai, nilainya dibekukan. |

### Entri log

```json
{ "id": "mvkdtm8hk8k8q", "qid": "mvkdtlq0nh10l", "name": "Pakai Checklist",
  "tier": 5, "type": "daily", "xp": 25, "at": 1792724402897, "res": "done", "pct": 50 }
```

| Field | Keterangan |
|---|---|
| `qid` | `id` quest asal (riwayat tetap ada walau quest dihapus). |
| `xp` | XP yang didapat (0 untuk gagal). |
| `res` | `"done"` atau `"fail"`. |
| `pct` | Persentase saat ditutup (0 untuk gagal). |

### Objek note

```json
{
  "id": "a1", "title": "Rapat", "body": "# Agenda\n- [ ] siapkan slide",
  "tags": ["kerja", "penting"], "pin": false, "arch": false,
  "from": null, "until": null,
  "rep": { "k": "w", "days": [1], "dom": [], "t1": "08:00", "t2": "10:00" },
  "created": 1792724401894, "edited": 1792724401894
}
```

| Field | Keterangan |
|---|---|
| `title` | Judul (maks 120, boleh kosong jika ada isi). |
| `body` | Isi (maks 5000). |
| `tags` | Maksimal 12 tag, masing-masing maksimal 24 karakter. |
| `pin`, `arch` | Disematkan, diarsipkan. |
| `from`, `until` | "Tampil mulai" dan "Tampil sampai" (epoch ms, boleh `null`). |
| `rep` | Jadwal berulang, atau `null`. `k` = `d` (tiap hari), `w` (hari dalam minggu, pakai `days`), `m` (tanggal dalam bulan, pakai `dom` dengan `0` = akhir bulan). `t1` dan `t2` = jam tampil `"HH:MM"` atau `null` (sepanjang hari). Jika `t2` lebih awal dari `t1`, jendela melewati tengah malam. |

### Profil

```json
{ "name": "Petualang", "goal": 3, "rest": [0] }
```

`name` maksimal 24 karakter, `goal` 1 sampai 30, `rest` berisi hari libur (0 sampai 6).

### Format file export

Semua file export adalah JSON dengan pembungkus yang sama:

```json
{ "app": "quests", "kind": "quests", "v": 2, "exported": "2026-10-24T03:00:03.531Z", "...": "..." }
```

`app` harus `"quests"`, dan `kind` menentukan isi. File dengan `kind` yang tidak cocok dengan tombol import yang dipakai akan ditolak.

| `kind` | Nama file | Isi tambahan |
|---|---|---|
| `quests` | `quests-AAAA-BB-HH.json` | `data`: array quest tanpa status siklus (`cs`, `doneAt`, `doneLog`, `res`, `pct` dibuang, centang checklist dikosongkan). |
| `progress` | `progres-AAAA-BB-HH.json` | `log`, `profile`, dan `done`: peta `idQuest` ke `[doneAt, doneLog, res, pct]` untuk quest yang sedang ditutup. |
| `notes` | `note-AAAA-BB-HH.json` | `data`: array note. |
| `all` | `quests-semua-data-AAAA-BB-HH.json` | `quests` (lengkap dengan status), `log`, `notes`, `profile`. |

Contoh `progress`:

```json
{
  "app": "quests", "kind": "progress", "v": 2, "exported": "2026-10-24T03:00:03.531Z",
  "log": [ { "id": "x1", "qid": "q1", "name": "Catur", "tier": 7, "type": "daily", "xp": 70, "at": 1792724402897, "res": "done", "pct": 100 } ],
  "profile": { "name": "Petualang", "goal": 3, "rest": [] },
  "done": { "q1": [1792724402897, "x1", null, 100] }
}
```

Kamu boleh menyunting file JSON dengan tangan, misalnya menyiapkan banyak quest sekaligus. Contoh minimal untuk Import Quests:

```json
{
  "app": "quests", "kind": "quests", "v": 2,
  "data": [
    { "name": "Catur", "tier": 7, "type": "daily", "dl": { "k": "after", "n": 1, "u": "d" },
      "cl": [ { "t": "Puzzle taktik 15 menit" }, { "t": "1 game rapid" } ] }
  ]
}
```

Field yang tidak diisi diberi nilai bawaan, dan `id` dibuatkan otomatis. Beri `id` sendiri (misalnya `"q-catur"`) agar import ulang memperbarui quest yang sama, bukan membuat duplikat.

### Validasi dan migrasi

- Saat memuat dan mengimpor, semua data dibersihkan: teks dipotong sesuai batas, angka dibatasi ke rentangnya, nilai tidak valid diganti bawaan, dan field yang tidak dikenal diabaikan.
- Format lama otomatis dimigrasi. Misalnya batas waktu lama `"day"` dan `"week"` menjadi hitung mundur 1 hari dan 1 minggu, dan quest lama tanpa checklist atau persentase diberi nilai bawaan.
- Entri log lama tanpa `res` dan `pct` dianggap selesai 100%.

---

## PWA: Instalasi, Offline, dan Update

Quests adalah **Progressive Web App**. Setelah dibuka sekali dengan internet, aplikasi tersimpan di perangkat dan bisa dipakai tanpa koneksi.

### Memasang ke layar utama

| Perangkat | Cara |
|---|---|
| Android (Chrome) | Menu titik tiga, lalu **Instal aplikasi** atau **Tambahkan ke layar utama**. |
| iPhone atau iPad (Safari) | Tombol **Bagikan**, lalu **Tambah ke Layar Utama**. |
| Komputer (Chrome atau Edge) | Ikon instal di kanan address bar, atau menu browser lalu **Instal Quests**. |

Dukungan instalasi tergantung browser dan versinya. Jika tidak ada pilihan instal, aplikasi tetap bisa dipakai di tab biasa.

### Berkas PWA

**`manifest.json`**

| Properti | Nilai |
|---|---|
| `name`, `short_name` | `Quests` |
| `id`, `start_url`, `scope` | `./` (relatif, sehingga berfungsi di subfolder GitHub Pages) |
| `display` | `standalone` (tanpa address bar) |
| `background_color`, `theme_color` | `#f2f4f8` |
| `lang`, `categories` | `id`, `productivity` |
| `icons` | `icons/icon-192.png` dan `icons/icon-512.png` (`any maskable`) |

`index.html` juga memuat meta `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, dan `apple-touch-icon` untuk iOS.

**`sw.js` (service worker)**

| Tahap | Perilaku |
|---|---|
| `install` | Menyimpan file inti ke cache `quests-vN` (`index.html`, `style.css`, `app.js`, `manifest.json`, kedua ikon) dengan melewati cache HTTP browser, lalu `skipWaiting`. |
| `activate` | Menghapus cache versi lama dan mengambil alih halaman (`clients.claim`). |
| `fetch` | Untuk permintaan GET ke alamat yang sama: **jaringan dulu** (selalu memeriksa versi terbaru ke server), lalu menyimpan salinannya ke cache. Jika offline, dipakai salinan dari cache, dan bila tidak ada, `index.html`. |

Strategi jaringan dulu membuat pembaruan yang kamu deploy langsung terpakai, sementara cache menjaga aplikasi tetap bisa dibuka offline.

### Mode offline

Semua fitur bekerja offline karena data ada di perangkat dan tidak ada permintaan ke server lain. Satu-satunya yang butuh internet adalah memuat atau memperbarui berkas aplikasi dari GitHub Pages.

### Alur update

1. Ubah file, deploy ke GitHub Pages.
2. Buka aplikasi. Browser mendeteksi `sw.js` yang baru, menginstalnya, lalu aplikasi memuat ulang sendiri sekali.
3. Cek tab **Data**: tulisan "Versi aplikasi" harus sesuai versi terbaru.

Jika tampilan belum berubah, tutup dan buka lagi aplikasinya, atau tekan **Data, lalu Perbarui aplikasi**. Tombol ini menghapus cache dan mendaftar ulang service worker tanpa menyentuh data.

### Penyimpanan data pada PWA

- Data ada di `localStorage` perangkat itu saja dan **tidak tersinkron** antar perangkat atau antar browser. Pindahkan lewat Export dan Import Semua Data.
- Aplikasi meminta penyimpanan persisten (`navigator.storage.persist`) supaya browser tidak menghapus data saat ruang penuh. Hasilnya tergantung browser.
- Menghapus data situs, menghapus aplikasi terpasang di beberapa perangkat, atau memakai mode penyamaran (incognito) dapat menghapus data. Selalu simpan cadangan.
- **Android dan komputer (Chrome atau Edge):** aplikasi terpasang dan tab browser berbagi penyimpanan yang sama selama alamatnya sama.
- **iPhone dan iPad:** aplikasi dari layar utama punya penyimpanan sendiri yang terpisah dari Safari. Data yang dibuat di tab Safari tidak muncul di aplikasi terpasang, dan sebaliknya. Pindahkan lewat Export dan Import Semua Data, dan pilih satu cara pemakaian sejak awal (disarankan terpasang di layar utama).
- Safari di iPhone dapat menghapus data situs yang tidak dibuka sekitar 7 hari jika situsnya tidak dipasang ke layar utama. Memasang ke layar utama dan rutin export mengurangi risiko ini.

### Privasi

Tidak ada akun, server data, analitik, atau font dan skrip dari pihak lain. Data tidak keluar dari perangkatmu kecuali kamu mengekspornya sendiri.

---

## Struktur Proyek

```
.
├── index.html        Kerangka halaman, dialog, dan tab
├── style.css         Seluruh gaya (tema terang dan gelap)
├── app.js            Seluruh logika aplikasi
├── sw.js             Service worker (offline dan update)
├── manifest.json     Metadata PWA
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

Tidak ada dependensi. `app.js` berisi: sanitasi dan migrasi data, aturan siklus quest dan status, rank dan statistik profil, note (termasuk jadwal berulang dan pembaca), export dan import, serta pengait antarmuka.

---

## Pengembangan dan Deploy

### Deploy ke GitHub Pages

1. Unggah semua file ke repositori (di root atau folder yang kamu pilih).
2. **Settings, lalu Pages, lalu Deploy from a branch**, pilih branch `main` dan folder `/ (root)`.
3. Tunggu sekitar satu menit, lalu buka `https://USERNAME.github.io/NAMA-REPO/`.

Semua alamat file bersifat relatif, jadi aplikasi berjalan baik di subfolder repositori. Service worker membutuhkan HTTPS (GitHub Pages sudah menyediakannya).

### Menjalankan secara lokal

Service worker tidak berjalan dari `file://`. Gunakan server lokal:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

### Setiap kali mengubah aplikasi

1. Naikkan nomor versi cache di `sw.js` (konstanta `V`, misalnya `quests-v9`).
2. Naikkan `VER` di bagian atas `app.js` (angka yang tampil di tab Data).
3. Jika format data berubah, tambahkan penanganan di fungsi `cleanQ`, `cleanN`, `cleanL`, atau `cleanP` supaya data lama tetap terbaca.
4. Deploy, lalu cek tab Data.

---

## Pemecahan Masalah

| Masalah | Solusi |
|---|---|
| Tampilan atau fitur belum berubah setelah deploy | Tunggu GitHub Pages selesai (sekitar 1 menit), buka aplikasi, lalu **Data, Perbarui aplikasi**. Pastikan semua file (termasuk `sw.js`) ikut diunggah. |
| Tulisan "Versi aplikasi: lama" | Browser masih memakai `app.js` lama. Tutup dan buka lagi, atau gunakan **Perbarui aplikasi**. |
| Quest berjadwal tidak terlihat | Quest yang Belum dimulai tersembunyi secara default. Centang **Belum dimulai** di filter status. |
| Quest atau note yang sudah lewat hilang dari daftar | Centang **Sudah berakhir** atau **Sudah lewat**. Keduanya tidak dihapus. |
| "File tidak cocok untuk jenis import ini" | Tombol import harus sesuai jenis file. Gunakan Import Semua Data untuk file `quests-semua-data-...`, dan seterusnya. |
| Import tidak menambah quest baru | Mode **Gabungkan** memperbarui quest ber-`id` sama. Beri `id` berbeda, atau gunakan mode **Ganti**. |
| Data hilang setelah menghapus data browser | Data hanya ada di perangkat. Pulihkan dari file Export Semua Data. |
| Di iPhone, data di aplikasi layar utama berbeda dengan di Safari | Keduanya memakai penyimpanan terpisah. Pindahkan data dengan Export lalu Import Semua Data, dan pakai satu cara secara konsisten. |
| Pemberitahuan tidak muncul saat aplikasi ditutup | Memang demikian: pemberitahuan hanya tampil saat aplikasi terbuka. |
| Tombol instal tidak muncul | Pastikan memakai HTTPS (alamat GitHub Pages), browser didukung, dan aplikasi belum terpasang. |

---

## Batasan

- Di iPhone dan iPad, tab Safari dan aplikasi layar utama punya penyimpanan masing-masing.
- Tidak ada sinkronisasi antar perangkat dan tidak ada notifikasi push. Pemberitahuan hanya saat aplikasi terbuka.
- Kapasitas `localStorage` terbatas (umumnya sekitar 5 MB, tergantung browser). Itu cukup untuk ribuan quest dan note. Jika mendekati batas, aplikasi menampilkan pesan gagal menyimpan, jadi ekspor dan bersihkan data lama.
- Waktu mengikuti jam perangkat. Mengubah zona waktu atau jam perangkat memengaruhi status quest dan note.
- Isi note dirender dengan format sederhana (bukan Markdown penuh). Tabel dan gambar tidak didukung.

---

## Riwayat Versi

| Versi | Perubahan |
|---|---|
| 1 sampai 2 | Versi awal: quest (nama, deskripsi, tier I sampai X, type, batas waktu), catatan per quest, sort dan filter, tab type, log, XP dan level, export dan import quest dan progres, jadwal muncul berdasarkan hari dan jam. |
| 3 | Pengaturan jadwal selalu terlihat, service worker jaringan dulu, label versi, tombol Perbarui aplikasi. |
| 4 | Quest Dimulai dan Quest Berakhir (hitung mundur atau tanggal), filter status quest. |
| 5 | Tombol Gagal, persentase selesai (slider dan checklist), poin sebanding persentase. |
| 6 | Sort Quest Dimulai (default), profil baru: statistik, peta panas, target harian, hari libur. |
| 7 | Sistem rank Warrior sampai Mythic, tab Note, export dan import note dan semua data. |
| 8 | Note berjadwal berulang, mode baca layar penuh, mode edit dan properti note, format teks sederhana. |
