/* eslint-disable */
// @ts-nocheck
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, type CoreMessage } from 'ai';
import { aiRepository } from '@/features/ai/repositories/ai.repository';
import { systemTools } from '@/features/ai/tools/system-tools';

const provider = createOpenAI({
  apiKey: process.env.AI_API_KEY || '',
  baseURL: 'https://api.groq.com/openai/v1'
});

export async function POST(req: Request) {
  try {
    if (!process.env.AI_API_KEY) {
      return new Response(JSON.stringify({ error: "AI_API_KEY is required in environment variables." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const { messages, conversationId, systemContext } = await req.json();

  if (!conversationId) {
    return new Response('Conversation ID is required', { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage && lastMessage.role === 'user') {
    try {
      await aiRepository.saveMessage(conversationId, 'user', lastMessage.content || '');
    } catch (e) {
      console.error('Failed to save user message:', e);
    }
  }

  function mapUIMessagesToCore(msgs: any[]): CoreMessage[] {
    const core: CoreMessage[] = [];
    for (const m of msgs) {
      if (m.role === 'user') {
        core.push({ role: 'user', content: m.content || '' });
      } else if (m.role === 'assistant') {
        if (!m.toolInvocations || m.toolInvocations.length === 0) {
          core.push({ role: 'assistant', content: m.content || '' });
          continue;
        }

        const toolCalls = m.toolInvocations.map((t: any) => ({
          type: 'tool-call' as const,
          toolCallId: t.toolCallId,
          toolName: t.toolName,
          args: t.args || {}
        }));
        core.push({
          role: 'assistant',
          content: m.content ? [{ type: 'text' as const, text: m.content }, ...toolCalls] : toolCalls
        });

        const toolResults = m.toolInvocations.filter((t: any) => t.state === 'result');
        if (toolResults.length > 0) {
          core.push({
            role: 'tool',
            content: toolResults.map((t: any) => ({
              type: 'tool-result' as const,
              toolCallId: t.toolCallId,
              toolName: t.toolName,
              result: t.result
            }))
          });
        }
      }
    }
    return core;
  }

  const coreMessages = mapUIMessagesToCore(messages);

  // Filter out any messages that have empty content and no tool calls, which Groq rejects
  const safeCoreMessages = coreMessages.filter(m => {
    if (m.role === 'assistant') {
      const hasText = typeof m.content === 'string' && m.content.trim() !== '';
      const hasParts = Array.isArray(m.content) && m.content.length > 0;
      const hasToolCalls = m.toolCalls && m.toolCalls.length > 0;
      return hasText || hasParts || hasToolCalls;
    }
    return true;
  });

  const result = streamText({
    model: provider(process.env.AI_API_KEY?.startsWith('gsk_') ? 'llama-3.3-70b-versatile' : 'gpt-3.5-turbo'),
    system: `Anda adalah Hilmi OS Assistant, asisten AI cerdas yang terintegrasi langsung dalam sistem operasi personal milik Muhammad Hilmi Mu'afa.
Karakter Anda: Profesional, efisien, solutif, dan sangat mendukung Hilmi sebagai seorang technology enthusiast, network engineer, dan web developer. Gaya bahasa Anda bersahabat, natural, namun tetap sopan selayaknya rekan kerja strategis (co-pilot).

${systemContext ? `[KONTEKS SAAT INI]\nHilmi sedang berada di halaman/konteks: "${systemContext}". Berikan jawaban yang relevan dengan konteks ini jika diperlukan.\n` : ''}
INSTRUKSI KRITIKAL (WAJIB DIIKUTI):
1. JANGAN PERNAH MENGARANG JAWABAN (HALUSINASI) tentang tugas, proyek, tujuan (goals), kebiasaan (habits), catatan, atau jurnal milik Hilmi.
2. SEBELUM menjawab pertanyaan tentang data Hilmi, Anda WAJIB memanggil tool/fungsi yang relevan untuk membaca data dari database terlebih dahulu (contoh: get_active_tasks, get_active_projects, get_goals_progress, dll).
3. Anda BUKAN chatbot generik. Anda adalah asisten yang context-aware. Jawaban Anda harus selalu didasari oleh data aktual dari database.
4. Saat Hilmi bertanya "Apa fokus saya hari ini?" atau "Apa tugas saya?", panggil tool get_active_tasks. Lalu analisa tugas dengan prioritas tinggi/kritis dan deadline terdekat.
5. Saat membuat tugas via tool create_task, gunakan prioritas: 'rendah', 'normal', 'tinggi', atau 'kritis' (bukan bahasa Inggris).
6. Selalu gunakan Bahasa Indonesia yang natural dan ramah.`,
    messages: safeCoreMessages,
    tools: systemTools,
    maxSteps: 5,
  });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('API Chat Route Error:', error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
