import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { createClient } from '@/lib/supabase/server';

const provider = createOpenAI({
  apiKey: process.env.AI_API_KEY || '',
  baseURL: 'https://api.groq.com/openai/v1'
});

export async function GET(req: Request) {
  try {
    if (!process.env.AI_API_KEY) {
      return new Response(JSON.stringify({ error: "AI_API_KEY is required in environment variables." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 1. Fetch Tasks due today or overdue
    const today = new Date().toISOString().split('T')[0];
    const { data: tasks } = await supabase
      .from('tasks')
      .select('title, due_date, status, priority')
      .neq('status', 'selesai')
      .lte('due_date', today);

    // 2. Fetch Active Goals
    const { data: goals } = await supabase
      .from('goals')
      .select('title, progress')
      .neq('status', 'completed')
      .neq('status', 'archived')
      .limit(3);

    // 3. Fetch Habits for today
    const { data: habits } = await supabase
      .from('habits')
      .select('title');

    const promptData = `
    Berikut adalah ringkasan hari ini:
    - Tugas (Jatuh Tempo/Terlambat): ${tasks?.map(t => `${t.title} (${t.status}, prioritas: ${t.priority})`).join(', ') || 'Tidak ada'}
    - Goal Aktif: ${goals?.map(g => `${g.title} (${g.progress}%)`).join(', ') || 'Tidak ada'}
    - Kebiasaan (Habits): ${habits?.map(h => `${h.title}`).join(', ') || 'Tidak ada'}
    
    Buatlah briefing singkat dan proaktif untuk hari ini (maksimal 3-4 kalimat).
    Sapa "Hilmi" secara personal. 
    Fokus pada tindakan apa yang paling penting dilakukan hari ini. Jangan kaku.
    `;

    const { text } = await generateText({
      model: provider(process.env.AI_API_KEY?.startsWith('gsk_') ? 'llama-3.3-70b-versatile' : 'gpt-3.5-turbo'),
      system: `Anda adalah Hilmi OS Assistant. Anda bertugas memberikan Daily Briefing singkat yang menyemangati dan berorientasi pada tindakan.`,
      prompt: promptData,
    });

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('API Briefing Route Error:', error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
