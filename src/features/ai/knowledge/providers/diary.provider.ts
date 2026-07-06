import { IKnowledgeProvider, KnowledgeContext, KnowledgeItem, CompressionLevel } from '../types';
import { knowledgeCache } from '../cache-manager';
import { ContextCompressor } from '../context-compressor';
import { aiRepository } from '@/features/ai/repositories/ai.repository';

export class DiaryKnowledgeProvider implements IKnowledgeProvider {
  name = 'diary';
  keywords = ['jurnal', 'diary', 'mood', 'perasaan', 'hari ini'];
  basePriority = 75;

  async getAIContext(query: string, tokenBudget: number): Promise<KnowledgeContext> {
    let rawData = knowledgeCache.get(this.name, 'recent');
    if (!rawData) {
      rawData = await aiRepository.getRecentDiary();
      knowledgeCache.set(this.name, 'recent', rawData);
    }
    if (!rawData || rawData.length === 0) return { moduleName: 'Diary', items: [] };

    const level: CompressionLevel = tokenBudget > 1000 ? 'rich' : tokenBudget > 400 ? 'structured' : 'ultra-summary';
    let items: KnowledgeItem[] = [];

    if (level === 'ultra-summary') {
      const content = `Total recent entries: ${rawData.length}.`;
      items = [{ title: 'Diary Summary', importance: 'medium', content, estimatedTokens: ContextCompressor.estimateTokens(content) }];
    } else {
      items = ContextCompressor.compress(
        rawData,
        (item: any) => {
          const content = level === 'rich' ? `Title: ${item.title}\nMood: ${item.mood}\nDate: ${item.entry_date}\nContent: ${item.content || '-'}` : `${item.title} (${item.mood}) - ${item.entry_date}`;
          return {
            title: item.title || 'Diary Entry',
            importance: item.mood === 'sad' || item.mood === 'stressed' ? 'high' : 'medium',
            content,
            estimatedTokens: ContextCompressor.estimateTokens(content),
          };
        },
        level,
        tokenBudget
      );
    }
    return { moduleName: 'Diary', items };
  }

  invalidateCache() {
    knowledgeCache.invalidate(this.name);
  }
}

import { moduleRegistry } from '../module-registry';
moduleRegistry.register(new DiaryKnowledgeProvider());
