/* eslint-disable */
// @ts-nocheck
/**
 * system-tools.ts — AI Copilot Tool Definitions
 *
 * CRITICAL FIX: All schemas use raw jsonSchema() instead of Zod + zodToJsonSchema.
 * zodToJsonSchema v3.x is incompatible with Zod v4 and returns empty {}.
 *
 * Architecture:
 *   LLM → Tool Execute → { requiresConfirmation, type, draft }
 *   → Normalizer → GlobalModal popup → Server Action → Database
 */

import { tool as sdkTool, jsonSchema } from 'ai';
import { aiRepository } from '../repositories/ai.repository';
import { normalizeDraft } from './tool-normalizer';

/** Groq-safe tool wrapper: uses raw jsonSchema, applies normalizer in execute */
function tool(options: any) {
  if (options.parameters) {
    options.inputSchema = options.parameters;
  }
  return sdkTool(options);
}

// ─── READ TOOLS ────────────────────────────────────────────────────────────────

export const systemTools = {

  get_active_tasks: tool({
    description: 'Ambil semua task yang belum selesai. Gunakan ketika user bertanya tentang tugas aktif, fokus hari ini, atau apa yang harus dikerjakan.',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string', description: 'Optional context' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const tasks = await aiRepository.getActiveTasks();
        return { success: true, tasks };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  get_weekly_tasks: tool({
    description: 'Ambil task dari 7 hari terakhir untuk review mingguan.',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const tasks = await aiRepository.getWeeklyTasks();
        return { success: true, tasks };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  get_active_projects: tool({
    description: 'Ambil project yang sedang aktif beserta timeline-nya.',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const projects = await aiRepository.getActiveProjects();
        return { success: true, projects };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  get_goals_progress: tool({
    description: 'Ambil semua goal beserta persentase progres saat ini.',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const goals = await aiRepository.getGoalsProgress();
        return { success: true, goals };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  get_recent_diary: tool({
    description: 'Ambil entri diary 30 hari terakhir untuk analisis mood dan refleksi.',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const diary = await aiRepository.getRecentDiary();
        return { success: true, diary };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  get_notes: tool({
    description: 'Ambil catatan terbaru dan favorit dari second brain.',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const notes = await aiRepository.getNotes();
        return { success: true, notes };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  get_habit_stats: tool({
    description: 'Ambil statistik habit aktif untuk analisis rutinitas harian.',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const habits = await aiRepository.getHabitStats();
        return { success: true, habits };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  get_finance_summary: tool({
    description: 'Ambil ringkasan keuangan bulan ini: total pemasukan, pengeluaran, saldo, kategori terbesar, dan transaksi terbaru. Gunakan ketika user bertanya tentang keuangan atau pengeluaran.',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const summary = await aiRepository.getFinanceSummary();
        return { success: true, summary };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  get_achievements: tool({
    description: 'Ambil pencapaian terbaru untuk analisis pertumbuhan.',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const achievements = await aiRepository.getAchievements();
        return { success: true, achievements };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  get_dashboard_insight: tool({
    description: 'Ambil insight lintas-modul: task overdue, task kritis, goal progres rendah, habit aktif, project aktif. Gunakan untuk "bagaimana kondisi saya?" atau analisis produktivitas umum.',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const insight = await aiRepository.getDashboardInsight();
        return { success: true, insight };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  get_weekly_insight: tool({
    description: 'Ambil insight mingguan: task selesai, pengeluaran, mood diary, progres goal, habit aktif. Gunakan untuk review mingguan atau "bagaimana minggu ini?".',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const insight = await aiRepository.getWeeklyInsight();
        return { success: true, insight };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  get_monthly_insight: tool({
    description: 'Ambil insight bulanan: task, keuangan, diary, goal, project, achievement. Gunakan untuk review bulanan atau "bagaimana bulan ini?".',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const insight = await aiRepository.getMonthlyInsight();
        return { success: true, insight };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  get_cms_posts: tool({
    description: 'Ambil post CMS terbaru: type, status publish, tanggal. Gunakan ketika user bertanya tentang post atau konten.',
    parameters: jsonSchema({
      type: 'object',
      properties: { prompt: { type: 'string' } },
      additionalProperties: true,
    }),
    execute: async () => {
      try {
        const posts = await aiRepository.getCmsPosts();
        return { success: true, posts };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  }),

  // ─── WRITE TOOLS ─────────────────────────────────────────────────────────────
  // All write tools return { requiresConfirmation: true, type, draft }
  // Draft is normalized by tool-normalizer before being used.
  // GlobalModal renders the native form, user confirms, then server action runs.

  create_task: tool({
    description: 'Buat draft task baru. Panggil ini ketika user ingin membuat tugas baru. Isi field sebisa mungkin dari konteks, field yang kosong akan diisi default. Selalu konfirmasi sebelum menyimpan.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        title:       { type: 'string', description: 'Judul task. Jika tidak ada, gunakan "Tugas Baru".' },
        description: { type: 'string', description: 'Detail tambahan.' },
        priority:    { type: 'string', description: 'Prioritas: rendah, normal, tinggi, kritis. Default: normal.' },
        status:      { type: 'string', description: 'Status: belum_dimulai, sedang_dikerjakan, selesai, ditunda. Default: belum_dimulai.' },
        due_date:    { type: 'string', description: 'Batas waktu format YYYY-MM-DD. Opsional.' },
      },
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('create_task', args);
      return { requiresConfirmation: true, type: 'create_task', draft };
    },
  }),

  update_task: tool({
    description: 'Update task yang sudah ada. Panggil get_active_tasks dulu untuk mendapatkan task_id. Bisa update sebagian field saja.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        task_id:     { type: 'string', description: 'UUID task yang akan diupdate.' },
        title:       { type: 'string', description: 'Judul baru (opsional).' },
        description: { type: 'string', description: 'Deskripsi baru (opsional).' },
        priority:    { type: 'string', description: 'Prioritas baru (opsional).' },
        status:      { type: 'string', description: 'Status baru (opsional).' },
        due_date:    { type: 'string', description: 'Deadline baru format YYYY-MM-DD (opsional).' },
      },
      required: ['task_id'],
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('update_task', args);
      return { requiresConfirmation: true, type: 'update_task', draft };
    },
  }),

  update_task_status: tool({
    description: 'Update status task. Panggil get_active_tasks dulu untuk mendapatkan task_id. Gunakan untuk "mark selesai", "tandai sedang dikerjakan", dll.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'UUID task yang akan diupdate.' },
        status:  { type: 'string', description: 'Status baru: belum_dimulai, sedang_dikerjakan, selesai, ditunda.' },
      },
      required: ['task_id', 'status'],
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('update_task_status', args);
      return { requiresConfirmation: true, type: 'update_task_status', draft };
    },
  }),

  delete_task: tool({
    description: 'Hapus task. Panggil get_active_tasks dulu untuk mendapatkan task_id. Selalu konfirmasi sebelum menghapus.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'UUID task yang akan dihapus.' },
      },
      required: ['task_id'],
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('delete_task', args);
      return { requiresConfirmation: true, type: 'delete_task', draft };
    },
  }),

  create_goal: tool({
    description: 'Buat draft goal baru. Panggil ketika user ingin menambah goal atau tujuan. Isi semua field dari konteks, field kosong diisi default.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        title:       { type: 'string', description: 'Judul goal.' },
        description: { type: 'string', description: 'Deskripsi goal (opsional).' },
        goal_type:   { type: 'string', description: 'Tipe: mingguan, bulanan, tahunan, lifetime. Default: bulanan.' },
        target_date: { type: 'string', description: 'Target tanggal YYYY-MM-DD (opsional).' },
        category:    { type: 'string', description: 'Kategori: karir, kesehatan, belajar, personal, dll. Default: Umum.' },
      },
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('create_goal', args);
      return { requiresConfirmation: true, type: 'create_goal', draft };
    },
  }),

  update_goal: tool({
    description: 'Update goal yang ada. Panggil get_goals_progress dulu untuk goal_id. Bisa update progres, status, atau detail lainnya.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        goal_id:     { type: 'string', description: 'UUID goal yang akan diupdate.' },
        title:       { type: 'string', description: 'Judul baru (opsional).' },
        description: { type: 'string', description: 'Deskripsi baru (opsional).' },
        progress:    { type: 'number', description: 'Progres 0-100 (opsional).' },
        status:      { type: 'string', description: 'Status: active, completed, paused (opsional).' },
        target_date: { type: 'string', description: 'Target tanggal baru YYYY-MM-DD (opsional).' },
      },
      required: ['goal_id'],
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('update_goal', args);
      return { requiresConfirmation: true, type: 'update_goal', draft };
    },
  }),

  create_diary_entry: tool({
    description: 'Buat draft entri diary/jurnal. Panggil ketika user ingin mencatat refleksi, pengalaman, atau perasaan hari ini.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        content:    { type: 'string', description: 'Isi refleksi atau catatan.' },
        mood:       { type: 'string', description: 'Mood: happy, neutral, sad, productive, stressed, tired, sick. Default: neutral.' },
        title:      { type: 'string', description: 'Judul entri (opsional, default: Catatan AI).' },
        entry_date: { type: 'string', description: 'Tanggal entri YYYY-MM-DD (default: hari ini).' },
      },
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('create_diary_entry', args);
      return { requiresConfirmation: true, type: 'create_diary_entry', draft };
    },
  }),

  create_finance_transaction: tool({
    description: 'Buat draft transaksi keuangan (pemasukan atau pengeluaran). Gunakan ketika user menyebutkan pengeluaran, pembelian, atau pemasukan. PENTING: amount harus berupa angka.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        type:             { type: 'string', description: 'Jenis: income (pemasukan) atau expense (pengeluaran).' },
        amount:           { type: 'number', description: 'Jumlah uang dalam Rupiah. Contoh: 15000 bukan "15.000".' },
        category:         { type: 'string', description: 'Kategori: Makanan, Transportasi, Utilitas, Belanja, Hiburan, Pendapatan, dll. Bisa kosong, akan diisi otomatis.' },
        description:      { type: 'string', description: 'Keterangan transaksi (opsional).' },
        transaction_date: { type: 'string', description: 'Tanggal YYYY-MM-DD (default: hari ini).' },
      },
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('create_finance_transaction', args);
      return { requiresConfirmation: true, type: 'create_finance_transaction', draft };
    },
  }),

  create_note: tool({
    description: 'Buat draft catatan baru di second brain. Gunakan ketika user ingin mencatat ide, informasi, atau pengetahuan.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        title:       { type: 'string', description: 'Judul catatan.' },
        content:     { type: 'string', description: 'Isi catatan (opsional).' },
        is_favorite: { type: 'boolean', description: 'Tandai sebagai favorit (default: false).' },
      },
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('create_note', args);
      return { requiresConfirmation: true, type: 'create_note', draft };
    },
  }),

  create_project: tool({
    description: 'Buat draft project baru. Gunakan ketika user ingin memulai proyek baru.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        title:       { type: 'string', description: 'Nama project.' },
        description: { type: 'string', description: 'Deskripsi project (opsional).' },
        status:      { type: 'string', description: 'Status: planning, active, paused, completed, archived. Default: active.' },
        start_date:  { type: 'string', description: 'Tanggal mulai YYYY-MM-DD (opsional).' },
        end_date:    { type: 'string', description: 'Tanggal selesai YYYY-MM-DD (opsional).' },
      },
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('create_project', args);
      return { requiresConfirmation: true, type: 'create_project', draft };
    },
  }),

  update_project: tool({
    description: 'Update project yang ada. Panggil get_active_projects dulu untuk project_id.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        project_id:  { type: 'string', description: 'UUID project yang akan diupdate.' },
        title:       { type: 'string', description: 'Nama baru (opsional).' },
        description: { type: 'string', description: 'Deskripsi baru (opsional).' },
        status:      { type: 'string', description: 'Status baru (opsional).' },
        end_date:    { type: 'string', description: 'Tanggal selesai baru (opsional).' },
      },
      required: ['project_id'],
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('update_project', args);
      return { requiresConfirmation: true, type: 'update_project', draft };
    },
  }),

  create_achievement: tool({
    description: 'Buat draft pencapaian/achievement baru. Gunakan ketika user berhasil meraih sesuatu.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        title:            { type: 'string', description: 'Judul pencapaian.' },
        description:      { type: 'string', description: 'Deskripsi pencapaian (opsional).' },
        category:         { type: 'string', description: 'Kategori: Akademik, Karir, Personal, Teknologi, dll. Default: Personal.' },
        achievement_date: { type: 'string', description: 'Tanggal pencapaian YYYY-MM-DD (default: hari ini).' },
      },
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('create_achievement', args);
      return { requiresConfirmation: true, type: 'create_achievement', draft };
    },
  }),

  create_cms_post: tool({
    description: 'Buat draft post CMS baru: thread, artikel, image post, video post, atau project update. Gunakan untuk semua kebutuhan konten publik.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        title:     { type: 'string', description: 'Judul post.' },
        post_type: { type: 'string', description: 'Tipe: text, thread, image, video, article, project_update. Default: article.' },
        body:      { type: 'string', description: 'Isi konten (opsional).' },
      },
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = normalizeDraft('create_cms_post', args);
      return { requiresConfirmation: true, type: 'create_cms_post', draft };
    },
  }),

  edit_cms_post: tool({
    description: 'Edit post CMS yang sudah ada. Panggil get_cms_posts dulu untuk post_id.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        post_id:   { type: 'string', description: 'UUID post yang akan diedit.' },
        title:     { type: 'string', description: 'Judul baru (opsional).' },
        body:      { type: 'string', description: 'Konten baru (opsional).' },
        post_type: { type: 'string', description: 'Tipe baru (opsional).' },
      },
      required: ['post_id'],
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      return { requiresConfirmation: true, type: 'edit_cms_post', draft: args };
    },
  }),

  publish_post: tool({
    description: 'Publikasikan post CMS. Panggil get_cms_posts dulu untuk post_id.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        post_id: { type: 'string', description: 'UUID post yang akan dipublikasikan.' },
      },
      required: ['post_id'],
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      return { requiresConfirmation: true, type: 'publish_post', draft: args };
    },
  }),

  create_habit: tool({
    description: 'Buat draft habit/kebiasaan baru. Gunakan ketika user ingin membangun kebiasaan baru atau rutinitas harian/mingguan.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        title:            { type: 'string', description: 'Nama habit. Contoh: "Olahraga 30 menit", "Baca buku", "Meditasi".' },
        description:      { type: 'string', description: 'Deskripsi habit (opsional).' },
        target_frequency: { type: 'string', description: 'Frekuensi: daily (harian), weekly (mingguan), monthly (bulanan). Default: daily.' },
      },
      additionalProperties: true,
    }),
    execute: async (args: Record<string, unknown>) => {
      const draft = {
        title: String(args.title || 'Habit Baru'),
        description: String(args.description || ''),
        target_frequency: String(args.target_frequency || 'daily'),
        active: true,
      };
      return { requiresConfirmation: true, type: 'create_habit', draft };
    },
  }),
};
