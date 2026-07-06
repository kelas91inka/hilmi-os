/**
 * Tool Normalizer — AI Copilot
 *
 * Runs BEFORE schema validation.
 * Ensures LLM output is always coerced, normalized, and filled with defaults
 * so that tool calls NEVER fail due to missing/wrong-typed fields.
 *
 * Pipeline: LLM Output → Normalizer → Valid Draft → Popup Confirmation
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function coerceNumber(val: unknown, fallback = 0): number {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
}

function coerceString(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val.trim();
  if (val === null || val === undefined) return fallback;
  return String(val).trim();
}

function coerceBoolean(val: unknown, fallback = false): boolean {
  if (typeof val === 'boolean') return val;
  if (val === 'true' || val === 1) return true;
  if (val === 'false' || val === 0) return false;
  return fallback;
}

function normalizeDate(val: unknown): string | null {
  if (!val || val === 'null' || val === 'undefined' || val === 'none') return null;
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch { /* ignore */ }
  return null;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface NormalizedCreateTask {
  title: string;
  description: string;
  priority: 'rendah' | 'normal' | 'tinggi' | 'kritis';
  status: 'belum_dimulai' | 'sedang_dikerjakan' | 'selesai' | 'ditunda';
  due_date: string | null;
}

export function normalizeCreateTask(raw: Record<string, unknown>): NormalizedCreateTask {
  const PRIORITY_MAP: Record<string, NormalizedCreateTask['priority']> = {
    low: 'rendah', rendah: 'rendah',
    medium: 'normal', normal: 'normal', sedang: 'normal',
    high: 'tinggi', tinggi: 'tinggi',
    critical: 'kritis', kritis: 'kritis', urgent: 'kritis',
  };
  const STATUS_MAP: Record<string, NormalizedCreateTask['status']> = {
    todo: 'belum_dimulai', belum_dimulai: 'belum_dimulai',
    in_progress: 'sedang_dikerjakan', sedang_dikerjakan: 'sedang_dikerjakan', inprogress: 'sedang_dikerjakan',
    done: 'selesai', selesai: 'selesai', completed: 'selesai', finish: 'selesai',
    paused: 'ditunda', ditunda: 'ditunda', hold: 'ditunda',
  };
  const rawPriority = coerceString(raw.priority).toLowerCase();
  const rawStatus = coerceString(raw.status).toLowerCase();
  return {
    title: coerceString(raw.title) || 'Tugas Baru',
    description: coerceString(raw.description),
    priority: PRIORITY_MAP[rawPriority] ?? 'normal',
    status: STATUS_MAP[rawStatus] ?? 'belum_dimulai',
    due_date: normalizeDate(raw.due_date),
  };
}

// ─── Update Task ──────────────────────────────────────────────────────────────

export interface NormalizedUpdateTask {
  task_id: string;
  title?: string;
  description?: string;
  priority?: 'rendah' | 'normal' | 'tinggi' | 'kritis';
  status?: 'belum_dimulai' | 'sedang_dikerjakan' | 'selesai' | 'ditunda';
  due_date?: string | null;
}

export function normalizeUpdateTask(raw: Record<string, unknown>): NormalizedUpdateTask {
  const PRIORITY_MAP: Record<string, NormalizedCreateTask['priority']> = {
    low: 'rendah', rendah: 'rendah', medium: 'normal', normal: 'normal',
    high: 'tinggi', tinggi: 'tinggi', critical: 'kritis', kritis: 'kritis', urgent: 'kritis',
  };
  const STATUS_MAP: Record<string, NormalizedCreateTask['status']> = {
    todo: 'belum_dimulai', belum_dimulai: 'belum_dimulai',
    in_progress: 'sedang_dikerjakan', sedang_dikerjakan: 'sedang_dikerjakan',
    done: 'selesai', selesai: 'selesai', completed: 'selesai',
    paused: 'ditunda', ditunda: 'ditunda',
  };
  const normalized: NormalizedUpdateTask = { task_id: coerceString(raw.task_id || raw.id) };
  if (raw.title) normalized.title = coerceString(raw.title);
  if (raw.description !== undefined) normalized.description = coerceString(raw.description);
  if (raw.priority) { const k = coerceString(raw.priority).toLowerCase(); normalized.priority = PRIORITY_MAP[k] ?? 'normal'; }
  if (raw.status) { const k = coerceString(raw.status).toLowerCase(); normalized.status = STATUS_MAP[k] ?? 'belum_dimulai'; }
  if (raw.due_date !== undefined) normalized.due_date = normalizeDate(raw.due_date);
  return normalized;
}

// ─── Update Task Status ───────────────────────────────────────────────────────

export interface NormalizedUpdateTaskStatus {
  task_id: string;
  status: 'belum_dimulai' | 'sedang_dikerjakan' | 'selesai' | 'ditunda';
}

export function normalizeUpdateTaskStatus(raw: Record<string, unknown>): NormalizedUpdateTaskStatus {
  const STATUS_MAP: Record<string, NormalizedUpdateTaskStatus['status']> = {
    todo: 'belum_dimulai', belum_dimulai: 'belum_dimulai',
    in_progress: 'sedang_dikerjakan', sedang_dikerjakan: 'sedang_dikerjakan',
    done: 'selesai', selesai: 'selesai', completed: 'selesai', finish: 'selesai',
    paused: 'ditunda', ditunda: 'ditunda',
  };
  const rawStatus = coerceString(raw.status).toLowerCase().replace(/-/g, '_');
  return {
    task_id: coerceString(raw.task_id || raw.id),
    status: STATUS_MAP[rawStatus] ?? 'belum_dimulai',
  };
}

// ─── Goal ─────────────────────────────────────────────────────────────────────

export interface NormalizedCreateGoal {
  title: string;
  description: string;
  goal_type: 'mingguan' | 'bulanan' | 'tahunan' | 'lifetime';
  target_date: string | null;
  category: string;
}

export function normalizeCreateGoal(raw: Record<string, unknown>): NormalizedCreateGoal {
  const TYPE_MAP: Record<string, NormalizedCreateGoal['goal_type']> = {
    weekly: 'mingguan', mingguan: 'mingguan',
    monthly: 'bulanan', bulanan: 'bulanan',
    yearly: 'tahunan', annual: 'tahunan', tahunan: 'tahunan',
    lifetime: 'lifetime', lifelong: 'lifetime', seumur: 'lifetime',
  };
  const rawType = coerceString(raw.goal_type || raw.type).toLowerCase();
  return {
    title: coerceString(raw.title) || 'Goal Baru',
    description: coerceString(raw.description),
    goal_type: TYPE_MAP[rawType] ?? 'bulanan',
    target_date: normalizeDate(raw.target_date || raw.due_date),
    category: coerceString(raw.category) || 'Umum',
  };
}

// ─── Update Goal ──────────────────────────────────────────────────────────────

export interface NormalizedUpdateGoal {
  goal_id: string;
  title?: string;
  description?: string;
  progress?: number;
  status?: 'active' | 'completed' | 'paused';
  target_date?: string | null;
}

export function normalizeUpdateGoal(raw: Record<string, unknown>): NormalizedUpdateGoal {
  const STATUS_MAP: Record<string, NormalizedUpdateGoal['status']> = {
    active: 'active', aktif: 'active', completed: 'completed', selesai: 'completed', done: 'completed', paused: 'paused', ditunda: 'paused',
  };
  const normalized: NormalizedUpdateGoal = { goal_id: coerceString(raw.goal_id || raw.id) };
  if (raw.title) normalized.title = coerceString(raw.title);
  if (raw.description !== undefined) normalized.description = coerceString(raw.description);
  if (raw.progress !== undefined) { const p = coerceNumber(raw.progress); normalized.progress = Math.max(0, Math.min(100, p)); }
  if (raw.status) { const k = coerceString(raw.status).toLowerCase(); normalized.status = STATUS_MAP[k] ?? 'active'; }
  if (raw.target_date !== undefined) normalized.target_date = normalizeDate(raw.target_date);
  return normalized;
}

// ─── Finance Transaction ──────────────────────────────────────────────────────

export interface NormalizedFinanceTransaction {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  transaction_date: string;
}

export function normalizeFinanceTransaction(raw: Record<string, unknown>): NormalizedFinanceTransaction {
  const TYPE_MAP: Record<string, 'income' | 'expense'> = {
    income: 'income', pemasukan: 'income', masuk: 'income', gaji: 'income', penjualan: 'income', revenue: 'income',
    expense: 'expense', pengeluaran: 'expense', keluar: 'expense', beli: 'expense', bayar: 'expense', cost: 'expense',
  };
  const rawType = coerceString(raw.type).toLowerCase();
  const amount = coerceNumber(raw.amount);
  let category = coerceString(raw.category);
  if (!category) {
    const desc = coerceString(raw.description).toLowerCase();
    if (/makan|minum|restoran|kafe|coffee|makanan|seblak|nasi|bakso|warung/.test(desc)) category = 'Makanan';
    else if (/bensin|ojek|grab|gojek|taxi|busway|krl|kereta|transport/.test(desc)) category = 'Transportasi';
    else if (/listrik|air|internet|pulsa|quota|utilitas/.test(desc)) category = 'Utilitas';
    else if (/baju|sepatu|pakaian|belanja|shopping/.test(desc)) category = 'Belanja';
    else if (/gaji|salary|freelance|proyek/.test(desc)) category = 'Pendapatan';
    else if (/hiburan|nonton|bioskop|games|game|netflix/.test(desc)) category = 'Hiburan';
    else category = rawType === 'income' ? 'Pemasukan Lainnya' : 'Lainnya';
  }
  return {
    type: TYPE_MAP[rawType] ?? 'expense',
    amount,
    category,
    description: coerceString(raw.description),
    transaction_date: normalizeDate(raw.transaction_date || raw.date) ?? today(),
  };
}

// ─── Diary Entry ──────────────────────────────────────────────────────────────

export interface NormalizedDiaryEntry {
  content: string;
  mood: 'happy' | 'neutral' | 'sad' | 'productive' | 'stressed' | 'tired' | 'sick';
  entry_date: string;
  title: string;
}

export function normalizeDiaryEntry(raw: Record<string, unknown>): NormalizedDiaryEntry {
  const MOOD_MAP: Record<string, NormalizedDiaryEntry['mood']> = {
    happy: 'happy', senang: 'happy', bahagia: 'happy', gembira: 'happy',
    neutral: 'neutral', biasa: 'neutral', normal: 'neutral', oke: 'neutral',
    sad: 'sad', sedih: 'sad', murung: 'sad',
    productive: 'productive', produktif: 'productive', semangat: 'productive',
    stressed: 'stressed', stress: 'stressed', stres: 'stressed', cemas: 'stressed',
    tired: 'tired', lelah: 'tired', capek: 'tired', exhausted: 'tired',
    sick: 'sick', sakit: 'sick',
  };
  const rawMood = coerceString(raw.mood).toLowerCase();
  const content = coerceString(raw.content || raw.text || raw.body);
  return {
    content: content || 'Catatan hari ini.',
    mood: MOOD_MAP[rawMood] ?? 'neutral',
    entry_date: normalizeDate(raw.entry_date || raw.date) ?? today(),
    title: coerceString(raw.title) || 'Catatan AI',
  };
}

// ─── Note ─────────────────────────────────────────────────────────────────────

export interface NormalizedCreateNote {
  title: string;
  content: string;
  is_favorite: boolean;
}

export function normalizeCreateNote(raw: Record<string, unknown>): NormalizedCreateNote {
  return {
    title: coerceString(raw.title) || 'Catatan Baru',
    content: coerceString(raw.content || raw.body || raw.text),
    is_favorite: coerceBoolean(raw.is_favorite || raw.favorite || raw.starred),
  };
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface NormalizedCreateProject {
  title: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  start_date: string | null;
  end_date: string | null;
}

export function normalizeCreateProject(raw: Record<string, unknown>): NormalizedCreateProject {
  const STATUS_MAP: Record<string, NormalizedCreateProject['status']> = {
    planning: 'planning', rencana: 'planning', plan: 'planning',
    active: 'active', aktif: 'active', berjalan: 'active',
    paused: 'paused', pause: 'paused', ditunda: 'paused', hold: 'paused',
    completed: 'completed', selesai: 'completed', done: 'completed',
    archived: 'archived', arsip: 'archived',
  };
  const rawStatus = coerceString(raw.status).toLowerCase();
  return {
    title: coerceString(raw.title) || 'Project Baru',
    description: coerceString(raw.description),
    status: STATUS_MAP[rawStatus] ?? 'active',
    start_date: normalizeDate(raw.start_date || raw.start),
    end_date: normalizeDate(raw.end_date || raw.end || raw.due_date),
  };
}

// ─── Update Project ───────────────────────────────────────────────────────────

export interface NormalizedUpdateProject {
  project_id: string;
  title?: string;
  description?: string;
  status?: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  end_date?: string | null;
}

export function normalizeUpdateProject(raw: Record<string, unknown>): NormalizedUpdateProject {
  const STATUS_MAP: Record<string, NormalizedCreateProject['status']> = {
    planning: 'planning', active: 'active', aktif: 'active',
    paused: 'paused', ditunda: 'paused', completed: 'completed', selesai: 'completed', archived: 'archived',
  };
  const normalized: NormalizedUpdateProject = { project_id: coerceString(raw.project_id || raw.id) };
  if (raw.title) normalized.title = coerceString(raw.title);
  if (raw.description !== undefined) normalized.description = coerceString(raw.description);
  if (raw.status) { const k = coerceString(raw.status).toLowerCase(); normalized.status = STATUS_MAP[k] ?? 'active'; }
  if (raw.end_date !== undefined) normalized.end_date = normalizeDate(raw.end_date);
  return normalized;
}

// ─── Achievement ──────────────────────────────────────────────────────────────

export interface NormalizedCreateAchievement {
  title: string;
  description: string;
  category: string;
  achievement_date: string;
}

export function normalizeCreateAchievement(raw: Record<string, unknown>): NormalizedCreateAchievement {
  return {
    title: coerceString(raw.title) || 'Pencapaian Baru',
    description: coerceString(raw.description),
    category: coerceString(raw.category) || 'Personal',
    achievement_date: normalizeDate(raw.achievement_date || raw.date) ?? today(),
  };
}

// ─── CMS Post ─────────────────────────────────────────────────────────────────

export interface NormalizedCreateCmsPost {
  title: string;
  post_type: 'text' | 'thread' | 'image' | 'video' | 'article' | 'project_update';
  body: string;
}

export function normalizeCreateCmsPost(raw: Record<string, unknown>): NormalizedCreateCmsPost {
  const TYPE_MAP: Record<string, NormalizedCreateCmsPost['post_type']> = {
    text: 'text', teks: 'text',
    thread: 'thread',
    image: 'image', foto: 'image', gambar: 'image', photo: 'image',
    video: 'video',
    article: 'article', artikel: 'article', blog: 'article',
    project_update: 'project_update', update: 'project_update', project: 'project_update',
  };
  const rawType = coerceString(raw.post_type || raw.type).toLowerCase();
  return {
    title: coerceString(raw.title) || 'Post Baru',
    post_type: TYPE_MAP[rawType] ?? 'article',
    body: coerceString(raw.body || raw.content || raw.text),
  };
}

// ─── Delete Task ──────────────────────────────────────────────────────────────

export interface NormalizedDeleteTask { task_id: string; }
export function normalizeDeleteTask(raw: Record<string, unknown>): NormalizedDeleteTask {
  return { task_id: coerceString(raw.task_id || raw.id) };
}

// ─── Master Dispatch ──────────────────────────────────────────────────────────

/**
 * Normalize any draft by action type before sending to server action.
 */
export function normalizeDraft(type: string, raw: Record<string, unknown>): any {
  switch (type) {
    case 'create_task':               return normalizeCreateTask(raw);
    case 'update_task':               return normalizeUpdateTask(raw);
    case 'update_task_status':        return normalizeUpdateTaskStatus(raw);
    case 'delete_task':               return normalizeDeleteTask(raw);
    case 'create_goal':               return normalizeCreateGoal(raw);
    case 'update_goal':               return normalizeUpdateGoal(raw);
    case 'create_finance_transaction':return normalizeFinanceTransaction(raw);
    case 'create_diary_entry':        return normalizeDiaryEntry(raw);
    case 'create_note':               return normalizeCreateNote(raw);
    case 'create_project':            return normalizeCreateProject(raw);
    case 'update_project':            return normalizeUpdateProject(raw);
    case 'create_achievement':        return normalizeCreateAchievement(raw);
    case 'create_cms_post':           return normalizeCreateCmsPost(raw);
    default:                          return raw;
  }
}
