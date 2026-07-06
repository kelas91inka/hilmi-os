import { moduleRegistry } from './module-registry';
import { IKnowledgeProvider } from './types';
import { telemetryLogger } from './telemetry';

export class IntentResolver {
  /**
   * Resolves the user query to a list of required modules.
   * Stage 1: Rule-based fast resolution using keyword/regex lookup.
   * Stage 2: (Optional future fallback) LLM classification if ambiguity is high.
   */
  async resolve(query: string): Promise<IKnowledgeProvider[]> {
    const start = Date.now();
    const lowerQuery = query.toLowerCase();
    const providers = moduleRegistry.getAll();
    const selected: IKnowledgeProvider[] = [];

    for (const provider of providers) {
      // Check if any keyword or phrase exists in the query
      const matches = provider.keywords.some(keyword => {
        // Simple regex to match whole words or specific phrases
        const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
        return regex.test(lowerQuery);
      });

      if (matches) {
        selected.push(provider);
      }
    }

    let intentMethod: 'rule-based' | 'llm-fallback' = 'rule-based';

    // Stage 2 Fallback Simulation
    // If no modules match via rules, we could invoke a lightweight LLM here.
    // For now, if empty, we assume no context is needed.
    if (selected.length === 0) {
      // Example of where LLM fallback would trigger
      // const llmResult = await fallbackLLMIntent(query);
      // intentMethod = 'llm-fallback';
    }

    telemetryLogger.logIntentMethod(intentMethod, Date.now() - start);

    return selected;
  }
}

export const intentResolver = new IntentResolver();
