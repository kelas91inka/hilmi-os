import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

async function run() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init: any) => {
    if (typeof url === 'string' && url.includes('api.openai.com')) {
      console.log("\n====== 🚨 RAW OPENAI PAYLOAD 🚨 ======");
      const body = JSON.parse(init.body);
      console.log("Tools sent to OpenAI:", JSON.stringify(body.tools, null, 2));
      console.log("======================================\n");
    }
    return originalFetch(url, init);
  };

  const openai = createOpenAI({ apiKey: 'fake-key' });
  const model = openai('gpt-4o');

  try {
    await streamText({
      model,
      system: 'Test',
      messages: [{ role: 'user', content: 'test' }],
      tools: {
        create_task: tool({
          description: 'Create task',
          parameters: z.object({
            title: z.string().describe('Judul task'),
            priority: z.enum(['high', 'low']).default('high')
          })
        })
      }
    });
  } catch (e: any) {}
}

run();
