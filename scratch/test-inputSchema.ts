import { tool, jsonSchema } from 'ai';

const myToolJson = tool({
  description: 'JSON test',
  inputSchema: jsonSchema({
    type: 'object',
    properties: {
      title: { type: 'string' }
    }
  })
} as any);

console.log("\nJSON Tool with inputSchema:");
console.log(JSON.stringify(myToolJson, null, 2));
