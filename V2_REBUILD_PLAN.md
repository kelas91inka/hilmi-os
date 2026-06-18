# V2 REBUILD PLAN — Hilmi OS
**Version:** 2.0  
**Goal:** Transform the current CRUD scaffold into a true Personal Operating System

---

> [!IMPORTANT]
> This plan is built from the ground findings of `SYSTEM_AUDIT.md`. The objective of V2 is not to add features incrementally — it is to rebuild the user experience from the OS perspective first, then wire real data into it.
>
> **Core Principle:** Every screen must answer: "Does this help me manage my life better today?"

---

## Philosophy for V2

The current V1 is a **collection of isolated CRUD screens** with a shared sidebar. A true Personal Operating System must feel like:

1. **Everything is connected** — Tasks know their Goals. Goals know their Projects. The Dashboard reflects real life.
2. **Capture is frictionless** — Adding anything takes < 3 seconds, from any screen.
3. **AI is the nervous system** — Not a chatbot in a corner. The OS intelligence layer.
4. **Public presence reflects private reality** — Portfolio shows real, live data from the private system.

---

## V2 Guiding Rules

- No more `alert()` or `confirm()` — use proper modal dialogs everywhere.
- No more hardcoded `bg-slate-` colors — all theming through CSS variables.
- No more English strings in Indonesian UI — full language consistency.
- No more dead schema — every DB table must have a living UI.
- No more `@ts-nocheck` — strict TypeScript throughout.
- All new features need loading skeletons, not spinners.
- All delete/destructive actions need a proper confirmation dialog.

---

## PHASE 1 — OS Foundation Rebuild
**Goal:** Make it feel like an OS, not a website.
**Duration Target:** Sprint 1

### 1.1 Global UX Infrastructure
Build the core UX primitives that all other features depend on.

**Quick Capture Modal**
- Global floating button (bottom-right, visible from every page)
- Keyboard shortcut: `Ctrl + N`
- Capture types: Task, Note, Diary Entry, Goal
- Zero navigation required — opens as overlay from any screen

**Sidebar Redesign**
- Collapsible to icon-only mode (saves space, especially mobile)
- Maximum 7 navigation items (consolidate Bookmarks + Reading into "Library")
- User avatar + name in sidebar header (from `profiles` table)
- Keyboard navigation support

**Notification System**
- Toast notifications (replace all `alert()` calls)
- Non-blocking, auto-dismiss
- Action confirmations via modal dialog (replace all `confirm()` calls)

**Dark Mode Audit**
- Audit and fix all hardcoded color classes (`bg-slate-`, `text-slate-`, etc.)
- Replace with Tailwind CSS variable-based tokens

**Skeleton Loading**
- Create reusable skeleton components
- Apply to every page that fetches data

**Language Consistency Pass**
- Audit every string in the UI
- Ensure all user-facing text is in Bahasa Indonesia
- English only for: code labels, external service names

---

### 1.2 Dashboard — Personal Command Center
Rebuild from scratch as a real-time OS dashboard.

**Sections to build:**
1. **Morning Greeting** — "Selamat pagi, Hilmi. Ini ringkasan harimu."
2. **Today at a Glance** — 4 stat cards (Tasks due today, Overdue tasks, Active goals, Habits completed today)
3. **Today's Tasks** — Live list from DB, filtered to today's due date + in-progress
4. **Active Projects** — 3 cards showing current active projects with progress
5. **Goal Progress** — Active goals with progress bars
6. **Habit Streaks** — Today's habit completion grid (mini version)
7. **Quick Capture** — Inline quick add (embedded, not just the floating button)
8. **AI Daily Briefing** — Auto-generated summary by AI: "Kamu punya 3 tugas jatuh tempo hari ini..."

All data is fetched server-side. Dashboard must load fully in < 1 second.

---

### 1.3 Authentication Hardening

**Email Whitelist**
- Implement whitelist check in `/auth/callback` route
- Reject users whose email is not in an approved list (configurable via env variable `ALLOWED_EMAIL`)
- Show clear error message: "Akses ditolak. Hubungi pemilik sistem."

---

## PHASE 2 — Private Modules Full Completion
**Goal:** All private modules fully functional, connected, and data-alive.
**Duration Target:** Sprint 2-3

### 2.1 Tasks — Full Task Management
- **List/Board/Calendar toggle** — three view modes
- **Filter system** — by status, priority, project, goal, tag, due date
- **Drag-and-drop Kanban** (replace static column grouping)
- **Goal linkage** in the task form (dropdown to select goal)
- **Overdue badge** on tasks past due date
- **Bulk operations** — select multiple, bulk status change, bulk delete
- Replace all `confirm()` with proper delete confirmation dialog

### 2.2 Projects — Full Project Management
- **Project detail page rebuild** per UI_UX.md sections (Problem, Solution, Technologies, Timeline, Results)
- **Timeline/milestones** — surface `project_timeline` table in project detail
- **Linked tasks** in project detail — show all tasks belonging to the project
- **Cloudinary cover image picker** — upload and select via Cloudinary widget
- **Project progress** — auto-calculate from linked task completion percentage

### 2.3 Goals — Progress System
- **Auto-calculate progress** from linked milestone completion (not manual input)
- **Linked tasks** shown in goal detail page
- **Goal filtering** by type (mingguan/bulanan/tahunan/lifetime)
- **Progress history** — basic chart of progress over time

### 2.4 Notes — Second Brain Activation
- **Note tags** — `note_tags` table now surfaced with tag input and tag filtering
- **Note linking** — `note_links` table surfaced with "Link to..." functionality
- **Full-text search** within notes
- **Favorites filter** on note list
- Knowledge graph view (stretch goal: visual node graph of linked notes)

### 2.5 Diary — Writing Experience Polish
- **Language fix** — all strings in Indonesian
- **Mood trend chart** — calendar heat map of mood over 30 days
- **Quick Diary entry** from Dashboard Quick Capture
- **Diary links** — surface `diary_links` table

### 2.6 Habits — Analytics Layer
- **Weekly/Monthly view toggle** (not just 7 days)
- **Completion rate analytics** — bar chart per habit over the month
- **`target_frequency` enforcement** — show "Daily" / "Weekly" badge and count correctly

### 2.7 Finance — Visualization
- **Spending breakdown chart** — pie or donut chart by category
- **Monthly trend line chart** — income vs expense over 6 months
- **Budget targets** — allow setting a monthly budget per category
- Language fix: translate all English labels

### 2.8 Blog CMS — Full CMS
- **Cloudinary image upload** — replace URL input with image uploader
- **Blog categories** — surface `blog_categories` table with category selection
- **Blog tags** — surface `blog_tags` table with tag input
- **SEO meta fields** — per-post OG title, OG description, OG image
- **Slug auto-generation** from title
- **Reading time estimate** displayed in editor

### 2.9 Dead Feature Activation
The following features are in the DB schema but have zero UI:
- **Vault** — encrypted notes/secrets manager with PIN reveal
- **Bookmarks** — URL bookmark manager (route exists, empty)
- **Reading List** — books/articles tracker (route exists, empty)
- All three can be basic CRUD for V2

---

## PHASE 3 — Public Portfolio Rebuild
**Goal:** Public-facing portfolio that reflects real, live OS data.
**Duration Target:** Sprint 4

### 3.1 Navigation Bar
- Build persistent public navigation: Beranda / Tentang / Proyek / Blog / Pencapaian / Timeline / Kontak
- Mobile hamburger menu

### 3.2 Landing Page Rebuild
- **Hero**: Name, tagline, dynamic "Current Focus" from CMS
- **Featured Projects**: Live 6 projects from DB where `featured = true`
- **Featured Articles**: Latest 3 published blog posts
- **Achievement Highlight**: From `achievements` table
- **Timeline Preview**: From `timeline_events` table
- **Contact CTA**: Simple links (Email, LinkedIn, GitHub)

### 3.3 About Page
- Storytelling structure: Siapa Saya → Perjalanan → Pengalaman → Keahlian → Visi
- Pull dynamic data from `profiles` table for base info

### 3.4 Projects Public Page
- Card grid connected to DB (`visibility = 'public'`)
- Filter by status/category
- Individual project detail page with all sections

### 3.5 Blog Public Page
- Blog list with search, category filter, tag filter
- Blog detail with: large typography, reading progress bar, reading time, table of contents

### 3.6 Achievements Page
- Timeline + Cards layout
- Data from `achievements` table

### 3.7 Timeline Page
- Visual chronological timeline
- Data from `timeline_events` table

### 3.8 Gallery Page
- Grid layout from `gallery` table with Cloudinary images

### 3.9 Contact Page
- Simple links: Email, LinkedIn, GitHub, Instagram
- No form needed

---

## PHASE 4 — AI as Operating System Layer
**Goal:** AI stops being a chatbot. It becomes the intelligence of the OS.
**Duration Target:** Sprint 5

### 4.1 Global AI Access
- Remove AI from isolated `/portal/ai` only access
- **Floating AI panel** accessible from any portal page (slide-in from right or bottom sheet on mobile)
- AI context-aware based on current page (on Tasks page → AI knows current task context)

### 4.2 Voice Command Flow (per UI_UX.md)
Rebuild voice to proper UX flow:
1. **Tap** microphone
2. **Speak** command
3. **Process** — show transcribed text
4. **Preview** — show what AI understood and what action it will take ("Saya akan membuat task: Review laporan keuangan, prioritas tinggi, deadline Jumat")
5. **Confirm** — user says "ya" or taps confirm button
6. **Execute** — action runs

### 4.3 AI Dashboard Briefing
- Every morning, auto-generate a briefing card:
  - Tasks due today
  - Overdue items
  - Goal progress summary
  - Habit streak status
  - AI recommendation ("Fokus pada X karena deadline terdekat")

### 4.4 AI Weekly Review
- Every Sunday, generate a weekly review:
  - Tasks completed vs planned
  - Habits completion rate
  - Goal progress delta
  - Finance summary
  - Mood trend from diary
  - Recommendations for next week

### 4.5 AI Memory Enhancement
- AI reads from all modules: tasks, goals, projects, diary, habits, finance, notes
- AI can update existing tasks (not just create new ones)
- AI can update goal progress
- AI can log a habit completion

### 4.6 AI Context Cards
- When AI references a task/project/goal in chat, display it as a clickable card — not just text

---

## PHASE 5 — Polish, Performance & PWA
**Goal:** Production-ready. Feels premium. Works offline.
**Duration Target:** Sprint 6

### 5.1 Performance
- Implement `Suspense` + skeleton loading on all data-fetching pages
- Image optimization via Next.js `<Image>` with Cloudinary integration
- Route prefetching

### 5.2 Animations
- Implement Framer Motion (already installed, never used):
  - Page transitions
  - Card entrance animations
  - Modal open/close
  - Dashboard widget load animations
- Keep animations subtle and purposeful per UI_UX.md

### 5.3 PWA — App-Like Experience
- Offline shell (cache layout and navigation)
- Install prompt handling
- Mobile navigation (bottom tab bar for mobile portal view)
- Push notification support (for reminders via browser push)

### 5.4 Cloudinary Full Integration
- Remove `cloudinary_demo.js` from project root
- Remove duplicate `cloudinary` package (keep `next-cloudinary`)
- Implement `CldUploadWidget` for all image fields: project cover, blog cover, gallery items, profile avatar

### 5.5 Clean Technical Debt
- Remove all `@ts-nocheck` and `eslint-disable` from production code
- Remove hardcoded API key fallback from `route.ts`
- Activate strict TypeScript where disabled
- Remove Framer Motion unused import warnings

---

## Execution Principles

> [!IMPORTANT]
> **Rule 1 — Approval First:** Present a phase plan before coding. No unsolicited implementation.
>
> **Rule 2 — One Phase at a Time:** Complete and ship each phase before starting the next.
>
> **Rule 3 — Document Changes:** Update `SYSTEM_AUDIT.md` completion percentages after each phase.
>
> **Rule 4 — Test After Each Phase:** Build succeeds, no TypeScript errors, no broken routes.
>
> **Rule 5 — Usable > Perfect:** If a phase is 90% complete and fully usable, ship it and return for the remaining 10% later.

---

## V2 Success Criteria

The rebuild is complete when:

- [ ] Owner opens Dashboard and immediately sees their real life status
- [ ] Owner can add a task in < 3 seconds from any screen
- [ ] All modules are connected (task links to goal links to project)
- [ ] AI can be asked anything about the owner's data from anywhere
- [ ] Public portfolio reflects live data from the private system
- [ ] Vault, Bookmarks, Reading List are all functional
- [ ] Zero `alert()` / `confirm()` calls remain
- [ ] Dark mode works perfectly across all screens
- [ ] All UI is in Bahasa Indonesia (consistent)
- [ ] Build passes with zero TypeScript errors
- [ ] Email whitelist is enforced on login
