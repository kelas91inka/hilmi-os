import { createGroq } from '@ai-sdk/groq';
import { streamText, tool } from 'ai';
import { z } from 'zod';

async function run() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init: any) => {
    if (typeof url === 'string' && url.includes('groq.com')) {
      console.log("\n====== 🚨 RAW GROQ PAYLOAD 🚨 ======");
      const body = JSON.parse(init.body);
      console.log("Tools sent to Groq:", JSON.stringify(body.tools, null, 2));
      console.log("====================================\n");
    }
    return originalFetch(url, init);
  };

  const groq = createGroq({ apiKey: process.env.AI_API_KEY });
  const model = groq('llama-3.1-8b-instant');

  try {
    const result = await streamText({
      model,
      system: 'Test',
      messages: [{ role: 'user', content: 'test' }],
      tools: {
        create_task: tool({
          description: 'Create task',
          parameters: z.object({
            title: z.string().describe('Judul task'),
            priority: z.enum(['high', 'low']).default('high')
          }).strict()
        })
      }
    });

    for await (const chunk of result.fullStream) {}
  } catch (e: any) {}
}

run();
