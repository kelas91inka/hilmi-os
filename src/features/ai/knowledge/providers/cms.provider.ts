import { IKnowledgeProvider, KnowledgeContext, KnowledgeItem, CompressionLevel } from '../types';
import { knowledgeCache } from '../cache-manager';
import { ContextCompressor } from '../context-compressor';
import { aiRepository } from '@/features/ai/repositories/ai.repository';

export class CmsKnowledgeProvider implements IKnowledgeProvider {
  name = 'cms';
  keywords = ['cms', 'post', 'artikel', 'blog', 'konten'];
  basePriority = 70;

  async getAIContext(query: string, tokenBudget: number): Promise<KnowledgeContext> {
    let rawData = knowledgeCache.get(this.name, 'recent');
    if (!rawData) {
      rawData = await aiRepository.getCmsPosts();
      knowledgeCache.set(this.name, 'recent', rawData);
    }
    if (!rawData || rawData.length === 0) return { moduleName: 'CMS', items: [] };

    const level: CompressionLevel = tokenBudget > 1000 ? 'rich' : tokenBudget > 400 ? 'structured' : 'ultra-summary';
    let items: KnowledgeItem[] = [];

    if (level === 'ultra-summary') {
      const published = rawData.filter((i: any) => i.published).length;
      const content = `Total posts: ${rawData.length}. Published: ${published}.`;
      items = [{ title: 'CMS Summary', importance: 'medium', content, estimatedTokens: ContextCompressor.estimateTokens(content) }];
    } else {
      items = ContextCompressor.compress(
        rawData,
        (item: any) => {
          const content = level === 'rich' ? `Title: ${item.title}\nType: ${item.post_type}\nPublished: ${item.published ? 'Yes' : 'No'}\nDate: ${item.created_at}` : `${item.title} (${item.post_type})`;
          return {
            title: item.title || 'Untitled Post',
            importance: 'medium',
            content,
            estimatedTokens: ContextCompressor.estimateTokens(content),
          };
        },
        level,
        tokenBudget
      );
    }
    return { moduleName: 'CMS', items };
  }

  invalidateCache() {
    knowledgeCache.invalidate(this.name);
  }
}

import { moduleRegistry } from '../module-registry';
moduleRegistry.register(new CmsKnowledgeProvider());
