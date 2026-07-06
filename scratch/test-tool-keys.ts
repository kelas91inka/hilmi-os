import { tool } from 'ai';
import { z } from 'zod';

const t = tool({
  description: 'test',
  parameters: z.object({ title: z.string() })
});

console.log(Object.keys(t));
