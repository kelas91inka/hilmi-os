# IMPLEMENTATION_PLAN.md

## 1. Architecture Understanding
Hilmi OS is a Personal Operating System serving as a central digital hub for a single user (Muhammad Hilmi Mu'afa). It bridges a public professional portfolio with a private, highly secure command center.
- **Frontend Stack:** Next.js (App Router), TypeScript (strict mode, no JS), TailwindCSS, shadcn/ui, Framer Motion.
- **Backend Stack:** Supabase (PostgreSQL, Auth, Realtime, Storage Metadata, Edge Functions).
- **Media Storage:** Cloudinary (Database only stores URLs).
- **Core Principles:** Feature-based architecture (`src/features/*`), strong separation of concerns (UI → Service → Repository → DB), and heavy reliance on React Server Components.
- **AI Integration:** Acts as an assistant layer, not a foundation. Uses Grok API (extensible to others) to read context from DB, but requires explicit confirmation for destructive actions.
- **Single Owner Authentication Model:** The system is exclusively for the owner. There is **No Sign Up**, **No Registration**, and **No Multi-User Support**. Authentication is strictly **Google Login + Email Whitelist only**.

## 2. Database Understanding
The database architecture is strictly normalized and separated into core domains. Every table must use `UUID` for primary keys and include `created_at` / `updated_at`. Private tables enforce Row Level Security (RLS) and link to `auth.users` via `user_id`.
- **User Domain:** `profiles`, `settings`
- **Productivity Domains:** `tasks` & `task_tags`, `projects`, `project_files`, `project_timeline`, `goals` & `goal_milestones`
- **Knowledge Domains:** `notes`, `note_links`, `note_tags`, `bookmarks`, `reading_items`
- **Reflection & Habit Domains:** `diary_entries`, `diary_links`, `habits`, `habit_logs`
- **Finance & Vault:** `finance_transactions`, `vault_items` (encrypted)
- **CMS & Public Domains:** `blogs`, `blog_categories`, `gallery`, `achievements`, `timeline_events`
- **AI Domain:** `ai_conversations`, `ai_messages`, `ai_memories`

## 3. Feature Breakdown
- **Public Area:** Landing page (includes Current Focus section), Storytelling-driven About page, Project showcase, Blog, Achievements, Timeline, Gallery, and Now Page.
- **Private Dashboard:** Command center displaying today's tasks, active projects/goals, habit progress, recent notes, AI insights, and a Quick Capture modal (< 3 seconds target).
- **Task & Project Management:** Kanban/List views, timeline tracking, priority/status management.
- **Goals & Habits:** Long-term progress tracking, milestones, daily streaks.
- **Knowledge & Diary (Second Brain):** Rich text notes with bidirectional linking, mood-tracked daily reflections.
- **Finance Tracking:** Personal Finance tracking (income, expenses, savings).
- **CMS:** Internal management for all public-facing content without touching the DB manually.
- **Secure Vault:** AES-256 encrypted storage for sensitive data (API keys, secrets). **Encryption must occur before database storage. Database must never receive plaintext vault content.**
- **AI & Voice System:** Context-aware assistant for task generation, note summarization, weekly/monthly reviews, and voice commands.
- **Future Analytics:** Placeholder for Visitor Analytics, Blog Analytics, and Project Analytics.

## 4. Development Phases
The development strictly follows a 16-phase roadmap, ensuring no phase is skipped and stability is reached before proceeding:
- **Phase 0:** Foundation (Next.js, Supabase, Tailwind setup)
- **Phase 1:** Authentication & Core Layout (Google Auth, Whitelist, Dashboard shell)
- **Phase 2:** Database & Core Domain (Schemas, Migrations, RLS)
- **Phase 3:** Task Management
- **Phase 4:** Project Management
- **Phase 5:** Goals System
- **Phase 6:** Second Brain (Notes)
- **Phase 7:** Diary System
- **Phase 8:** Habit Tracking
- **Phase 9:** Public Portfolio (Website frontend)
- **Phase 10:** Internal CMS
- **Phase 11:** Blog System
- **Phase 12:** Search Engine (Global search)
- **Phase 13:** AI Assistant V1 (Chat, Context Builder)
- **Phase 14:** AI Assistant V2 (Reviews, Analysis)
- **Phase 15:** Voice System
- **Phase 16:** Optimization (Performance, PWA, SEO Audits)

## 5. Folder Structure
The application strictly enforces a feature-based architecture to avoid massive tangled folders:
```text
src/
├── app/
│   ├── (public)/     # Public pages (about, projects, blog, etc.)
│   ├── portal/       # Private dashboard & modules
│   ├── api/
│   └── login/
├── components/
│   ├── ui/           # shadcn/ui components
│   └── shared/       # Reusable cross-feature business components
├── features/
│   ├── tasks/        # Feature boundaries (components, actions, services, repositories)
│   ├── projects/
│   ├── goals/
│   └── [feature]/
├── services/         # Cross-feature business logic
├── lib/              # Third-party wrappers (Supabase client, Cloudinary)
├── hooks/            # Global hooks
├── stores/           # Zustand (client state, used minimally)
├── types/            # Global types
├── constants/
├── validators/       # Global Zod schemas
└── providers/        # Context providers (Theme, Auth)
```

## 6. Potential Risks
- **Data Privacy Leaks:** Accidental exposure of private tables through public routes. *Mitigation: Strict Supabase RLS enforcement on all private tables.*
- **Architecture Degradation:** Bypassing the `UI → Service → Repository` flow for rapid development. *Mitigation: Strict adherence to feature-based rules and code reviews.*
- **Performance Bottlenecks:** Heavy dashboard loading times due to multiple concurrent domains. *Mitigation: Extensive use of React Server Components and parallel data fetching.*
- **AI Hallucination & Destructive Actions:** AI deleting or modifying critical records. *Mitigation: AI must ask for explicit user confirmation for destructive actions; AI cannot bypass the DB.*
- **State Management Complexity:** Overusing Zustand. *Mitigation: Rely on Server Components and URL query parameters for state where possible.*

## 7. Recommended Development Order
The recommended order strictly mirrors the `TASKLIST.md` phases:
1. **Foundation & Auth (Phases 0-2):** Build the secure shell and database infrastructure.
2. **Core Productivity (Phases 3-5):** Implement Tasks, Projects, and Goals to make the system usable as a daily driver.
3. **Knowledge & Reflection (Phases 6-8):** Implement Notes (Second Brain), Diary, and Habits.
4. **Public Presence (Phases 9-11):** Build the Portfolio, CMS, and Blog to establish the professional identity.
5. **Advanced Capabilities (Phases 12-15):** Integrate Global Search, AI Assistant, and Voice Commands.
6. **Polish (Phase 16):** PWA, Performance, and Security optimization.

## 8. Estimated Complexity per Module
- **Foundation, Auth & Layout:** Medium (Requires careful middleware and session setup)
- **Database & RLS:** Medium (Critical, but straightforward setup)
- **Task & Project Management:** High (Complex relational logic, drag-and-drop interfaces)
- **Notes / Second Brain:** High (Rich text editing, bidirectional linking, tagging logic)
- **Goals, Diary, Habits, Finance:** Low to Medium (Standard CRUD with progress calculations)
- **Public Portfolio & CMS:** Medium (Focus on premium minimal UI and content management)
- **Global Search:** High (Requires optimized cross-table indexing)
- **AI Assistant & Voice:** Very High (Context extraction, LLM integration, safety guardrails)
- **Vault:** Medium (Requires secure AES-256 encryption implementation on the client/edge)
