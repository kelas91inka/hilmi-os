import { IKnowledgeProvider, KnowledgeContext, KnowledgeItem, CompressionLevel } from '../types';
import { knowledgeCache } from '../cache-manager';
import { ContextCompressor } from '../context-compressor';
import { aiRepository } from '@/features/ai/repositories/ai.repository';

export class NotesKnowledgeProvider implements IKnowledgeProvider {
  name = 'notes';
  keywords = ['catatan', 'notes', 'ide', 'tulisan', 'draft', 'second brain'];
  basePriority = 80;

  async getAIContext(query: string, tokenBudget: number): Promise<KnowledgeContext> {
    let rawNotes = knowledgeCache.get(this.name, 'recent');

    if (!rawNotes) {
      rawNotes = await aiRepository.getNotes();
      knowledgeCache.set(this.name, 'recent', rawNotes);
    }

    if (!rawNotes || rawNotes.length === 0) {
      return { moduleName: 'Notes', items: [] };
    }

    const level: CompressionLevel = tokenBudget > 1000 ? 'rich' : tokenBudget > 400 ? 'structured' : 'ultra-summary';

    let items: KnowledgeItem[] = [];

    if (level === 'ultra-summary') {
      const favorites = rawNotes.filter((n: any) => n.is_favorite).length;
      const content = `Total: ${rawNotes.length} catatan. Favorit: ${favorites}. Judul: ${rawNotes.map((n: any) => n.title).slice(0, 3).join(', ')}.`;
      items = [{
        title: 'Ringkasan Catatan',
        importance: 'medium',
        content,
        estimatedTokens: ContextCompressor.estimateTokens(content)
      }];
    } else {
      items = ContextCompressor.compress(
        rawNotes,
        (note: any) => this.mapNoteToKnowledge(note, level),
        level,
        tokenBudget
      );
    }

    return {
      moduleName: 'Notes',
      items
    };
  }

  private mapNoteToKnowledge(note: any, level: CompressionLevel): KnowledgeItem | null {
    const isFavorite = note.is_favorite;
    
    let content = '';
    if (level === 'rich') {
      content = `Title: ${note.title}\nFavorit: ${isFavorite ? 'Ya' : 'Tidak'}\nExcerpt: ${note.excerpt || '-'}`;
    } else {
      content = `${note.title} ${isFavorite ? '(Fav)' : ''}`;
    }

    return {
      title: note.title || 'Untitled Note',
      importance: isFavorite ? 'high' : 'medium',
      content,
      estimatedTokens: ContextCompressor.estimateTokens(content),
    };
  }

  invalidateCache() {
    knowledgeCache.invalidate(this.name);
  }
}

import { moduleRegistry } from '../module-registry';
moduleRegistry.register(new NotesKnowledgeProvider());
