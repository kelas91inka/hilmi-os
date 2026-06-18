---
trigger: always_on
---

# Hilmi OS Global Rules

## Documentation First

Always read project documentation before making changes.

Priority Order:

1. DECISIONS.md
2. MASTER_PLAN.md
3. PROJECT.md
4. DATABASE.md
5. ARCHITECTURE.md
6. AI_SYSTEM.md
7. UI_UX.md
8. TASKLIST.md
9. IMPLEMENTATION_RULES.md
10. OWNER_PROFILE.md

Documentation is the source of truth.

---

## Development Rules

- Follow feature-based architecture.
- Use TypeScript only.
- Strict mode enabled.
- No JavaScript files.
- Use Next.js App Router.
- Use Supabase.
- Use Cloudinary for media.
- Use shadcn/ui.
- Use TailwindCSS.

---

## Authentication Rules

Hilmi OS is a Single Owner System.

- No Sign Up
- No Registration
- No Multi User Support

Authentication:

Google Login + Email Whitelist

Only owner email can access dashboard.

---

## Database Rules

- Follow DATABASE.md.
- Do not create tables outside documentation.
- Do not modify schema without approval.
- Use UUID primary keys.
- Use RLS on all private tables.

---

## UI Rules

Primary Language: Bahasa Indonesia.

Dashboard:
- Indonesian first.

Public Website:
- Indonesian first.

Mobile first.

Premium minimal design.

Fast and lightweight.

---

## AI Rules

Do not invent features.

Do not modify architecture.

Do not skip phases.

Always explain plan before coding.

Always generate report after completing a phase.