import { createOpenAI } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const provider = createOpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

async function run() {
  const result = await generateText({
    model: provider('llama-3.3-70b-versatile'),
    system: `Anda adalah Hilmi OS Assistant...
Anda memiliki akses ke tools (fungsi) untuk membaca database (tugas, proyek, goal, jurnal). Selalu panggil tools ini saat Hilmi bertanya tentang pekerjaannya atau meminta review.`,
    messages: [{ role: 'user', content: 'Apa saja project saya yang sedang aktif?' }],
    tools: {
      get_active_projects: tool({
        description: 'Fetch the user\'s currently active projects and their timelines to analyze project progress.',
        parameters: z.object({ prompt: z.string().optional() }),
        execute: async () => ({ success: true, projects: [] })
      })
    },
    maxSteps: 5
  });
  console.log(result.text);
  console.log('Tool calls:', result.toolCalls);
}
run();
