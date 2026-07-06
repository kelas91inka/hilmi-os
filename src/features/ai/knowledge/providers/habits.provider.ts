import { IKnowledgeProvider, KnowledgeContext, KnowledgeItem, CompressionLevel } from '../types';
import { knowledgeCache } from '../cache-manager';
import { ContextCompressor } from '../context-compressor';
import { aiRepository } from '@/features/ai/repositories/ai.repository';

export class HabitsKnowledgeProvider implements IKnowledgeProvider {
  name = 'habits';
  keywords = ['habit', 'kebiasaan', 'rutinitas', 'rutin'];
  basePriority = 80;

  async getAIContext(query: string, tokenBudget: number): Promise<KnowledgeContext> {
    let rawData = knowledgeCache.get(this.name, 'recent');
    if (!rawData) {
      rawData = await aiRepository.getHabitStats();
      knowledgeCache.set(this.name, 'recent', rawData);
    }
    if (!rawData || rawData.length === 0) return { moduleName: 'Habits', items: [] };

    const level: CompressionLevel = tokenBudget > 1000 ? 'rich' : tokenBudget > 400 ? 'structured' : 'ultra-summary';
    let items: KnowledgeItem[] = [];

    if (level === 'ultra-summary') {
      const active = rawData.filter((i: any) => i.active).length;
      const content = `Total: ${rawData.length} habits. Active: ${active}.`;
      items = [{ title: 'Habit Summary', importance: 'medium', content, estimatedTokens: ContextCompressor.estimateTokens(content) }];
    } else {
      items = ContextCompressor.compress(
        rawData,
        (item: any) => {
          const content = level === 'rich' ? `Title: ${item.title}\nFrequency: ${item.target_frequency}\nActive: ${item.active}` : `${item.title} (${item.target_frequency})`;
          return {
            title: item.title || 'Untitled Habit',
            importance: item.active ? 'high' : 'medium',
            content,
            estimatedTokens: ContextCompressor.estimateTokens(content),
          };
        },
        level,
        tokenBudget
      );
    }
    return { moduleName: 'Habits', items };
  }

  invalidateCache() {
    knowledgeCache.invalidate(this.name);
  }
}

import { moduleRegistry } from '../module-registry';
moduleRegistry.register(new HabitsKnowledgeProvider());
