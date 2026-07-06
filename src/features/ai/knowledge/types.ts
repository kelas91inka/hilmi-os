export type CompressionLevel = 'rich' | 'structured' | 'ultra-summary';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface KnowledgeItem {
  title: string;
  importance: PriorityLevel;
  content: string; // The summarized/structured content, no UUIDs
  estimatedTokens: number;
}

export interface KnowledgeContext {
  moduleName: string;
  items: KnowledgeItem[];
}

export interface IKnowledgeProvider {
  name: string;
  /** Keywords and regex patterns for Stage 1 rule-based intent resolution */
  keywords: string[];
  /** Priority weight (0-100) to help module registry rank modules if budget is tight */
  basePriority: number;
  /** Generate context for this module based on the user's query and token budget */
  getAIContext: (query: string, tokenBudget: number) => Promise<KnowledgeContext>;
  /** Invalidate the cache for this specific module */
  invalidateCache: () => void;
}

export interface TelemetryData {
  timestamp: string;
  intentMethod: 'rule-based' | 'llm-fallback' | 'none';
  selectedModules: Array<{ name: string; priority: number; allocatedTokens: number }>;
  timing: {
    intentMs: number;
    providerFetchMs: number;
    compressionMs: number;
    totalPipelineMs: number;
  };
  tokenUsage: {
    historyTokens: number;
    knowledgeTokens: number;
    remainingBudget: number;
  };
  errors: string[];
}
