import { IKnowledgeProvider, CompressionLevel } from './types';

export class TokenBudgetManager {
  // Conservative limit for a standard 8k context window to ensure plenty of room
  private readonly MAX_TOKENS = 6000;
  
  /**
   * Distributes token budget to selected modules based on their priority.
   */
  distributeBudget(
    historyTokens: number, 
    selectedModules: IKnowledgeProvider[]
  ): { 
    allocations: Map<string, number>; 
    remainingBudget: number; 
    compressionLevels: Map<string, CompressionLevel> 
  } {
    // Reserve tokens for system prompt (write tools only) and expected LLM output (800)
    const reservedForSystemAndResponse = 2000;
    const availableForKnowledge = Math.max(0, this.MAX_TOKENS - historyTokens - reservedForSystemAndResponse);
    
    const allocations = new Map<string, number>();
    const compressionLevels = new Map<string, CompressionLevel>();
    
    if (selectedModules.length === 0 || availableForKnowledge <= 0) {
      return { allocations, remainingBudget: availableForKnowledge, compressionLevels };
    }
    
    const totalPriority = selectedModules.reduce((sum, mod) => sum + mod.basePriority, 0);
    
    for (const mod of selectedModules) {
      // Allocate tokens proportionally to priority weight
      const share = totalPriority > 0 ? mod.basePriority / totalPriority : 1 / selectedModules.length;
      const budget = Math.floor(availableForKnowledge * share);
      allocations.set(mod.name, budget);
      
      // Select appropriate compression level
      let level: CompressionLevel = 'ultra-summary';
      if (budget > 1000) {
        level = 'rich';
      } else if (budget > 400) {
        level = 'structured';
      }
      
      compressionLevels.set(mod.name, level);
    }
    
    return { allocations, remainingBudget: availableForKnowledge, compressionLevels };
  }
}

export const tokenBudgetManager = new TokenBudgetManager();
