import { createGroq } from '@ai-sdk/groq';
import { streamText, tool, jsonSchema } from 'ai';

async function run() {
  const groq = createGroq({ apiKey: process.env.AI_API_KEY });
  const model = groq('llama-3.1-8b-instant');
  
  const originalDoStream = model.doStream;
  model.doStream = async (options: any) => {
    console.log("\n====== 🚨 MODEL DO STREAM TOOLS 🚨 ======");
    console.log(JSON.stringify(options.tools, null, 2));
    console.log("=======================================\n");
    return originalDoStream.call(model, options);
  };

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
          })
        } as any)
      },
      maxSteps: 1
    });

    for await (const chunk of result.fullStream) {
    }
  } catch (error: any) {
  }
}

run();
