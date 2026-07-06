import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';
import { systemTools } from '../src/features/ai/tools/system-tools';

async function run() {
  console.log("Running simulation...");
  
  // Intercept fetch to see exactly what goes to Groq
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
      tools: systemTools,
      maxSteps: 1
    });

    for await (const chunk of result.fullStream) {
      if (chunk.type === 'tool-call') {
        console.log("Tool call from model:", chunk);
      }
    }
  } catch (error: any) {
    console.error("\n====== 🚨 ERROR 🚨 ======");
    console.error(error.message);
    if (error.cause) console.error(error.cause);
    console.error("=========================\n");
  }
}

run();
