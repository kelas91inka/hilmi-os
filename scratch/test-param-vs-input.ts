import { createGroq } from '@ai-sdk/groq';
import { streamText, tool, jsonSchema } from 'ai';

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
      system: 'You are an AI assistant. Use create_task tool to create a task.',
      messages: [{ role: 'user', content: 'Buat tugas mengirim hadiah hari ini' }],
      tools: {
        create_task: tool({
          description: 'Create task',
          parameters: jsonSchema({
            type: 'object',
            properties: {
              title: { type: 'string' }
            },
            additionalProperties: false
          }),
          inputSchema: jsonSchema({
            type: 'object',
            properties: {
              title: { type: 'string' }
            },
            additionalProperties: false
          })
        } as any)
      },
      maxSteps: 1
    });

    for await (const chunk of result.fullStream) {
      if (chunk.type === 'tool-call') {
        console.log("Tool call from model:", chunk);
      }
    }
  } catch (error: any) {
    console.error("ERROR", error.message);
  }
}

run();
