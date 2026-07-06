# FINAL CRITICAL REVISION — Full AI Copilot Architecture Audit & Refactor

**STOP menambahkan fitur baru terlebih dahulu.**

Saat ini AI Copilot sudah memiliki banyak fitur, tetapi fondasinya masih belum stabil. Saya ingin seluruh fokus diarahkan untuk **mengaudit, memperbaiki, dan menstabilkan AI Copilot** sampai benar-benar production-ready.

Jangan melakukan perbaikan parsial. Jangan memperbaiki hanya error yang terlihat. Lakukan **root cause analysis** terhadap seluruh pipeline AI dan refactor jika memang diperlukan.

---

# TARGET

Target akhir bukan sekadar "error hilang".

Target akhirnya adalah:

> **AI Copilot yang stabil, konsisten, mampu memahami bahasa natural, mampu mengontrol seluruh modul dashboard, mampu menyimpan seluruh percakapan, serta tidak menghasilkan error tool calling apa pun.**

Implementasi dianggap selesai hanya jika seluruh alur benar-benar berjalan end-to-end.

---

# 1. Full End-to-End Audit

Lakukan audit terhadap seluruh pipeline berikut.

```
User Prompt

↓

Conversation

↓

History Loader

↓

AI SDK

↓

Model

↓

System Prompt

↓

Tool Selection

↓

Parameter Extraction

↓

Normalization Layer

↓

Tool Schema

↓

Validation

↓

Server Action

↓

Database

↓

UI Event

↓

Popup

↓

Confirmation

↓

Persist Conversation

↓

Reload Conversation

↓

Continue Conversation
```

Jangan mengasumsikan apa penyebabnya.

Trace seluruh flow.

Tambahkan logging sementara bila perlu.

Temukan akar masalah sebenarnya.

---

# 2. Audit Semua Error Tool Calling

Saat ini error yang muncul **berbeda-beda**, artinya masih ada banyak jalur yang gagal.

Contoh yang sudah terjadi:

```
tool call validation failed
```

```
parameters did not match schema
```

```
additionalProperties
```

```
missing required field
```

```
invalid_request_error
```

```
Failed to call a function.
Please adjust your prompt.
```

Jangan hanya memperbaiki salah satunya.

Audit seluruh kemungkinan penyebab.

Tidak boleh ada lagi satu pun error tool calling yang lolos ke user.

---

# 3. Refactor Tool Pipeline

Tool tidak boleh menerima output mentah dari LLM.

Tambahkan pipeline seperti ini:

Natural Language

↓

Intent Detection

↓

Entity Extraction

↓

Parameter Extraction

↓

Normalization

↓

Default Value Injection

↓

Enum Mapping

↓

Date Parsing

↓

Schema Transformation

↓

Tool Validation

↓

Server Action

↓

Popup Confirmation

↓

Database

Artinya schema validation dilakukan setelah parameter dinormalisasi.

Bukan sebelumnya.

---

# 4. Schema Tidak Boleh Terlalu Kaku

Tool schema saat ini terlalu strict.

Perbaiki.

Gunakan:

* preprocess
* transform
* default
* optional
* catch
* coercion

Jangan menggunakan required field yang sebenarnya bisa diisi otomatis.

Contoh:

User:

> buat tugas mengirim website ke klien hari ini

AI cukup memahami intent.

Field yang tidak disebutkan harus otomatis diisi.

Misalnya:

Priority:

Medium

Status:

Todo

Category:

General

Description:

"" (kosong)

Reminder:

None

Atau nilai default lain yang paling masuk akal.

User akan mengoreksi melalui popup konfirmasi.

Tool tidak boleh gagal hanya karena ada field yang kosong.

---

# 5. Tool Adapter Layer

Jika format output model berbeda dengan schema tool,

JANGAN memaksa model mengikuti schema.

Buat Tool Adapter.

Adapter bertugas:

* rename field
* remove invalid field
* convert enum
* convert date
* fill missing value
* sanitize output

Baru setelah itu dikirim ke tool.

---

# 6. Universal AI Action

Semua modul harus menggunakan flow yang sama.

Task

Finance

Projects

Goals

Diary

Notes

CMS

Journey

Achievement

Posts

Gallery

Blog

Semuanya menggunakan:

Natural Language

↓

Draft Object

↓

Popup

↓

Confirmation

↓

Save

Tidak boleh ada modul yang memiliki flow berbeda.

---

# 7. Popup Global

Popup tidak boleh membutuhkan perpindahan halaman.

Popup harus dapat muncul dari:

Dashboard

Projects

Finance

CMS

AI Page

Floating AI Chat

Halaman mana pun.

Gunakan Global Modal Manager jika diperlukan.

---

# 8. Conversation Persistence

Saat ini:

✔ Judul tersimpan.

❌ Isi chat hilang.

Audit:

* save messages
* restore messages
* hydration
* serialization
* deserialization
* pagination
* loader
* cache
* optimistic update

Ketika reload,

Conversation harus identik dengan sebelum reload.

---

# 9. Floating Chat

Floating Chat:

selalu membuat conversation baru.

Halaman AI:

bisa membuka conversation lama.

Tetapi engine tetap sama.

History tetap sama.

---

# 10. Markdown Rendering

Render markdown sepenuhnya.

Support:

* Heading
* Bold
* Italic
* Table
* Link
* Code
* Quote
* Checklist
* Ordered List
* Unordered List

Jangan tampilkan karakter markdown mentah.

---

# 11. Interactive Response

Jika AI menampilkan data dari database,

jadikan clickable.

Task

Project

Goal

Post

Diary

Achievement

Finance

Timeline

Klik membuka detail terkait.

---

# 12. Llama Model

Pastikan model default:

```
llama-3.1-8b-instant
```

Audit seluruh kompatibilitas:

* AI SDK
* Streaming
* Tool Calling
* Structured Output
* Server Actions
* Response Parsing

Pastikan seluruh fitur tetap berjalan setelah migrasi.

---

# 13. Verification & Regression Testing

Sebelum implementasi dinyatakan selesai, lakukan pengujian end-to-end terhadap seluruh skenario berikut.

## Conversation

* Chat baru
* Chat lama
* Reload
* Pindah halaman
* Streaming
* History

Semuanya harus lolos.

---

## Tool Calling

Uji minimal seluruh perintah berikut:

* Buat tugas
* Update tugas
* Hapus tugas
* Buat proyek
* Update proyek
* Buat goal
* Update goal
* Catat transaksi
* Buat jurnal
* Buat note
* Buat artikel
* Buat thread
* Buat image post
* Buat achievement
* Update timeline

Seluruhnya harus berhasil menggunakan bahasa natural.

Tidak boleh membutuhkan format tertentu.

---

## Edge Case

Uji juga:

* User hanya mengetik:
  "buat tugas"

* User mengetik:
  "ingatkan saya"

* User mengetik:
  "buat artikel"

* User mengetik:
  "buat project"

* User mengetik:
  "catat"

AI harus tetap mampu membuat draft dengan parameter default.

Tidak boleh menghasilkan error schema.

---

# DEFINITION OF DONE

Implementasi hanya dianggap selesai jika:

✅ Tidak ada lagi error:

* tool call validation failed
* parameters did not match schema
* additionalProperties
* missing required field
* invalid_request_error
* failed to call function

✅ Semua tool berhasil dipanggil menggunakan bahasa natural.

✅ Parameter yang kurang otomatis diisi oleh sistem.

✅ Popup konfirmasi muncul otomatis.

✅ Isi percakapan benar-benar tersimpan dan kembali setelah reload.

✅ Floating AI dan halaman AI bekerja konsisten.

✅ Markdown dirender dengan benar.

✅ Llama-3.1-8b-instant berjalan stabil.

✅ Tidak ada regresi terhadap fitur dashboard lain.

**Jangan menyatakan implementasi selesai sebelum seluruh checklist di atas benar-benar lolos melalui pengujian end-to-end. Jika menemukan bahwa akar masalah berada pada desain arsitektur saat ini, lakukan refactor secukupnya untuk mencapai kestabilan, namun tetap menjaga kompatibilitas dengan sistem, database, dan seluruh modul yang sudah ada.**
