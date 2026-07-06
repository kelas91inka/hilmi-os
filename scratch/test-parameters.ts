import { createGroq } from '@ai-sdk/groq';
import { streamText, tool, jsonSchema } from 'ai';
import { z } from 'zod';

async function run() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init: any) => {
    if (typeof url === 'string' && url.includes('groq.com')) {
      const body = JSON.parse(init.body);
      console.log("Tools sent to Groq:", JSON.stringify(body.tools, null, 2));
    }
    return originalFetch(url, init);
  };

  const groq = createGroq({ apiKey: process.env.AI_API_KEY });
  const model = groq('llama-3.1-8b-instant');

  try {
    const result = await streamText({
      model,
      system: 'You are an AI assistant. Use create_task tool to create a task.',
      messages: [{ role: 'user', content: 'Buat tugas mengirim hadiah hari ini' }],
      tools: {
        create_task: tool({
          description: 'Create task',
          parameters: z.object({
            title: z.string()
          })
        })
      },
      maxSteps: 1
    });

    for await (const chunk of result.fullStream) {}
  } catch (error: any) {
    console.error("ERROR", error.message);
  }
}

run();
