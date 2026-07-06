import { createGroq } from '@ai-sdk/groq';
import { streamText, isLoopFinished } from 'ai';
import { systemTools } from '../src/features/ai/tools/system-tools';
import { performance } from 'perf_hooks';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const model = createGroq({ apiKey })('llama-3.1-8b-instant');

  console.log("Measuring performance...");

  const start = performance.now();
  let firstChunkTime = -1;

  try {
    const result = streamText({
      model,
      system: "Anda asisten. Jawab singkat.",
      messages: [{ role: 'user', content: 'Halo, siapa namamu?' }],
      tools: systemTools,
      maxSteps: 5,
      temperature: 0.3,
      maxTokens: 100,
      stopWhen: isLoopFinished(),
    });

    for await (const chunk of result.fullStream) {
      if (firstChunkTime === -1) {
        firstChunkTime = performance.now();
        console.log(`TTFB: ${((firstChunkTime - start) / 1000).toFixed(2)}s`);
      }
    }
    const end = performance.now();
    console.log(`Total Time: ${((end - start) / 1000).toFixed(2)}s`);
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

run();
