import { IKnowledgeProvider, KnowledgeContext, KnowledgeItem, CompressionLevel } from '../types';
import { knowledgeCache } from '../cache-manager';
import { ContextCompressor } from '../context-compressor';
import { aiRepository } from '@/features/ai/repositories/ai.repository';

export class ProjectsKnowledgeProvider implements IKnowledgeProvider {
  name = 'projects';
  keywords = ['proyek', 'project', 'progres', 'timeline', 'aktif'];
  basePriority = 85;

  async getAIContext(query: string, tokenBudget: number): Promise<KnowledgeContext> {
    let rawProjects = knowledgeCache.get(this.name, 'active');

    if (!rawProjects) {
      rawProjects = await aiRepository.getActiveProjects();
      knowledgeCache.set(this.name, 'active', rawProjects);
    }

    if (!rawProjects || rawProjects.length === 0) {
      return { moduleName: 'Projects', items: [] };
    }

    const level: CompressionLevel = tokenBudget > 1000 ? 'rich' : tokenBudget > 400 ? 'structured' : 'ultra-summary';

    let items: KnowledgeItem[] = [];

    if (level === 'ultra-summary') {
      const content = `Total: ${rawProjects.length} proyek aktif. Proyek: ${rawProjects.map((p: any) => p.title).join(', ')}`;
      items = [{
        title: 'Ringkasan Proyek',
        importance: 'high',
        content,
        estimatedTokens: ContextCompressor.estimateTokens(content)
      }];
    } else {
      items = ContextCompressor.compress(
        rawProjects,
        (proj: any) => this.mapProjectToKnowledge(proj, level),
        level,
        tokenBudget
      );
    }

    return {
      moduleName: 'Projects',
      items
    };
  }

  private mapProjectToKnowledge(proj: any, level: CompressionLevel): KnowledgeItem | null {
    let content = '';
    if (level === 'rich') {
      content = `Title: ${proj.title}\nStatus: ${proj.status}\nStart: ${proj.start_date || '-'}\nEnd: ${proj.end_date || '-'}`;
    } else {
      content = `${proj.title} (${proj.status})`;
    }

    return {
      title: proj.title || 'Untitled Project',
      importance: 'high',
      content,
      estimatedTokens: ContextCompressor.estimateTokens(content),
    };
  }

  invalidateCache() {
    knowledgeCache.invalidate(this.name);
  }
}

import { moduleRegistry } from '../module-registry';
moduleRegistry.register(new ProjectsKnowledgeProvider());
