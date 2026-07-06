# AI Copilot Critical Fixes

## Root Cause Analysis

### Issue 1 — Conversation History Not Restoring

Two root causes found:

**A. Data Loss in Storage** — `ai_messages` table only stores `content TEXT`. The API route saves `text` only (`route.ts:169`), and the restore in `AIChatPageClient.tsx:123-128` reconstructs messages as `{ role, content, parts: [{ type: 'text', text: content }] }`. This means:
- Tool invocations (draft cards) are completely lost
- `parts` structure (data markers, reasoning) is lost
- Message metadata is lost

**B. Timing Race in `selectConversation`** — `AIChatPageClient.tsx:119-131` calls `setActiveConversation(conv)` on line 120 BEFORE `setIsLoadingMessages(true)` on line 121. This means ChatInterface can mount with stale data from the previous conversation before the loading guard kicks in. Once `useChat` initializes with wrong `initialMessages`, it never updates.

### Issue 2 — AI Actions Not Showing Draft Cards on Restore

Direct consequence of Issue 1A. The `ActionDraftCard` renders from `m.toolInvocations` (ChatInterface.tsx:272). Since tool invocations are never saved to DB, they are lost on restore. The AI text says "draft telah disiapkan" but no card appears.

### Issue 3 — Markdown Not Rendering

No markdown library is installed (`react-markdown`, `marked`, etc. — all absent from `package.json`). Messages render as `whitespace-pre-wrap` plain text (ChatInterface.tsx:258). `**bold**` appears literally.

---

## Task 1: Add `message_data` JSONB Column to `ai_messages`

**Goal**: Store the full serialized `UIMessage` JSON so tool invocations, parts, and metadata survive DB round-trip.

**File**: New migration `supabase/migrations/20260610000000_ai_message_data.sql`

```sql
ALTER TABLE public.ai_messages ADD COLUMN message_data JSONB;
```

Keep `content TEXT` as-is for backward compatibility and search. `message_data` is nullable — old messages work with text-only fallback.

---

## Task 2: Fix Message Save — Client-Side with Full UIMessage

**Goal**: Save the complete `UIMessage` object (with `parts`, `toolInvocations`, `content`) from the client.

**Files**: `ai.actions.ts`, `ai.repository.ts`, `ChatInterface.tsx`, `route.ts`

Changes:
- **2a.** Add `saveFullMessageAction(conversationId, role, content, messageData)` in `ai.actions.ts` — accepts optional `messageData` (JSON string) and saves to `message_data` column.
- **2b.** Add `saveMessageWithData()` method in `ai.repository.ts` — INSERT with `message_data` JSONB.
- **2c.** In `ChatInterface.tsx`: 
  - Add `onFinish` callback to `useChat`. When the assistant finishes, save the assistant message with `JSON.stringify(assistantMessage)` as `message_data`.
  - In `onSubmit`, save the user message with full `UIMessage` data BEFORE calling `sendMessage`.
- **2d.** In `route.ts` API route: REMOVE the `onFinish` DB save (lines 167-172). The client now handles persistence with full data. Keep the user message save in the API route as a fallback (it doesn't have tool invocations).

---

## Task 3: Fix Message Restore — Full Data + Timing Fix

**Goal**: Restore messages with tool invocations intact, and fix the race condition.

**File**: `AIChatPageClient.tsx`

Changes:
- **3a. Timing fix**: In `selectConversation()`, move `setIsLoadingMessages(true)` BEFORE `setActiveConversation(conv)` — or better, batch them together. This prevents ChatInterface from mounting with stale data.
- **3b. Full data restore**: In the message mapping, check for `message_data`. If present, `JSON.parse()` it to reconstruct the full `UIMessage` (with `parts`, `toolInvocations`). If absent (old messages), use the current text-only fallback.

```typescript
const msgs: Message[] = (result.data || []).map(m => {
  if (m.message_data) {
    try { return JSON.parse(m.message_data); } catch {}
  }
  return {
    id: m.id,
    role: (m.role === 'data' ? 'assistant' : m.role) as any,
    content: m.content,
    parts: [{ type: 'text' as const, text: m.content }],
  };
});
```

- **3c.** Ensure `isLoadingMessages` is `true` before `activeConversation` changes, so the loading spinner blocks ChatInterface from rendering prematurely.

---

## Task 4: Markdown Rendering for AI Responses

**Goal**: Render `**bold**`, `*italic*`, code blocks, lists, headings, links in assistant messages.

**Files**: Install `react-markdown`, modify `ChatInterface.tsx`

Changes:
- **4a.** Install: `npm install react-markdown`
- **4b.** In `ChatInterface.tsx`, import `ReactMarkdown` and replace the plain text rendering for assistant messages. User messages stay as plain text (they don't contain markdown).
- **4c.** Configure safe rendering: only allow `strong`, `em`, `code`, `pre`, `ul`, `ol`, `li`, `h1-h6`, `a`, `blockquote`, `p`, `br`. No HTML injection.
- **4d.** Preserve data marker parsing: `parseDataMarkers()` runs first, then each text segment is rendered through `ReactMarkdown`.

---

## Task 5: Interactive Data Card — Individual Record Navigation

**Goal**: Clicking a data item opens the specific record, not just the module list page.

**File**: `InteractiveDataCard.tsx`

Changes:
- **5a.** Add item-level route mapping:
  - `tasks` item → `/portal/tasks` (no per-task route, scroll to item)
  - `projects` item → `/portal/projects/${item.id}`
  - `notes` item → `/portal/notes/${item.id}`
  - `goals`, `finance`, `diary`, `achievements` → module page (no detail route)
- **5b.** Pass `item.id` via URL hash or search param for modules that support it.
- **5c.** Keep "Lihat Semua" button navigating to the module list page.

---

## Task 6: Post-Confirmation Module Prefill via URL Params

**Goal**: After confirming an AI draft, the target module page opens its create form with AI-extracted values pre-filled.

**Files**: `ActionDraftCard.tsx`, module page client components (TaskView, FinanceClient, DiaryClient, etc.)

Changes:
- **6a.** In `ActionDraftCard.handleConfirm()` after success: encode draft data as URL search params and navigate:
  ```
  /portal/tasks?ai_prefill={"title":"...","priority":"normal","due_date":"..."}
  ```
- **6b.** In each target module's client component, add a `useEffect` that reads `ai_prefill` from `useSearchParams()`, opens the create form dialog, and passes the parsed data as `initialData`.
- **6c.** Modules to update (highest priority):
  - Tasks: `TaskView.tsx` — read `ai_prefill`, open `TaskForm` with `initialData`
  - Finance: `FinanceClient.tsx` — read `ai_prefill`, open `TransactionFormDialog` with `initialData`
  - Diary: `DiaryClient.tsx` — read `ai_prefill`, open create entry form
  - Notes: `NotesClient` — read `ai_prefill`, open create note form
- **6d.** Clear the `ai_prefill` param from URL after the form opens (using `router.replace` without the param).

---

## Task 7: Final Verification

- TypeScript: `npx tsc --noEmit --skipLibCheck`
- Manual test: send a message, confirm a draft, refresh page, verify history restores with draft cards and markdown
- Verify no regressions in authentication, Supabase, Cloudinary, CMS, or existing modules

---

## Implementation Order

1. **Task 1** — DB migration (foundation for Tasks 2-3)
2. **Task 2** — Fix save mechanism (depends on Task 1)
3. **Task 3** — Fix restore mechanism (depends on Task 1, 2)
4. **Task 4** — Markdown rendering (independent)
5. **Task 5** — Interactive card navigation (independent)
6. **Task 6** — Module prefill workflow (depends on Task 3)
7. **Task 7** — Final verification (last)
