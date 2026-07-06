import { IKnowledgeProvider, KnowledgeContext, KnowledgeItem, CompressionLevel } from '../types';
import { knowledgeCache } from '../cache-manager';
import { ContextCompressor } from '../context-compressor';
import { aiRepository } from '@/features/ai/repositories/ai.repository';

export class FinanceKnowledgeProvider implements IKnowledgeProvider {
  name = 'finance';
  keywords = ['keuangan', 'finance', 'uang', 'pengeluaran', 'pemasukan', 'transaksi', 'saldo'];
  basePriority = 95;

  async getAIContext(query: string, tokenBudget: number): Promise<KnowledgeContext> {
    let summaryObj = knowledgeCache.get(this.name, 'recent');
    if (!summaryObj) {
      summaryObj = await aiRepository.getFinanceSummary();
      knowledgeCache.set(this.name, 'recent', summaryObj);
    }
    if (!summaryObj) return { moduleName: 'Finance', items: [] };

    // Finance returns a single summary object
    const content = JSON.stringify(summaryObj);
    return {
      moduleName: 'Finance',
      items: [{
        title: 'Finance Summary',
        importance: 'high',
        content,
        estimatedTokens: ContextCompressor.estimateTokens(content)
      }]
    };
  }

  invalidateCache() {
    knowledgeCache.invalidate(this.name);
  }
}

import { moduleRegistry } from '../module-registry';
moduleRegistry.register(new FinanceKnowledgeProvider());
