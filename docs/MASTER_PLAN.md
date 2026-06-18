# MASTER_PLAN.md

# Hilmi OS

## Overview

Hilmi OS adalah sebuah Personal Operating System berbasis web yang menggabungkan:

* Personal Portfolio
* Professional Portfolio
* CMS
* Blog Platform
* Project Management
* Goal Management
* Knowledge Management
* Digital Diary
* Habit Tracking
* Finance Tracking
* Personal AI Assistant
* Personal Memory System

Tujuan utama Hilmi OS adalah menjadi pusat seluruh aktivitas digital pemilik sistem.

Hilmi OS bukan sekadar website portofolio.

Hilmi OS adalah sistem yang digunakan setiap hari sebagai daily driver untuk mengelola kehidupan, pembelajaran, proyek, bisnis, dan pengetahuan.

---

# Core Vision

Create a personal operating system that:

* Stores all important knowledge
* Tracks projects and goals
* Manages daily activities
* Generates personal insights using AI
* Acts as a long-term digital memory
* Publishes a professional public portfolio

---

# Product Philosophy

## Daily Driver First

Every feature must be useful in real life.

Features that are rarely used should not be developed.

The system must solve actual daily problems.

---

## Simplicity Over Complexity

Even if the system becomes large internally:

* Navigation must remain simple
* User flows must remain simple
* Adding information must remain fast

The user should never feel overwhelmed.

---

## Mobile First

The application must be designed for mobile usage first.

Desktop experience should be excellent.

Mobile experience is mandatory.

---

## Performance First

Animations should enhance experience.

Animations should never reduce usability.

Target:

* Fast loading
* Smooth interactions
* Minimal waiting

---

## Everything Connected

Data must never exist in isolation.

Projects connect to goals.

Goals connect to tasks.

Tasks connect to notes.

Notes connect to diary entries.

Diary connects to projects.

AI connects to everything.

---

# System Structure

Hilmi OS consists of three major areas:

## Public Area

Accessible to everyone.

Purpose:

* Personal branding
* Portfolio
* Project showcase
* Blog
* Public achievements
* Professional presence

### Public Modules

* Landing Page
* About
* Projects
* Blog
* Gallery
* Timeline
* Achievements
* Contact
* Now Page

---

## Private Area

Accessible only by owner.

Purpose:

* Life management
* Productivity
* Knowledge management
* Personal operations

### Private Modules

* Dashboard
* Tasks
* Projects
* Goals
* Notes
* Knowledge Vault
* Diary
* Habits
* Finance
* Bookmark Manager
* Reading List
* Secure Vault

---

## AI Area

Purpose:

* Personal assistant
* Personal memory
* Data analysis
* Productivity automation

### AI Modules

* AI Chat
* AI Memory
* Voice Commands
* AI Weekly Review
* AI Monthly Review
* AI Annual Report
* AI Coach

---

# Authentication Rules

This application is personal.

Public registration is prohibited.

Requirements:

* No Sign Up page
* No public account creation
* Only approved users may access private areas

Authentication stack:

* Supabase Auth
* Google Login
* Email Whitelist
* MFA Support

---

# Security Rules

Private data must be protected.

Requirements:

* Row Level Security enabled
* Secure sessions
* Audit logs
* Encrypted vault storage
* Access control enforcement

No private data may be exposed publicly.

---

# AI Rules

AI is a feature layer.

AI is not the source of truth.

The database is the source of truth.

AI must:

* Read data
* Analyze data
* Organize data
* Recommend actions

AI must not modify critical information without confirmation.

---

# Single Source of Truth

The following document hierarchy must always be respected:

1. MASTER_PLAN.md
2. DECISIONS.md
3. PROJECT.md
4. DATABASE.md
5. ARCHITECTURE.md
6. AI_SYSTEM.md
7. UI_UX.md
8. TASKLIST.md

If conflicts occur:

MASTER_PLAN.md takes highest priority.

---

# Development Workflow

Before writing code:

1. Read all documentation
2. Create implementation plan
3. Present implementation plan
4. Wait for approval

Do not start coding immediately.

---

# Coding Rules

Requirements:

* TypeScript only
* Strong typing
* Clean architecture
* Reusable components
* Modular structure
* No duplicated business logic

---

# Technology Stack

Frontend:

* Next.js
* TypeScript
* TailwindCSS
* shadcn/ui
* Framer Motion

Backend:

* Supabase

Database:

* PostgreSQL

Storage:

* Cloudinary

Deployment:

* Vercel

PWA:

* Required

AI:

* Grok API
* Future AI Provider Abstraction

---

# Development Phases

## Phase 1

Foundation

* Authentication
* Database
* Dashboard
* Notes
* Tasks
* Projects

---

## Phase 2

Productivity

* Goals
* Diary
* Habits
* Bookmarks
* Reading List

---

## Phase 3

Public Platform

* Portfolio
* Blog
* CMS
* Gallery
* Timeline

---

## Phase 4

AI Layer

* AI Chat
* AI Memory
* Voice Commands
* Reviews
* AI Coach

---

## Phase 5

Optimization

* Analytics
* Search
* Advanced Automation
* Performance Improvements

---

# Long-Term Goal

Hilmi OS should become the central digital system used daily for years.

The system must remain:

* Fast
* Secure
* Maintainable
* Extensible
* AI-ready

Every future feature must support this goal.
