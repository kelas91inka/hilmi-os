import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import fs from 'fs';

// Manually parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    envVars[key] = value;
  }
});

const provider = createOpenAI({
  apiKey: envVars.AI_API_KEY || '',
  baseURL: 'https://api.groq.com/openai/v1'
});

async function testChat() {
  console.log('Testing Groq Chat...');
  console.log('API Key Present:', !!envVars.AI_API_KEY);

  try {
    const result = streamText({
      model: provider('llama-3.3-70b-versatile'),
      messages: [{ role: 'user', content: 'Halo, siapa namamu?' }],
    });

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log('\nSuccess!');
  } catch (error) {
    console.error('Error during chat stream:', error);
  }
}

testChat();
