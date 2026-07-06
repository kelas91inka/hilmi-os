import { moduleRegistry } from './module-registry';
import { ActionType, AIModuleCapability } from './types';
import { telemetryLogger } from '../knowledge/telemetry';

export interface ResolvedIntent {
  modules: AIModuleCapability[];
  actionType: ActionType;
  confidence: number;
}

export class IntentResolver {
  
  private actionKeywords: Record<string, ActionType> = {
    'buat': 'CREATE',
    'tambah': 'CREATE',
    'bikin': 'CREATE',
    'catat': 'CREATE',
    'ubah': 'UPDATE',
    'edit': 'UPDATE',
    'ganti': 'UPDATE',
    'perbarui': 'UPDATE',
    'hapus': 'DELETE',
    'delete': 'DELETE',
    'hilangkan': 'DELETE',
    'selesai': 'UPDATE', // Tandai selesai
  };

  /**
   * Resolves the user query to a list of required modules and an action type.
   */
  async resolve(query: string): Promise<ResolvedIntent> {
    const start = Date.now();
    const lowerQuery = query.toLowerCase();
    
    // 1. Detect Action Type
    let actionType: ActionType = 'READ'; // default
    let actionMatches = 0;
    
    for (const [keyword, type] of Object.entries(this.actionKeywords)) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lowerQuery)) {
        if (actionType !== 'READ' && actionType !== type) {
          // If multiple conflicting action keywords are found (e.g. "buat dan hapus")
          actionType = 'MULTI_ACTION';
        } else {
          actionType = type;
        }
        actionMatches++;
      }
    }

    // 2. Detect Modules
    const selectedModules: AIModuleCapability[] = [];
    const allKnowledgeProviders = moduleRegistry.getKnowledgeProviders();
    
    for (const provider of allKnowledgeProviders) {
      const matches = provider.keywords.some(keyword => {
        const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
        return regex.test(lowerQuery);
      });

      if (matches) {
        const mod = moduleRegistry.getModule(provider.name);
        if (mod) selectedModules.push(mod);
      }
    }

    if (selectedModules.length > 1 && actionType !== 'READ') {
       actionType = 'MULTI_ACTION';
    }

    let confidence = 1.0;
    if (selectedModules.length === 0 && actionType !== 'READ') {
      confidence = 0.5; // Has action keyword but no module detected
    }

    telemetryLogger.logIntentMethod('rule-based', Date.now() - start);

    return {
      modules: selectedModules,
      actionType,
      confidence
    };
  }
}

export const intentResolver = new IntentResolver();
