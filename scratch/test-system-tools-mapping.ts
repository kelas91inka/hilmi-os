import { asSchema } from '@ai-sdk/provider-utils';
import { systemTools } from '../src/features/ai/tools/system-tools';

async function run() {
  const t = systemTools.create_task;
  const schema = asSchema(t.parameters);
  const result = await schema.jsonSchema;
  console.log("systemTools.create_task Schema:");
  console.log(JSON.stringify(result, null, 2));
}

run();
