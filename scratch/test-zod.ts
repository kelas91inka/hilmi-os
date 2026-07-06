import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

console.log("Zod version:", (z as any).ZodFirstPartyTypeKind ? "3.x or 4.x" : "unknown");
const schema = z.object({
  title: z.string().describe('Judul task'),
  priority: z.enum(['high', 'low']).default('high')
});

console.log(JSON.stringify(zodToJsonSchema(schema), null, 2));
