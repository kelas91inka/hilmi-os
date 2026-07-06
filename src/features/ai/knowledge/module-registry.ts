import { moduleRegistry as unifiedRegistry } from '../registry/module-registry';
import { IKnowledgeProvider } from './types';

// Backward compatibility wrapper for Phase 1
class LegacyModuleRegistry {
  register(provider: IKnowledgeProvider) {
    const existing = unifiedRegistry.getModule(provider.name) || { name: provider.name };
    existing.knowledgeProvider = provider;
    unifiedRegistry.register(existing);
  }

  get(name: string): IKnowledgeProvider | undefined {
    return unifiedRegistry.getModule(name)?.knowledgeProvider;
  }

  getAll(): IKnowledgeProvider[] {
    return unifiedRegistry.getKnowledgeProviders();
  }
}

export const moduleRegistry = new LegacyModuleRegistry();

