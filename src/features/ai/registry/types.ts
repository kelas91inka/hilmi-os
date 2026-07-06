import { IKnowledgeProvider } from '../knowledge/types';

export type ActionType = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'MULTI_ACTION' | 'UNKNOWN';

export interface ActionSchema {
  name: string;
  description: string;
  parameters: Record<string, any>; // Legacy raw json schema
  zodSchema?: any; // New Zod schema field for better compatibility
  execute: (args: Record<string, any>) => Promise<{
    requiresConfirmation: boolean;
    type: string;
    draft: any;
  }>;
}

export interface IActionProvider {
  name: string;
  getActions(): ActionSchema[];
}

export interface AIModuleCapability {
  name: string;
  knowledgeProvider?: IKnowledgeProvider;
  actionProvider?: IActionProvider;
}
