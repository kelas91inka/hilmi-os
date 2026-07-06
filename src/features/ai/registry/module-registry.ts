import { AIModuleCapability } from './types';
import { IKnowledgeProvider } from '../knowledge/types';
import { IActionProvider } from './types';

class ModuleCapabilityRegistry {
  private modules: Map<string, AIModuleCapability> = new Map();

  register(module: AIModuleCapability) {
    this.modules.set(module.name.toLowerCase(), module);
  }

  getModule(name: string): AIModuleCapability | undefined {
    return this.modules.get(name.toLowerCase());
  }

  getAllModules(): AIModuleCapability[] {
    return Array.from(this.modules.values());
  }

  getKnowledgeProviders(): IKnowledgeProvider[] {
    return this.getAllModules()
      .filter(m => m.knowledgeProvider !== undefined)
      .map(m => m.knowledgeProvider!);
  }

  getActionProviders(): IActionProvider[] {
    return this.getAllModules()
      .filter(m => m.actionProvider !== undefined)
      .map(m => m.actionProvider!);
  }
}

export const moduleRegistry = new ModuleCapabilityRegistry();
