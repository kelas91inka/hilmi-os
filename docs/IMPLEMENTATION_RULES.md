# IMPLEMENTATION_RULES.md

# Hilmi OS Development Rules

## Rule 1

Read all documentation before coding.

Mandatory.

---

## Rule 2

Do not invent features.

Only implement features defined in documentation.

---

## Rule 3

Do not modify database structure without updating DATABASE.md.

---

## Rule 4

Do not create new modules outside PROJECT.md scope.

---

## Rule 5

Primary language is Bahasa Indonesia.

Applies to:

- Dashboard
- CMS
- AI Responses
- Forms
- Notifications

---

## Rule 6

TypeScript only.

JavaScript files are not allowed.

---

## Rule 7

Use strict TypeScript mode.

---

## Rule 8

Use feature-based architecture.

Must follow ARCHITECTURE.md.

---

## Rule 9

Never call Supabase directly from UI components.

Required flow:

UI
→ Service
→ Repository
→ Supabase

---

## Rule 10

All forms must use:

- React Hook Form
- Zod Validation

---

## Rule 11

All private tables must use RLS.

No exceptions.

---

## Rule 12

No public registration.

Sign Up prohibited.

---

## Rule 13

Authentication:

Google Login + Email Whitelist.

---

## Rule 14

Cloudinary for media storage.

Never store images in database.

Only URLs.

---

## Rule 15

Use Server Components by default.

Use Client Components only when needed.

---

## Rule 16

Avoid premature optimization.

Build simple first.

---

## Rule 17

AI features must not bypass database.

Database is source of truth.

---

## Rule 18

AI cannot access Vault automatically.

Explicit permission required.

---

## Rule 19

Animations must be lightweight.

No excessive animations.

---

## Rule 20

Every feature must work on:

- Mobile
- Tablet
- Desktop

---

## Rule 21

PWA support is mandatory.

---

## Rule 22

Accessibility is required.

---

## Rule 23

Every major action must create activity logs.

---

## Rule 24

Sensitive data must be encrypted.

---

## Rule 25

No hardcoded secrets.

Use environment variables.

---

## Rule 26

Every new feature must update:

- Documentation
- Types
- Validation

---

## Rule 27

Clean code is mandatory.

---

## Rule 28

If documentation conflicts occur:

Priority Order:

1. DECISIONS.md
2. MASTER_PLAN.md
3. PROJECT.md
4. DATABASE.md
5. ARCHITECTURE.md
6. AI_SYSTEM.md
7. UI_UX.md
8. TASKLIST.md

Higher priority wins.

---

## Final Rule

Documentation is law.

Implementation must follow documentation.