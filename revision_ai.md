# Review & Final Revision Request — AI Copilot UX, Conversation Persistence, and Universal Action Flow

Lanjutkan implementasi AI Copilot berdasarkan implementation plan sebelumnya. Secara umum progresnya sudah sangat baik: AI sudah dapat menjawab, memahami konteks percakapan, membuat judul percakapan otomatis, serta dapat mengambil data dari database. Namun masih ada beberapa fitur inti yang belum benar-benar selesai.

**Fokus revisi kali ini hanya pada AI Copilot. Jangan mengubah arsitektur atau fitur lain yang sudah berjalan. Lakukan audit menyeluruh terlebih dahulu, cari akar masalahnya, lalu perbaiki hingga benar-benar stabil tanpa merusak sistem yang sudah ada.**

---

# 1. Conversation Persistence (PRIORITAS TERTINGGI)

Saat ini:

- Judul percakapan berhasil tersimpan.
- List percakapan berhasil muncul.
- Tetapi isi percakapannya hilang.

Reproduksi:

1. Membuat percakapan baru.
2. Mengobrol cukup panjang.
3. Reload halaman / pindah halaman.
4. Membuka kembali percakapan tersebut.

Hasil saat ini:

- Judul masih ada.
- Tetapi seluruh isi chat kosong.
- AI memulai percakapan dari awal lagi.

Ini bukan yang diharapkan.

## Yang harus terjadi

Seluruh conversation history harus benar-benar tersimpan.

Persis seperti ChatGPT.

Ketika membuka conversation lama:

- seluruh user message muncul
- seluruh assistant message muncul
- urutan tetap
- markdown tetap
- tool result tetap
- state conversation tetap

AI harus melanjutkan percakapan dari history tersebut, bukan memulai percakapan baru.

Lakukan audit penuh pada:

- database conversation
- message table
- loader
- hydration
- query
- restore state
- AI SDK
- serialization
- deserialization

Pastikan benar-benar work perfectly.

---

# 2. Universal AI Action Flow (Revisi Alur)

Implementasi sekarang masih salah.

Saat user berkata:

> Buat tugas mencuci pakaian hari ini.

AI menjawab:

> Draft berhasil dibuat, silakan klik tombol...

Padahal tidak ada apa pun yang muncul.

Flow ini harus diubah total.

## Flow Baru

Ketika AI memahami bahwa user ingin melakukan suatu aksi (create/update/delete/edit), maka:

AI langsung membuat **Draft Action**.

Kemudian AI langsung membuka popup/form asli milik modul tersebut.

Contoh:

User:

> Buat tugas mencuci pakaian hari ini.

AI:

- memahami intent
- mengisi seluruh field yang diketahui
- field yang tidak diketahui diisi default yang aman
- langsung memunculkan popup Create Task

Popup tersebut adalah popup asli milik Task Module.

Semua field otomatis terisi.

User tinggal:

- mengecek
- mengubah jika perlu
- klik Simpan

Tidak perlu pindah halaman.

Popup muncul di halaman tempat user sedang berada.

---

Contoh lain

Quick Chat sedang dibuka di Dashboard.

User berkata:

> Catat pengeluaran makan siang 15000.

Maka:

langsung muncul popup Create Finance Transaction.

Field otomatis terisi.

User tinggal konfirmasi.

---

User:

> Buat artikel tentang Linux Server.

Langsung muncul popup CMS Post.

Title:

Linux Server

Type:

Article

Body:

hasil AI

Status:

Draft

User tinggal edit lalu Publish.

---

User:

> Tambahkan jurnal hari ini.

Langsung popup Diary.

---

User:

> Update status Project Hilmi OS menjadi Development.

Popup Update Project muncul.

---

User:

> Tambahkan achievement.

Popup Achievement muncul.

---

Hal yang sama berlaku untuk SEMUA MODUL.

Bukan hanya Task.

---

# 3. Natural Language Tool Calling

Saat ini tool masih terlalu bergantung pada parameter yang lengkap.

AI harus memahami bahasa manusia.

Misalnya:

"buat tugas"

"tolong ingatkan"

"aku harus"

"catat"

"masukin"

"jadwalkan"

"buat thread"

"buat artikel"

"buat post"

"upload"

"tambahkan"

"hapus"

"ubah"

"selesaikan"

"update"

AI harus memahami intent.

Tidak boleh meminta format tertentu.

---

# 4. Auto Fill Missing Parameters

Jika user tidak menyebut seluruh field.

Contoh:

> Buat tugas mencuci pakaian hari ini.

AI tidak boleh gagal.

Field yang kosong otomatis diisi nilai default yang masuk akal.

Misalnya:

priority:

Medium

status:

Todo

deadline:

hari ini

category:

General

dan sebagainya.

Karena user tetap akan melihat popup konfirmasi sebelum menyimpan.

Jangan pernah gagal hanya karena parameter tidak lengkap.

---

# 5. Popup Works Everywhere

Popup tidak boleh hanya bisa muncul di halaman Task.

Popup harus bisa dipanggil secara global.

Artinya:

Dashboard

Projects

Finance

CMS

AI Page

Quick Chat Floating

Semuanya bisa membuka popup modul mana pun.

Gunakan Global Modal Manager / Command Dispatcher jika diperlukan.

Tidak perlu redirect halaman.

User tetap berada di halaman sekarang.

Popup cukup muncul di atas halaman tersebut.

---

# 6. Rich Text Rendering

Masih ada respon AI seperti:

**Halo**

ditampilkan sebagai

**Halo**

(bintang terlihat)

Seharusnya markdown dirender.

Support:

- Bold
- Italic
- Bullet List
- Number List
- Code
- Quote
- Table
- Link
- Heading

Gunakan renderer markdown yang aman.

---

# 7. Interactive AI Response

Kalau AI menyebut data dari sistem.

Misalnya:

Task:

- Menulis Proposal
- Mengerjakan Website

Nama task tersebut harus bisa diklik.

Klik membuka detail task.

Begitu juga:

Project

Goal

Diary

Finance

Achievement

CMS Post

Timeline

Semua entity yang berasal dari database dibuat interaktif.

---

# 8. Audit Seluruh AI Tool

Audit seluruh tool yang ada.

Pastikan:

- create
- update
- delete
- read
- search
- summary

semuanya berjalan.

Lakukan pengujian satu per satu.

Tidak boleh ada tool yang hanya berhasil sebagian.

---

# 9. Quick Chat & AI Page

Quick Chat Floating dan halaman `/portal/ai` harus menggunakan engine yang sama.

Bedanya hanya UI.

Behavior harus identik.

Namun:

Floating Quick Chat SELALU membuat conversation baru.

Sedangkan halaman AI dapat:

- membuat chat baru
- membuka history
- melanjutkan history

---

# 10. Reliability

Pastikan:

- tidak ada race condition
- tidak ada state hilang
- tidak ada duplicate request
- tidak ada duplicate conversation
- tidak ada duplicate message
- optimistic update tetap sinkron
- rollback jika gagal
- error handling jelas
- loading state baik
- streaming tetap berjalan

---

# Yang WAJIB Dilakukan Sebelum Coding

Sebelum mengubah kode:

1. Audit implementation plan sebelumnya.
2. Audit seluruh AI flow.
3. Cari semua fitur yang belum benar-benar selesai.
4. Cari bug tersembunyi.
5. Cari potensi race condition.
6. Cari bug penyimpanan history.
7. Cari bug tool calling.
8. Cari bug popup flow.
9. Pastikan solusi yang dibuat tidak merusak sistem yang sudah berjalan.

Prioritaskan kestabilan, UX, dan integrasi penuh antar modul dibanding menambah fitur baru. Target akhirnya adalah AI Copilot yang terasa seperti asisten utama untuk seluruh dashboard: memahami bahasa alami, mampu mengontrol semua modul, menyimpan seluruh percakapan secara utuh, dan memberikan pengalaman yang cepat, konsisten, serta tanpa error.

## 11. AI Model Optimization

Lakukan audit terhadap konfigurasi model AI yang saat ini digunakan.

Ubah model default menjadi:

`llama-3.1-8b-instant`

Alasan perubahan:

- Lebih hemat token.
- Lebih cepat memberikan respons.
- Lebih efisien untuk penggunaan AI Copilot sehari-hari.
- Sudah sangat cukup untuk kebutuhan reasoning, tool calling, summary, dan command execution pada dashboard.

Namun, jangan hanya mengganti nama model.

Pastikan seluruh integrasi AI tetap bekerja dengan sempurna setelah migrasi, termasuk:

- Streaming response.
- Conversation history.
- Tool calling.
- Structured output.
- Draft Action.
- Voice command.
- Context retrieval.
- Database query.
- CMS integration.
- Finance insights.
- Weekly/Daily insights.
- Semua Server Actions.
- Semua AI Tools.

Lakukan audit kompatibilitas terhadap AI SDK, provider, dan seluruh tool schema agar tidak ada breaking changes setelah migrasi model.

Jika terdapat parameter khusus yang direkomendasikan untuk `llama-3.1-8b-instant` (temperature, max tokens, tool choice, reasoning settings, dll.), sesuaikan dengan best practice agar performa optimal.

Pastikan seluruh fitur tetap berjalan tanpa regresi.

Lakukan pengujian menyeluruh (end-to-end) setelah migrasi model dan pastikan seluruh AI Copilot bekerja **work perfectly**.
