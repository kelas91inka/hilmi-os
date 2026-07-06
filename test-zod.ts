import { createGroq } from '@ai-sdk/groq';
import { generateText, tool } from 'ai';
import { z } from 'zod';

async function main() {
  const model = createGroq({ apiKey: process.env.AI_API_KEY })('llama-3.1-8b-instant');
  
  const myTool = tool({
    description: 'Buat tugas baru',
    parameters: z.object({
      title: z.string().describe('Judul tugas'),
    })
  });

  try {
    console.log("Generating text...");
    const { text, toolCalls } = await generateText({
      model,
      prompt: 'buat tugas membaca buku besok',
      tools: { create_task: myTool },
    });
    console.log("Text:", text);
    console.log("Tool calls:", JSON.stringify(toolCalls, null, 2));
  } catch (error) {
    console.error("Error generating text:", error);
  }
}

main().catch(console.error);
