import { IActionProvider, ActionSchema } from '../../registry/types';
import { moduleRegistry } from '../../registry/module-registry';

export class GoalsActionProvider implements IActionProvider {
  name = 'Goals';
  getActions(): ActionSchema[] {
    return [
      {
        name: 'create_goal',
        description: 'Buat draft goal baru.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            goal_type: { type: 'string' },
            target_date: { type: 'string' },
            category: { type: 'string' },
          },
          required: ['title'],
        },
        execute: async (args: any) => ({ requiresConfirmation: true, type: 'create_goal', draft: args })
      },
      {
        name: 'update_goal',
        description: 'Update goal yang ada.',
        parameters: {
          type: 'object',
          properties: {
            goal_id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            progress: { type: 'number' },
            status: { type: 'string' },
            target_date: { type: 'string' },
          },
          required: ['goal_id'],
        },
        execute: async (args: any) => ({ requiresConfirmation: true, type: 'update_goal', draft: args })
      }
    ];
  }
}

export const goalsActionProvider = new GoalsActionProvider();
const existing = moduleRegistry.getModule('Goals') || { name: 'Goals' };
existing.actionProvider = goalsActionProvider;
moduleRegistry.register(existing);