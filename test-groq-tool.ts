import { createGroq } from '@ai-sdk/groq';
import { generateText, tool, jsonSchema } from 'ai';

async function main() {
  const model = createGroq({ apiKey: process.env.AI_API_KEY })('llama-3.1-8b-instant');
  
  const myTool = tool({
    description: 'Buat tugas baru',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Judul tugas (wajib).' },
      },
      required: ['title'],
    })
  });

  const { text, toolCalls } = await generateText({
    model,
    prompt: 'buat tugas menyiapkan berkas beasiswa unggulan minggu ini',
    tools: { create_task: myTool },
  });

  console.log("Text:", text);
  console.log("Tool calls:", JSON.stringify(toolCalls, null, 2));
}

main().catch(console.error);
