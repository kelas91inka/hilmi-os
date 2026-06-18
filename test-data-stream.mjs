import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

if (!process.env.AI_API_KEY) {
  throw new Error("AI_API_KEY is required in environment variables.");
}

const provider = createOpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

const result = streamText({
  model: provider('llama-3.1-8b-instant'),
  messages: [{ role: 'user', content: 'Tolong buatkan Review Mingguan dari task saya' }],
  tools: {
    get_weekly_tasks: tool({
      description: 'Fetch tasks',
      parameters: z.object({}),
      execute: async () => {
        return { success: true, tasks: [] };
      }
    })
  },
  maxSteps: 5
});

const response = result.toDataStreamResponse();
const reader = response.body.getReader();
const decoder = new TextDecoder();
async function read() {
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log(decoder.decode(value));
  }
}
read();
