# Hilmi OS Premium Redesign

## Design Analysis: Reference vs Current

The reference (hilmi-os-google-aistudio) uses a **dark-first premium aesthetic** with these defining characteristics:
- **Colors**: `#0A0A0B` background, `#161618` cards, `#2C2C2E` borders, **indigo accent** (`indigo-400/500/600`)
- **Typography**: Plus Jakarta Sans (display/headings), Inter (body), JetBrains Mono (monospace)
- **Effects**: `glow-card` class with deep shadows and inset highlights
- **Shapes**: Generous rounding (`rounded-2xl`, `rounded-3xl`)
- **Layout**: Icon rail sidebar (w-24) with tooltips, status-rich header
- **Animations**: Framer Motion (`motion/react`) for transitions
- **Patterns**: Module header bars, filter pill buttons, stat cards with monospace numbers, gradient CTA buttons

The current app uses a neutral gray palette, standard sidebar (w-64), basic header, and inconsistent rounding. This plan bridges the gap while preserving the Next.js architecture and server/client component patterns.

---

## Task 0: Design Migration Validation -- Critical Audit of the Reference

Before implementing any redesign, critically audit the reference project (`hilmi-os-google-aistudio`). Do NOT blindly clone it. The goal is to create a **superior** version that inherits strengths while correcting weaknesses.

### Audit Checklist

For each area below, identify problems in the reference and document what should or should NOT be adopted:

**1. UX Problems**
- The reference is a single-file 3791-line monolith -- this is an anti-pattern. Our Next.js modular architecture must be preserved.
- No form validation (no Zod, no React Hook Form). Our existing validation pipeline must NOT be replaced.
- All state stored in localStorage with no persistence layer -- our Supabase backend is far superior and must remain.
- No server-side rendering or data fetching -- our Server Components pattern is better for performance.

**2. Layout Problems**
- Content area has no `max-width` constraint on module pages (only dashboard uses `max-w-7xl`). Module pages use `max-w-4xl` which is too narrow for data-rich views like finance tables and project grids. **Adopt**: `max-w-5xl` as a middle ground for module pages, `max-w-7xl` for dashboard.
- The 12-column grid on dashboard is overly complex for the widget count. **Adopt**: Simpler 3-column grid with `col-span` assignments.

**3. Navigation Issues**
- Icon rail sidebar (w-24) has NO text labels visible by default -- only tooltips on hover. This hurts discoverability for new users and requires hovering to know what each icon does. **Improve**: Add a subtle text label below each icon (compact style), or make the rail expandable to show labels on click/toggle.
- No keyboard navigation support for the sidebar. **Must add**: Arrow key navigation, Enter to select.
- Mobile nav is a full-width dropdown overlay that covers content. **Improve**: Use a bottom sheet / slide-up panel pattern that is more thumb-friendly.

**4. Sidebar Issues**
- The "H" logo is just a letter in a box -- no branding value. **Improve**: Use a proper logo/icon that represents Hilmi OS identity.
- No section grouping (all nav items in a flat list). **Improve**: Group related items (e.g., Productivity: Tasks/Projects/Goals, Knowledge: Notes/Diary, Tracking: Habits/Finance).
- No collapse/expand toggle for desktop. **Improve**: Add a toggle to expand sidebar to show labels when needed.

**5. Mobile Issues**
- Reference has no mobile-specific optimizations for data-dense views (finance tables, habit grids). **Must ensure**: All tables and grids have horizontal scroll with sticky first column on mobile.
- Mobile header has too many buttons (search, language, theme, AI, hamburger). **Improve**: Consolidate -- move language/theme to settings, keep only search + hamburger in mobile header.
- The spotlight search overlay has `pt-24` which wastes vertical space on mobile. **Fix**: Use `pt-16` on mobile.

**6. Accessibility Concerns**
- Reference has `select-none` on the entire main layout -- this breaks text selection globally. **Must NOT copy this**.
- Icon-only sidebar items lack `aria-label` attributes. **Must add** proper ARIA labels.
- Color contrast: `text-[9px]` and `text-[10px]` micro-text with `text-slate-500` on dark backgrounds likely fails WCAG AA. **Improve**: Minimum `text-xs` for critical info, ensure contrast ratios meet 4.5:1.
- No focus-visible styles on interactive elements. **Must add**: `focus-visible:ring-2 focus-visible:ring-primary` on all buttons/inputs.
- Tooltip pattern (absolute positioned span) is not accessible to screen readers. **Improve**: Use proper `aria-describedby` or a Radix Tooltip component.

**7. Information Hierarchy Issues**
- Module headers use `text-xl` which is smaller than the page-level greeting `text-2xl`. This creates confusion about what is the primary heading. **Fix**: Module headers should be `text-2xl font-bold`, section headers within modules should be `text-sm uppercase tracking-wider`.
- Status badges at `text-[9px]` are nearly illegible. **Improve**: Minimum `text-[10px]` with `px-2 py-0.5` for tap targets.
- The dashboard customizer bar competes visually with the greeting widget below it. **Fix**: Make customizer a collapsible toolbar that recedes when not in use.

### Design Pattern Adoption Matrix

| Pattern | Adopt? | Rationale |
|---|---|---|
| Dark-first palette with indigo accent | YES | Premium, modern, reduces eye strain. Map to our CSS variable system. |
| Plus Jakarta Sans display font | YES | Strong visual hierarchy for headings. Free Google Font. |
| Glow card shadows | YES | Adds depth and premium feel without heavy decoration. |
| Icon rail sidebar | YES, but improved | Add text labels below icons, section grouping, expand toggle. |
| Module header bars | YES | Clean, consistent page-level identity. |
| Filter pill buttons | YES | Familiar, space-efficient filter pattern. |
| Monospace stat numbers | YES | Professional data presentation. |
| Framer Motion animations | PARTIAL | Use for modals/drawers only. Avoid heavy page-level animations (performance). |
| `select-none` global | NO | Breaks text selection, harms accessibility. |
| `text-[9px]` micro-badges | NO | Illegible. Use minimum `text-[10px]`. |
| localStorage-only state | NO | Our Supabase backend is superior. |
| Single-file architecture | NO | Our modular feature-based architecture is far better. |
| No form validation | NO | Our Zod + React Hook Form pipeline must remain. |
| Hardcoded color values | NO | Map to CSS variables/tokens for theme support. |
| Gradient CTA buttons | PARTIAL | Use sparingly on primary actions only, not everywhere. |

### Deliverable

Before proceeding to Task 1, produce a brief written audit report (inline, not a separate file) documenting:
- 3-5 critical problems found in the reference that must be avoided
- 3-5 excellent patterns that should be adopted as-is
- 3-5 patterns that need modification and how they will be improved

---

## Task 1: Update Design System Tokens (`globals.css`)

**File**: `src/app/globals.css`

Update CSS variables to implement the indigo-accented dark-first palette:

- **Light mode**: Keep clean whites but add indigo as primary accent
  - `--primary`: shift to indigo-600 equivalent in oklch: `oklch(0.511 0.262 272)`
  - `--primary-foreground`: `oklch(0.985 0.003 272)` (near-white with indigo tint)
  - `--ring`: indigo-500 equivalent

- **Dark mode**: Implement the reference's deep dark palette
  - `--background`: `oklch(0.13 0.01 270)` (equivalent to `#0A0A0B`)
  - `--card`: `oklch(0.19 0.01 270)` (equivalent to `#161618`)
  - `--primary`: `oklch(0.65 0.2 272)` (indigo-400 equivalent, bright for dark bg)
  - `--primary-foreground`: `oklch(0.13 0.01 270)` (dark text on bright accent)
  - `--border`: `oklch(1 0 0 / 8%)` (subtler borders like `#2C2C2E`)
  - `--muted`: `oklch(0.22 0.01 270)` (dark muted surface)
  - `--muted-foreground`: `oklch(0.60 0.01 270)` (slate-400 equivalent)

- Add custom utility classes at the bottom:
  ```css
  .glow-card { box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05), 0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -4px rgba(0,0,0,0.3); }
  .glow-primary { box-shadow: 0 0 20px -3px var(--color-primary); }
  ```

- Add custom scrollbar styling (thin, minimal)
- Increase `--radius` from `0.5rem` to `0.75rem` for more generous rounding

## Task 2: Add Display Font (`layout.tsx` + `globals.css`)

**Files**: `src/app/layout.tsx`, `src/app/globals.css`

- Import Google Fonts: Plus Jakarta Sans (display), JetBrains Mono (mono) -- keep Inter as body
- Add `--font-display` CSS variable in `globals.css` `@theme inline` block
- Apply `font-display` class to headings across the app via utility class

## Task 3: Install Motion Library

```bash
npm install motion
```

For AnimatePresence/motion animations on sidebar, modals, and page transitions.

## Task 4: Redesign Sidebar as Icon Rail (`portal-sidebar.tsx`)

**File**: `src/components/shared/portal-sidebar.tsx`

Transform from a w-64 text sidebar to an improved icon rail (reference pattern, enhanced):
- Vertical rail with icons AND compact text labels below each icon (better discoverability than reference)
- Logo/brand badge at top (not just "H" -- use proper branding)
- Section grouping with subtle dividers (Productivity / Knowledge / System)
- Active state: `bg-primary/10 text-primary border border-primary/20`
- Inactive: `text-muted-foreground hover:text-foreground hover:bg-muted`
- Expand/collapse toggle button to widen sidebar and show full labels
- User avatar at bottom
- Mobile: bottom sheet / slide-up panel (not full-width dropdown)
- Proper `aria-label` on all nav items, `focus-visible` rings
- Logout as small icon at bottom

## Task 5: Redesign Portal Header (`portal-header.tsx`)

**File**: `src/components/shared/portal-header.tsx`

Transform header to match reference's premium top bar (improved):
- Left: Page title with `font-display` + status badge (sync indicator)
- Right: Search trigger (shows Ctrl+K kbd), Theme cycle button (Dark/Light/Auto), sync status dot
- Keep mobile header minimal: only search + hamburger (move language/theme to settings)
- Use `bg-transparent` with border-b for clean look
- Search trigger styled: `bg-card border rounded-xl pl-9 pr-12 py-2 text-xs`
- Proper `aria-label` on all buttons

## Task 6: Update Global Search Styling (`global-search.tsx`)

**File**: `src/components/shared/global-search.tsx`

- Update search trigger button to match reference's search bar style
- Add Ctrl+K badge with primary accent styling
- Update search placeholder to Indonesian
- On mobile: use `pt-16` instead of `pt-24` for the overlay

## Task 7: Update Portal Layout (`portal/layout.tsx`)

**File**: `src/app/portal/layout.tsx`

- Adjust main content padding: `p-4 md:p-6 space-y-6` (remove lg:p-8)
- Add `overflow-y-auto` scrollable area styling with custom scrollbar
- Do NOT add `select-none` (accessibility fix from Task 0 audit)

## Task 8: Modernize Dashboard (`CommandCenter.tsx`)

**File**: `src/features/dashboard/components/CommandCenter.tsx`

Major redesign inspired by reference's dashboard (improved):
- **Greeting widget**: Card with focus score (monospace), progress bar, habits-checked stat
- **Collapsible dashboard customizer**: Toolbar that recedes when not in use (fix hierarchy issue)
- **Cards**: Use `glow-card` class, `rounded-2xl`/`rounded-3xl`, `border` styling
- **Section headers**: `text-sm font-bold uppercase tracking-wider text-muted-foreground` with icon (larger than reference's `text-xs` for accessibility)
- **Stat cards**: Large monospace numbers, icon in primary/10 circle
- **Goal/Project cards**: Color-coded backgrounds, progress bars, type badges
- **Buttons**: Primary CTA with gradient on main actions only (not everywhere)
- **Empty states**: Meaningful Indonesian messages with action links
- Use simpler 3-column grid instead of reference's 12-column complexity

## Task 9: Update All Feature Page Components

Standardize all feature module pages with the improved module pattern:

**Module Header Bar** (applied to each page):
```tsx
<div className="flex justify-between items-center bg-card p-5 rounded-2xl border glow-card">
  <div>
    <h2 className="text-2xl font-bold font-display">Module Name</h2>
    <p className="text-xs text-muted-foreground mt-1">Description</p>
  </div>
  <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4 py-2 rounded-xl font-semibold shadow-lg shadow-primary/10 focus-visible:ring-2 focus-visible:ring-primary">
    <Plus className="w-4 h-4 mr-1" /> Add New
  </button>
</div>
```

Note: `text-2xl` (not `text-xl` like reference) to fix hierarchy issue identified in Task 0.

**Filter Toolbar** (where applicable):
- Pill-style filter buttons with active state: `bg-primary/10 text-primary border-primary/35`
- Inactive: `bg-background border text-muted-foreground hover:text-foreground`
- Minimum `text-[10px]` for badge text (accessibility fix)

**Cards**: `rounded-2xl border glow-card`, status badges minimum `text-[10px]`

**Files to update**:
- `src/features/tasks/components/TaskView.tsx` - Controls bar, filter pills
- `src/features/tasks/components/TaskList.tsx` - Section headers, empty state
- `src/features/tasks/components/TaskBoard.tsx` - Column styling
- `src/features/tasks/components/TaskItem.tsx` - Card glow, badges
- `src/features/projects/components/ProjectList.tsx` - Module header, filter toolbar
- `src/features/projects/components/ProjectCard.tsx` - Glow card, status badges
- `src/features/notes/components/NoteList.tsx` - Card grid
- `src/features/notes/components/NotesSearch.tsx` - Search bar
- `src/features/goals/components/GoalsClient.tsx` - Module header, analytics
- `src/features/goals/components/GoalCard.tsx` - Glow effects
- `src/features/diary/components/DiaryCalendar.tsx` - Calendar styling
- `src/features/habits/components/HabitTrackerGrid.tsx` - Grid styling with sticky first column on mobile
- `src/features/finance/components/MonthlyOverviewCards.tsx` - Stat cards
- `src/features/finance/components/TransactionList.tsx` - List styling

## Task 10: Update Page-Level Files

Ensure all page wrappers use the standardized module pattern:

**Files**: All `src/app/portal/*/page.tsx`
- Replace page headers with module header bar pattern
- Use `font-display` for page titles
- Add `glow-card` to wrapper cards
- Use `max-w-5xl mx-auto w-full space-y-6` for module pages (middle ground, not `max-w-4xl`)
- Dashboard uses `max-w-7xl` (already correct)

## Task 11: Polish Shared UI Components

**Files**:
- `src/components/ui/card.tsx` - Increase default rounding, add glow variant
- `src/components/ui/button.tsx` - Add glow/gradient variant for primary CTA
- `src/components/ui/input.tsx` - Update focus ring to primary color
- `src/components/ui/badge.tsx` - Ensure translucent badge style, minimum `text-[10px]`
- `src/components/ui/select.tsx` - Style dropdowns with rounded-xl

## Task 12: Verify and Test

- Run `npx tsc --noEmit --skipLibCheck` to verify no TypeScript errors
- Visual review of all pages for consistency
- Test dark/light mode toggle
- Verify responsive behavior on mobile viewport
- Verify accessibility: focus rings, aria labels, contrast ratios