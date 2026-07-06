import { KnowledgeContext } from './types';

export class ContextBuilder {
  /**
   * Assembles multiple KnowledgeContext objects into a single, highly readable
   * markdown string for the LLM's system prompt.
   * Avoids duplication and formats cleanly.
   */
  build(contexts: KnowledgeContext[]): string {
    if (!contexts || contexts.length === 0) {
      return '';
    }

    let result = '### KNOWLEDGE CONTEXT\n';
    result += 'Gunakan informasi di bawah ini (yang relevan) untuk menjawab user. Jangan menyalin ulang seluruh teks ini, cukup rujuk jika perlu.\n\n';

    for (const context of contexts) {
      if (context.items.length === 0) continue;

      result += `#### Module: ${context.moduleName}\n`;
      for (const item of context.items) {
        // Group by title
        result += `- **${item.title}**: ${item.content}\n`;
      }
      result += '\n';
    }

    return result.trim();
  }
}

export const contextBuilder = new ContextBuilder();
