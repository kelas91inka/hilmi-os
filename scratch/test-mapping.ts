import { tool, jsonSchema } from 'ai';
import { asSchema } from '@ai-sdk/provider-utils';

const t = tool({
  description: 'test',
  parameters: jsonSchema({
    type: 'object',
    properties: {
      title: { type: 'string' }
    }
  })
});

async function run() {
  const schema = asSchema(t.parameters);
  const result = await schema.jsonSchema;
  console.log(JSON.stringify(result, null, 2));
}

run();
