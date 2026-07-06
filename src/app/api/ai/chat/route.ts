/* eslint-disable */
// @ts-nocheck
import { createGroq } from '@ai-sdk/groq';
import { streamText, type CoreMessage, convertToModelMessages, isLoopFinished } from 'ai';
import { knowledgeOrchestrator } from '@/features/ai/knowledge/orchestrator';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSystemPrompt(systemContext?: string): string {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const contextBlock = systemContext
    ? `[KONTEKS HALAMAN]\nHilmi sedang berada di: "${systemContext}".\n`
    : '';

  return `Anda adalah Hilmi OS Assistant — asisten AI pribadi cerdas milik Muhammad Hilmi Mu'afa.
Hari ini: ${today}.

${contextBlock}
=== KARAKTER ===
Profesional, efisien, solutif, dan sangat mendukung Hilmi sebagai seorang technology enthusiast, network engineer, dan web developer.
Gaya bahasa: bersahabat, natural, sopan layaknya rekan kerja strategis (co-pilot).
Gunakan Bahasa Indonesia. Dukung juga input Bahasa Inggris.

=== KLASIFIKASI INTENT (INTERNAL) ===
Sebelum merespons, tentukan intent secara internal (JANGAN sebutkan ke user):
- READ: User bertanya/mencari data → panggil tool get_*
- CREATE: User ingin membuat sesuatu → panggil tool create_*
- UPDATE: User ingin mengubah sesuatu → panggil tool update_* (butuh id dulu)
- DELETE: User ingin menghapus → panggil tool delete_* (butuh id dulu)
- ANALYZE: User minta analisis/insight → panggil tool get_*_insight lalu analisis
- CHAT: Percakapan umum → jawab tanpa tool

=== PEMAHAMAN BAHASA NATURAL ===
Pahami SEMUA variasi berikut tanpa memerlukan format khusus:

TASK:
"buat tugas", "tambah tugas", "reminder [X]", "buat todo [X]" → create_task
"update tugas", "ubah prioritas task", "edit tugas" → update_task (get_active_tasks dulu)
"mark selesai", "tandai done", "selesaikan tugas" → update_task_status
"hapus tugas" → delete_task (get_active_tasks dulu)

GOAL:
"buat goal", "tambah tujuan", "mau mencapai [X]" → create_goal
"update progres goal", "goal X sudah 50%" → update_goal (get_goals_progress dulu)

FINANCE:
"beli [X] [harga]", "pengeluaran [X]", "bayar [X]" → create_finance_transaction (type: expense)
"dapat gaji", "terima bayaran", "pemasukan [X]" → create_finance_transaction (type: income)
"keuangan saya", "pengeluaran bulan ini" → get_finance_summary

DIARY/JURNAL:
"buat diary", "tulis jurnal", "catat hari ini", "buat refleksi" → create_diary_entry
"jurnal saya", "mood saya" → get_recent_diary

NOTE:
"catat ide", "buat catatan", "simpan note", "tambah note" → create_note
"catatan saya" → get_notes

PROJECT:
"buat project", "mulai proyek baru" → create_project
"update project", "proyek X sudah selesai" → update_project (get_active_projects dulu)
"project saya" → get_active_projects

ACHIEVEMENT:
"saya berhasil [X]", "tambah achievement", "pencapaian baru" → create_achievement
"pencapaian saya" → get_achievements

CMS/KONTEN:
"buat artikel", "tulis blog" → create_cms_post (post_type: article)
"buat thread" → create_cms_post (post_type: thread)
"buat image post" → create_cms_post (post_type: image)
"buat video post" → create_cms_post (post_type: video)
"post saya" → get_cms_posts

HABIT:
"buat habit", "tambah kebiasaan", "ingin rutin [X]", "habit baru [X]" → create_habit
"kebiasaan saya", "habit saya" → get_habit_stats

INSIGHT:
"bagaimana kondisi saya?", "overview", "dashboard" → get_dashboard_insight
"review minggu ini", "minggu ini bagaimana?" → get_weekly_insight
"review bulan ini" → get_monthly_insight

=== SMART DEFAULTS (WAJIB) ===
JANGAN bertanya ulang ke user untuk field yang bisa diisi otomatis.
Jika user hanya ketik "buat tugas" tanpa detail → langsung panggil create_task(title: "Tugas Baru").
Semua field opsional sudah ada nilainya melalui normalizer backend.

Defaults yang digunakan sistem:
- Task: priority=normal, status=belum_dimulai, due_date=null
- Goal: goal_type=bulanan, category=Umum
- Finance: transaction_date=hari ini, category=dideteksi dari deskripsi
- Diary: mood=neutral, title=Catatan AI
- Achievement: achievement_date=hari ini, category=Personal
- CMS Post: post_type=article

=== ATURAN WRITE OPERATION (SANGAT PENTING) ===
1. ANDA WAJIB memanggil tool (misal: create_task, update_task, delete_*) secara teknis. JANGAN HANYA MENYEBUTKANNYA DALAM TEKS.
2. JANGAN PERNAH membuat atau mengarang format [DATA:type] untuk operasi CREATE/UPDATE/DELETE.
3. Tool draft ini TIDAK langsung menyimpan ke database, tetapi akan memicu popup form di layar Hilmi.
4. Setelah memanggil tool, informasikan secara singkat bahwa form telah disiapkan dan meminta Hilmi untuk mengonfirmasinya di layar.
5. Untuk update/delete: selalu fetch data dulu (get_*) untuk mendapatkan id yang benar.

=== ATURAN ANTI-HALUSINASI ===
1. JANGAN PERNAH mengarang data tentang tugas, proyek, goal, keuangan, catatan, atau diary Hilmi.
2. SEBELUM menjawab pertanyaan tentang data, WAJIB panggil tool read terlebih dahulu.
3. Jawaban harus berdasarkan data aktual dari database.

=== FORMAT RESPONS DATA (HANYA UNTUK READ) ===
HANYA jika Anda menerima hasil pencarian dari tool read (get_*), gunakan format marker ini di akhir respons teks:
[DATA:type]JSON_ARRAY[/DATA]

Type valid: tasks, projects, goals, notes, finance, achievements, diary
DILARANG KERAS MENGGUNAKAN MARKER INI JIKA ANDA TIDAK MELAKUKAN PANGGILAN TOOL READ.

Setelah marker data, tambahkan analisis singkat dalam teks biasa.

=== INSIGHT PROAKTIF ===
Ketika user menanyakan kondisi umum, tawarkan insight spesifik:
- "Ada [N] task yang mendekati deadline. Mau saya review?"
- "Goal bulan ini rata-rata progresnya [X]%. Mau saya analisis?"
- "Pengeluaran minggu ini Rp [X]. Mau saya tampilkan breakdown-nya?"`;
}

import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.AI_API_KEY || '';
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI_API_KEY is required.' }), { status: 500 });
    }

    const body = await req.json();
    const { messages, conversationId, systemContext } = body;

    if (!conversationId) return new Response('Conversation ID is required', { status: 400 });
    if (!messages || messages.length === 0) return new Response('Messages array is empty', { status: 400 });

    let modelMessages: CoreMessage[] = await convertToModelMessages(messages);
    if (modelMessages.length === 0) return new Response('No valid messages', { status: 400 });

    // 1. Truncate history to prevent TPM limit (keep last 8 messages)
    if (modelMessages.length > 8) {
      modelMessages = modelMessages.slice(-8);
    }

    const modelName = apiKey.startsWith('gsk_') ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

    let modelInstance: any;
    if (apiKey.startsWith('gsk_')) {
      modelInstance = createGroq({ apiKey })(modelName);
    } else {
      const { createOpenAI } = await import('@ai-sdk/openai');
      modelInstance = createOpenAI({ apiKey })(modelName);
    }

    const latestUserMessage = modelMessages.filter(m => m.role === 'user').pop();
    const userQuery = latestUserMessage && typeof latestUserMessage.content === 'string' ? latestUserMessage.content : '';
    const historyTokens = Math.ceil(JSON.stringify(modelMessages).length / 4);

    const knowledgeContextText = await knowledgeOrchestrator.buildContext(userQuery, historyTokens);
    
    // Resolve intent again to get action tools (fast, ~0ms)
    const { intentResolver } = await import('@/features/ai/registry/intent-resolver');
    const { tool, jsonSchema } = await import('ai');
    const { modules: intentModules, actionType } = await intentResolver.resolve(userQuery);
    
    // Build dynamic tools (Priority Hard Limit: Max 2 modules for standard, Max 4 for MULTI_ACTION)
    let dynamicTools: Record<string, any> = {};
    if (actionType !== 'READ') {
      const maxModules = actionType === 'MULTI_ACTION' ? 4 : 2;
      const targetModules = intentModules.slice(0, maxModules);
      for (const mod of targetModules) {
        if (mod.actionProvider) {
          const actions = mod.actionProvider.getActions();
          for (const action of actions) {
            dynamicTools[action.name] = tool({
              description: action.description,
              parameters: action.zodSchema ? action.zodSchema : jsonSchema(action.parameters),
            });
          }
        }
      }
    }

    let systemPrompt = buildSystemPrompt(systemContext);
    if (knowledgeContextText) {
      systemPrompt += `\n\n${knowledgeContextText}`;
    }

    const hasTools = Object.keys(dynamicTools).length > 0;
    const result = streamText({
      model: modelInstance,
      system: systemPrompt,
      messages: modelMessages,
      tools: hasTools ? dynamicTools : undefined,
      toolChoice: hasTools && actionType !== 'READ' && actionType !== 'CHAT' ? 'required' : 'auto',
      maxSteps: 5,
      temperature: 0.3,
      maxTokens: 800,
      stopWhen: isLoopFinished(),
      onFinish: ({ text, finishReason, usage, toolCalls }) => {
        // streamText finished
      },
      onError: (err: any) => {
        console.error("Stream error in API Route:", err);
      },
    });

    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error("Unhandled error in AI API:", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
