import { z } from 'zod';
// We need to import the bundled zodToJsonSchema from provider-utils somehow, but it's not exported.
// Let's import `asSchema` and get the jsonSchema from it!
import { asSchema } from '@ai-sdk/provider-utils';

const schema = z.object({
  title: z.string().describe('Judul task')
});

async function run() {
  const wrapped = asSchema(schema as any);
  console.log("asSchema Result:");
  console.log(JSON.stringify(wrapped.jsonSchema, null, 2));
}

run();
