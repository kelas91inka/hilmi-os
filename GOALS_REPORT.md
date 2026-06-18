# GOALS_REPORT.md

# Goals Module Audit & Improvement Report

## Executive Summary

The goals module was reviewed against the Hilmi OS vision defined in MASTER_PLAN.md, PROJECT.md, ARCHITECTURE.md, UI_UX.md, IMPLEMENTATION_RULES.md, DATABASE.md, and DECISIONS.md.

Several critical and high-priority weaknesses were identified and addressed. All Critical and High improvements have been implemented.

---

## Identified Weaknesses & Priority

### Critical

| ID | Category | Weakness | Status |
|----|----------|----------|--------|
| C-01 | Feature | Quick Capture did not support Goal creation (PROJECT.md mandates Goal as a Quick Capture type) | **Fixed** |
| C-02 | Language | UI labels inconsistent — mixed English/Indonesian (IMPLEMENTATION_RULES Rule 5: primary language is Bahasa Indonesia) | **Fixed** |

### High

| ID | Category | Weakness | Status |
|----|----------|----------|--------|
| H-01 | UX | No type filtering (mingguan/bulanan/tahunan/lifetime) on goals list page | **Fixed** |
| H-02 | UX | No sorting options (progress, date, newest) | **Fixed** |
| H-03 | Feature | No archived goals section — archived goals were invisible | **Fixed** |
| H-04 | Feature | Goal analytics limited — no average progress, no type breakdown | **Fixed** |
| H-05 | UX | Goal detail page progress text only counted milestones, ignored linked tasks | **Fixed** |
| H-06 | UX | Goal detail page status/type badges used English raw values | **Fixed** |

### Medium (Not Implemented — Future Iteration)

| ID | Category | Weakness | Recommendation |
|----|----------|----------|----------------|
| M-01 | Integration | No activity logging on goal CRUD (Rule 23) | Add activity_log entries in goal service |
| M-02 | Integration | No notifications for approaching target dates (Rule: Notifications) | Add notification service for goals nearing deadline |
| M-03 | Feature | TASKLIST.md mentions "Goal Analytics" and "Goal Dashboard" | Build dedicated analytics view with charts |
| M-04 | Integration | Goal creation from task form not possible (only reverse) | Allow setting goal_id on task create/edit form |

### Low (Not Implemented — Out of Scope for Now)

| ID | Category | Weakness |
|----|----------|----------|
| L-01 | Architecture | goalService.recalculateGoalProgress uses dynamic import for taskRepository — minor coupling concern |
| L-02 | Feature | No related projects widget on goal detail (requires goal→project junction or inference through tasks) |
| L-03 | UX | No calendar/timeline view for goals across time horizons |

---

## Changes Implemented

### 1. Quick Capture — Goal Support Added

**File:** `src/features/dashboard/components/QuickCaptureModal.tsx`

- Added `goal` as a third capture mode alongside `task` and `note`
- Goal tab with Target icon
- Goal-specific fields: goal type selector (mingguan/bulanan/tahunan/lifetime) and optional target date
- Uses `createGoalAction` from goals feature
- All labels in Bahasa Indonesia

**Impact:** Users can now create goals in under 3 seconds from anywhere in the dashboard, fulfilling the PROJECT.md Quick Capture requirement.

---

### 2. Goals List Page — Complete Redesign

**Files:**
- `src/app/portal/goals/page.tsx` (simplified to server component)
- `src/features/goals/components/GoalsClient.tsx` (new client component)

**New features:**
- **Type filter tabs:** Semua / Mingguan / Bulanan / Tahunan / Lifetime
- **Type breakdown cards:** Clickable widgets showing count per type, acts as filter shortcut
- **Sort dropdown:** Terbaru, Terlama, Progress ↑, Progress ↓, Target Terdekat
- **4-stat analytics row:** Tujuan Aktif, Selesai, Rata-rata Progress (%), Total
- **Archived section:** Collapsible, shows archived goals (previously hidden)
- **Empty states:** Contextual messages based on active filter
- **All labels in Bahasa Indonesia**

---

### 3. Language Consistency — Full Indonesian Localization

**Files modified:**
- `src/features/goals/components/GoalCard.tsx` — Status labels (Aktif/Selesai/Diarsipkan), "Progres", confirm dialogs, dropdown menu items
- `src/features/goals/components/GoalForm.tsx` — All form labels (Judul Tujuan, Tipe Tujuan, etc.), dialog titles, button text, status dropdown, error alerts
- `src/features/goals/components/MilestoneForm.tsx` — Error alert messages
- `src/features/goals/components/MilestoneList.tsx` — Empty state text
- `src/features/goals/components/GoalsClient.tsx` — All new UI text in Indonesian
- `src/app/portal/goals/page.tsx` — Page metadata in Indonesian
- `src/app/portal/goals/[id]/page.tsx` — Status badges, type badges, section headers, button text

---

### 4. Goal Detail Page — Enhanced

**File:** `src/app/portal/goals/[id]/page.tsx`

- Status and type badges now use Indonesian labels via lookup maps
- Progress summary text now includes both milestone AND linked task completion counts
- Linked tasks badge shows completed/total ratio (e.g., "3/5")
- All section headers and button labels in Bahasa Indonesia

---

## Architecture Compliance

All changes respect the existing architecture:

- **Feature-based structure:** All new code stays within `src/features/goals/` or `src/features/dashboard/`
- **Repository pattern:** No direct Supabase calls from UI
- **Service layer:** Business logic in `goalService`
- **Server Actions:** All mutations through `goal.actions.ts`
- **Validation:** Zod schemas unchanged
- **No unrelated module modifications**

---

## Files Changed Summary

| File | Change Type |
|------|------------|
| `src/features/dashboard/components/QuickCaptureModal.tsx` | Modified — added goal capture mode |
| `src/features/goals/components/GoalsClient.tsx` | Created — client component with filters/sort/analytics |
| `src/app/portal/goals/page.tsx` | Rewritten — simplified server component |
| `src/features/goals/components/GoalCard.tsx` | Modified — Indonesian labels |
| `src/features/goals/components/GoalForm.tsx` | Modified — Indonesian labels |
| `src/features/goals/components/MilestoneForm.tsx` | Modified — Indonesian error messages |
| `src/features/goals/components/MilestoneList.tsx` | Modified — Indonesian empty state |
| `src/app/portal/goals/[id]/page.tsx` | Modified — badges, progress text, labels |

**Total:** 7 files modified, 1 file created. No unrelated modules touched.
