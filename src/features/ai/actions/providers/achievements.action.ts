import { IActionProvider, ActionSchema } from '../../registry/types';
import { moduleRegistry } from '../../registry/module-registry';

export class AchievementsActionProvider implements IActionProvider {
  name = 'Achievements';
  getActions(): ActionSchema[] {
    return [
      {
        name: 'create_achievement',
        description: 'Buat pencapaian baru.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            unlocked_at: { type: 'string' },
          },
          required: ['title'],
        },
        execute: async (args: any) => ({ requiresConfirmation: true, type: 'create_achievement', draft: args })
      }
    ];
  }
}

export const achievementsActionProvider = new AchievementsActionProvider();
const existing = moduleRegistry.getModule('Achievements') || { name: 'Achievements' };
existing.actionProvider = achievementsActionProvider;
moduleRegistry.register(existing);