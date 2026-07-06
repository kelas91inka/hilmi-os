import { z } from 'zod';
import { tool } from 'ai';

const myTool = tool({
  description: 'test tool',
  parameters: z.object({
    title: z.string(),
  }),
  execute: async (args) => {
    return args;
  }
});
console.log("myTool created successfully with zod");
