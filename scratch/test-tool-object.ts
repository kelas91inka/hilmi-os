import { tool, jsonSchema } from 'ai';
import { z } from 'zod';

const myToolZod = tool({
  description: 'Zod test',
  parameters: z.object({
    title: z.string().describe('Judul task')
  })
});

const myToolJson = tool({
  description: 'JSON test',
  parameters: jsonSchema({
    type: 'object',
    properties: {
      title: { type: 'string' }
    }
  })
});

console.log("Zod Tool:");
console.log(JSON.stringify(myToolZod, null, 2));

console.log("\nJSON Tool:");
console.log(JSON.stringify(myToolJson, null, 2));
