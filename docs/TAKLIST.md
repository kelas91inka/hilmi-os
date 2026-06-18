# TASKLIST.md

# Hilmi OS Development Roadmap

## Overview

Dokumen ini mendefinisikan urutan pembangunan Hilmi OS.

Rules:

- Tidak boleh melompati phase.
- Setiap phase harus stabil sebelum lanjut.
- Fokus pada usable product terlebih dahulu.
- AI dan Voice bukan prioritas awal.

---

# PHASE 0

## Foundation

Goal:

Mempersiapkan pondasi proyek.

Tasks:

- Setup Next.js
- Setup TypeScript
- Setup TailwindCSS
- Setup shadcn/ui
- Setup Supabase
- Setup Cloudinary
- Setup Environment Variables
- Setup ESLint
- Setup Prettier
- Setup Husky
- Setup PWA Foundation
- Setup Folder Architecture

Exit Criteria:

- Project berjalan
- Build sukses
- Deployment sukses

Priority:

Critical

---

# PHASE 1

## Authentication & Core Layout

Goal:

Membuat sistem login dan struktur aplikasi.

Tasks:

- Google Authentication
- Email Whitelist
- Route Protection
- Middleware
- Session Management
- Dashboard Layout
- Sidebar
- Top Navigation
- User Settings
- Theme Switcher

Exit Criteria:

- Login berhasil
- Route aman
- Dashboard dapat diakses

Priority:

Critical

---

# PHASE 2

## Database & Core Domain

Goal:

Membangun seluruh schema database.

Tasks:

- Profiles
- Settings
- Tasks
- Projects
- Goals
- Notes
- Diary
- Habits
- Bookmarks
- Reading List
- Vault
- Activity Logs
- Notifications

Exit Criteria:

- Seluruh tabel tersedia
- Migration berhasil
- RLS aktif

Priority:

Critical

---

# PHASE 3

## Task Management

Goal:

Task manager usable.

Tasks:

- Create Task
- Update Task
- Delete Task
- Archive Task
- Status Management
- Priority Management
- Due Date
- Tags
- Task List View
- Task Board View

Exit Criteria:

- Task Manager usable harian

Priority:

Critical

---

# PHASE 4

## Project Management

Goal:

Project tracking.

Tasks:

- Create Project
- Edit Project
- Delete Project
- Project Timeline
- Project Files
- Project Notes
- Project Status

Exit Criteria:

- Project dapat dikelola penuh

Priority:

Critical

---

# PHASE 5

## Goals System

Goal:

Track progress jangka panjang.

Tasks:

- Create Goal
- Milestones
- Progress Tracking
- Goal Dashboard
- Goal Analytics

Exit Criteria:

- Goal system usable

Priority:

High

---

# PHASE 6

## Second Brain

Goal:

Knowledge management.

Tasks:

- Notes
- Note Tags
- Note Links
- Search Notes
- Rich Text Editor
- Favorites

Exit Criteria:

- Notes usable sebagai second brain

Priority:

High

---

# PHASE 7

## Diary System

Goal:

Daily reflection.

Tasks:

- Create Entry
- Mood Tracking
- Entry Linking
- Calendar View

Exit Criteria:

- Diary usable

Priority:

High

---

# PHASE 8

## Habit Tracking

Goal:

Habit monitoring.

Tasks:

- Create Habit
- Daily Tracking
- Streak Tracking
- Progress Statistics

Exit Criteria:

- Habit tracker usable

Priority:

Medium

---

# PHASE 9

## Public Portfolio

Goal:

Membangun personal branding website.

Tasks:

- Homepage
- About
- Projects
- Achievements
- Timeline
- Contact

Exit Criteria:

- Public website live

Priority:

High

---

# PHASE 10

## CMS

Goal:

Kelola public content dari dashboard.

Tasks:

- Blog CMS
- Project CMS
- Achievement CMS
- Timeline CMS
- Gallery CMS

Exit Criteria:

- Tidak perlu edit database manual

Priority:

High

---

# PHASE 11

## Blog System

Goal:

Knowledge publishing.

Tasks:

- Blog List
- Blog Detail
- Categories
- Tags
- Search
- SEO

Exit Criteria:

- Blog siap digunakan

Priority:

High

---

# PHASE 12

## Search Engine

Goal:

Global Search.

Sources:

- Tasks
- Goals
- Projects
- Notes
- Diary
- Blog

Exit Criteria:

- Search lintas sistem berjalan

Priority:

High

---

# PHASE 13

## AI Assistant V1

Goal:

AI assistant dasar.

Tasks:

- AI Chat
- AI Search
- AI Context Builder
- AI Memory Foundation

Exit Criteria:

- AI memahami konteks dasar

Priority:

Medium

---

# PHASE 14

## AI Assistant V2

Goal:

AI productivity assistant.

Tasks:

- Weekly Review
- Monthly Review
- Goal Analysis
- Project Analysis
- Learning Analysis

Exit Criteria:

- AI memberikan insight

Priority:

Medium

---

# PHASE 15

## Voice System

Goal:

Voice command.

Tasks:

- Speech To Text
- Command Parser
- Action Generator
- Confirmation Flow

Exit Criteria:

- Voice command usable

Priority:

Low

---

# PHASE 16

## Optimization

Goal:

Production ready.

Tasks:

- Performance Audit
- Lighthouse Audit
- Accessibility Audit
- Security Audit
- SEO Audit

Exit Criteria:

- Production Ready

Priority:

Critical

---

# Final Rule

Usable > Perfect

Ship first.
Improve continuously.