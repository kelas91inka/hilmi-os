import { jsonSchema, tool } from 'ai';
import { systemTools } from '../src/features/ai/tools/system-tools';

console.log("=== Testing systemTools.create_task ===");
const create_task = systemTools.create_task as any;
console.log("Parameters schema:");
console.log(JSON.stringify(create_task.parameters, null, 2));

const schema = jsonSchema({
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' }
  },
  additionalProperties: false
});

console.log("=== Testing jsonSchema ===");
console.log(JSON.stringify(schema, null, 2));
