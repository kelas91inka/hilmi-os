import { CompressionLevel, KnowledgeItem } from './types';

export class ContextCompressor {
  /**
   * Compresses an array of raw items into KnowledgeItems based on the requested compression level
   * and token budget. Prioritizes items marked as critical or high importance.
   * 
   * @param rawItems The raw database rows or business objects
   * @param mapper A function that converts a raw item into a KnowledgeItem given a compression level
   * @param level The target compression level (rich, structured, ultra-summary)
   * @param budgetTokens The maximum tokens allowed for this module
   */
  static compress<T>(
    rawItems: T[],
    mapper: (item: T, level: CompressionLevel) => KnowledgeItem | null,
    level: CompressionLevel,
    budgetTokens: number
  ): KnowledgeItem[] {
    const result: KnowledgeItem[] = [];
    let currentTokens = 0;

    // Convert raw items to knowledge items
    const mappedItems: KnowledgeItem[] = [];
    for (const raw of rawItems) {
      const mapped = mapper(raw, level);
      if (mapped) {
        mappedItems.push(mapped);
      }
    }

    // Sort by priority (critical > high > medium > low)
    const priorityWeights: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    
    mappedItems.sort((a, b) => priorityWeights[b.importance] - priorityWeights[a.importance]);

    // Fill budget
    for (const item of mappedItems) {
      if (currentTokens + item.estimatedTokens <= budgetTokens) {
        result.push(item);
        currentTokens += item.estimatedTokens;
      }
    }

    return result;
  }

  /**
   * Rough heuristic: 1 token ≈ 4 characters for English/Indonesian.
   */
  static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
