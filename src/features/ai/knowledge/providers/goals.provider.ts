import { IKnowledgeProvider, KnowledgeContext, KnowledgeItem, CompressionLevel } from '../types';
import { knowledgeCache } from '../cache-manager';
import { ContextCompressor } from '../context-compressor';
import { aiRepository } from '@/features/ai/repositories/ai.repository';

export class GoalsKnowledgeProvider implements IKnowledgeProvider {
  name = 'goals';
  keywords = ['tujuan', 'goal', 'target', 'resolusi', 'progres'];
  basePriority = 85;

  async getAIContext(query: string, tokenBudget: number): Promise<KnowledgeContext> {
    let rawData = knowledgeCache.get(this.name, 'recent');
    if (!rawData) {
      rawData = await aiRepository.getGoalsProgress();
      knowledgeCache.set(this.name, 'recent', rawData);
    }
    if (!rawData || rawData.length === 0) return { moduleName: 'Goals', items: [] };

    const level: CompressionLevel = tokenBudget > 1000 ? 'rich' : tokenBudget > 400 ? 'structured' : 'ultra-summary';
    let items: KnowledgeItem[] = [];

    if (level === 'ultra-summary') {
      const active = rawData.filter((i: any) => i.status === 'active').length;
      const content = `Total: ${rawData.length} goals. Active: ${active}.`;
      items = [{ title: 'Goal Summary', importance: 'high', content, estimatedTokens: ContextCompressor.estimateTokens(content) }];
    } else {
      items = ContextCompressor.compress(
        rawData,
        (item: any) => {
          const content = level === 'rich' ? `Title: ${item.title}\nStatus: ${item.status}\nProgress: ${item.progress}%\nTarget Date: ${item.target_date || '-'}` : `${item.title} (${item.progress}%)`;
          return {
            title: item.title || 'Untitled Goal',
            importance: item.progress < 30 ? 'high' : 'medium',
            content,
            estimatedTokens: ContextCompressor.estimateTokens(content),
          };
        },
        level,
        tokenBudget
      );
    }
    return { moduleName: 'Goals', items };
  }

  invalidateCache() {
    knowledgeCache.invalidate(this.name);
  }
}

import { moduleRegistry } from '../module-registry';
moduleRegistry.register(new GoalsKnowledgeProvider());
