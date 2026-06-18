# ARCHITECTURE.md

# Hilmi OS System Architecture

## Overview

Hilmi OS menggunakan arsitektur modern yang berfokus pada:

* Scalability
* Maintainability
* Performance
* AI Compatibility
* Long-Term Development

Target umur sistem:

Minimum 5 tahun tanpa perlu redesign besar.

---

# Technology Stack

## Frontend

Framework:

* Next.js

Language:

* TypeScript

Styling:

* TailwindCSS

UI Components:

* shadcn/ui

Animation:

* Framer Motion

Icons:

* Lucide Icons

Forms:

* React Hook Form

Validation:

* Zod

---

## Backend

Platform:

* Supabase

Services:

* PostgreSQL
* Authentication
* Realtime
* Storage Metadata
* Edge Functions

---

## Media Storage

Provider:

* Cloudinary

Used For:

* Blog Images
* Gallery
* Project Screenshots
* Public Media

Database stores URL only.

---

## AI Layer

Primary Provider:

* Grok API

Future Providers:

* OpenAI
* Gemini
* Claude

Architecture must support provider switching.

---

## Deployment

Hosting:

* Vercel

Requirements:

* PWA
* Edge Optimized
* Mobile Friendly

---

# Project Structure

```text
src/
│
├── app/
│
├── components/
│
├── features/
│
├── services/
│
├── lib/
│
├── hooks/
│
├── stores/
│
├── types/
│
├── constants/
│
├── validators/
│
└── providers/
```

---

# App Router Structure

```text
app/
│
├── (public)/
│
│   ├── page.tsx
│   ├── about
│   ├── projects
│   ├── blog
│   ├── gallery
│   ├── achievements
│   └── timeline
│
├── portal/
│
│   ├── dashboard
│   ├── tasks
│   ├── projects
│   ├── goals
│   ├── notes
│   ├── diary
│   ├── habits
│   ├── finance
│   ├── bookmarks
│   ├── reading
│   ├── vault
│   ├── ai
│   └── settings
│
├── api/
│
└── login/
```

---

# Route Principles

Public Routes:

Accessible without login.

Private Routes:

Require authentication.

Protected using middleware.

---

# Feature-Based Architecture

Business logic must be organized by feature.

Example:

```text
features/
│
├── tasks/
├── projects/
├── goals/
├── notes/
├── diary/
├── habits/
├── finance/
├── ai/
├── blog/
└── cms/
```

---

# Example Feature Structure

```text
tasks/
│
├── components/
├── actions/
├── services/
├── validators/
├── hooks/
├── types/
└── utils/
```

---

# Why Feature-Based

Avoids:

* Massive folders
* Mixed responsibilities
* Unmaintainable code

Supports:

* AI Coding Agents
* Team expansion
* Faster development

---

# Component Architecture

Components divided into:

## UI Components

Reusable visual components.

Example:

```text
components/ui
```

---

## Shared Components

Reusable business components.

Example:

```text
components/shared
```

---

## Feature Components

Specific to a feature.

Example:

```text
features/tasks/components
```

---

# State Management

Primary:

React Server Components

Secondary:

Server Actions

Client State:

Zustand

Use Zustand only when necessary.

Avoid global state explosion.

---

# Data Fetching

Preferred Order:

1. Server Components
2. Server Actions
3. Client Fetching

Do not fetch data on client unless necessary.

---

# Database Layer

Never call Supabase directly from UI.

Required flow:

```text
UI
↓
Feature Service
↓
Repository
↓
Supabase
```

---

# Repository Pattern

Example:

```text
features/tasks/repositories
```

Contains:

* createTask
* updateTask
* deleteTask
* getTasks

---

# Service Layer

Contains:

Business Logic

Example:

```text
Task completed
↓
Update task
↓
Update goal progress
↓
Create activity log
↓
Notify AI memory
```

This belongs in services.

Not in UI.

---

# Validation Layer

All inputs validated using Zod.

Validation required:

* Forms
* API Requests
* Server Actions

Never trust client input.

---

# Authentication Architecture

Provider:

Supabase Auth

Method:

Google Login

---

# Authorization Flow

```text
Login
↓
Get User
↓
Check Whitelist
↓
Allow Access
```

---

# Middleware

Responsibilities:

* Session Validation
* Protected Routes
* Redirect Handling

---

# CMS Architecture

CMS must manage:

* Blog
* Projects
* Timeline
* Gallery
* Achievements

Single dashboard.

No separate CMS application.

---

# Search Architecture

Global Search.

Sources:

* Tasks
* Projects
* Goals
* Notes
* Diary
* Blogs

Future:

Semantic Search

Vector Search

---

# AI Architecture

AI separated into layers.

```text
AI Provider
↓
AI Service
↓
Memory Layer
↓
Application
```

Never call AI provider directly from UI.

---

# AI Provider Abstraction

Required Interface:

```typescript
generateResponse()

summarize()

extractTasks()

extractGoals()
```

Allows provider replacement.

---

# AI Memory Architecture

Sources:

* Tasks
* Goals
* Notes
* Diary
* Projects
* Blog

Flow:

```text
Data Created
↓
Memory Processor
↓
AI Memory Table
↓
Retrieval
```

---

# Voice Architecture

Voice Input

↓

Speech To Text

↓

AI Command Parser

↓

Action Generator

↓

Database Update

---

# Notification Architecture

Sources:

* Tasks
* Goals
* Habits
* AI Reviews

Stored in notifications table.

---

# Activity Tracking Architecture

Every significant action generates:

```text
activity_log
```

Examples:

* Task Created
* Goal Completed
* Note Updated

---

# Secure Vault Architecture

Data stored encrypted.

Requirements:

* AES-256
* Never store plaintext
* Never expose to AI without explicit permission

---

# Cloudinary Architecture

Upload Flow:

```text
Client
↓
Upload Service
↓
Cloudinary
↓
URL Returned
↓
Save URL to Database
```

Never store files in database.

---

# PWA Architecture

Requirements:

* Installable
* Offline Shell
* Fast Loading
* Mobile Optimized

---

# Error Handling

Required:

* User Friendly Errors
* Logging
* Retry Mechanism

Never expose raw errors.

---

# Monitoring

Future Support:

* Analytics
* Error Tracking
* Performance Metrics

---

# Coding Standards

Requirements:

* Strict TypeScript
* ESLint
* Prettier
* Consistent Naming

---

# Naming Conventions

Components:

```text
TaskCard.tsx
```

Hooks:

```text
useTasks.ts
```

Services:

```text
taskService.ts
```

Repositories:

```text
taskRepository.ts
```

Types:

```text
task.types.ts
```

---

# Long-Term Rule

Every new feature must:

* Follow architecture
* Follow feature structure
* Follow service layer
* Follow validation rules

No shortcuts allowed.

Architecture consistency is more important than development speed.
