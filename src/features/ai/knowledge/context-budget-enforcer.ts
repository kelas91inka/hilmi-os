import { KnowledgeContext, KnowledgeItem } from './types';

export class ContextBudgetEnforcer {
  /**
   * Enforces a strict token limit across all returned KnowledgeContexts.
   * If the combined size exceeds the budget, it globally drops lower-priority items
   * across all modules to ensure the most important context survives.
   */
  enforce(contexts: KnowledgeContext[], maxTokens: number): KnowledgeContext[] {
    let currentTokens = 0;
    
    // Calculate total initial tokens
    for (const ctx of contexts) {
      for (const item of ctx.items) {
        currentTokens += item.estimatedTokens;
      }
    }

    // If within budget, return as is
    if (currentTokens <= maxTokens) {
      return contexts;
    }

    // Need to reduce. Collect all items with their origin context index
    type ItemWithIndex = { item: KnowledgeItem; ctxIndex: number };
    const allItems: ItemWithIndex[] = [];
    
    for (let i = 0; i < contexts.length; i++) {
      for (const item of contexts[i].items) {
        allItems.push({ item, ctxIndex: i });
      }
    }

    // Sort globally by priority (critical > high > medium > low)
    const priorityWeights: Record<string, number> = { 
      critical: 4, 
      high: 3, 
      medium: 2, 
      low: 1 
    };
    
    allItems.sort((a, b) => priorityWeights[b.item.importance] - priorityWeights[a.item.importance]);

    // Build new enforced contexts
    const enforcedContexts: KnowledgeContext[] = contexts.map(c => ({
      moduleName: c.moduleName,
      items: []
    }));

    let enforcedTokens = 0;
    for (const { item, ctxIndex } of allItems) {
      if (enforcedTokens + item.estimatedTokens <= maxTokens) {
        enforcedContexts[ctxIndex].items.push(item);
        enforcedTokens += item.estimatedTokens;
      }
    }

    // Filter out empty contexts
    return enforcedContexts.filter(c => c.items.length > 0);
  }
}

export const contextBudgetEnforcer = new ContextBudgetEnforcer();
