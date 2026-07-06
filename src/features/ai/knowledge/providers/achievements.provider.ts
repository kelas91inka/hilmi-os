import { IKnowledgeProvider, KnowledgeContext, KnowledgeItem, CompressionLevel } from '../types';
import { knowledgeCache } from '../cache-manager';
import { ContextCompressor } from '../context-compressor';
import { aiRepository } from '@/features/ai/repositories/ai.repository';

export class AchievementsKnowledgeProvider implements IKnowledgeProvider {
  name = 'achievements';
  keywords = ['prestasi', 'achievement', 'pencapaian', 'bangga'];
  basePriority = 75;

  async getAIContext(query: string, tokenBudget: number): Promise<KnowledgeContext> {
    let rawData = knowledgeCache.get(this.name, 'recent');
    if (!rawData) {
      rawData = await aiRepository.getAchievements();
      knowledgeCache.set(this.name, 'recent', rawData);
    }
    if (!rawData || rawData.length === 0) return { moduleName: 'Achievements', items: [] };

    const level: CompressionLevel = tokenBudget > 1000 ? 'rich' : tokenBudget > 400 ? 'structured' : 'ultra-summary';
    let items: KnowledgeItem[] = [];

    if (level === 'ultra-summary') {
      const content = `Total achievements: ${rawData.length}.`;
      items = [{ title: 'Achievements Summary', importance: 'medium', content, estimatedTokens: ContextCompressor.estimateTokens(content) }];
    } else {
      items = ContextCompressor.compress(
        rawData,
        (item: any) => {
          const content = level === 'rich' ? `Title: ${item.title}\nCategory: ${item.category}\nDate: ${item.achievement_date}\nDescription: ${item.description || '-'}` : `${item.title} (${item.category})`;
          return {
            title: item.title || 'Untitled Achievement',
            importance: 'high',
            content,
            estimatedTokens: ContextCompressor.estimateTokens(content),
          };
        },
        level,
        tokenBudget
      );
    }
    return { moduleName: 'Achievements', items };
  }

  invalidateCache() {
    knowledgeCache.invalidate(this.name);
  }
}

import { moduleRegistry } from '../module-registry';
moduleRegistry.register(new AchievementsKnowledgeProvider());
