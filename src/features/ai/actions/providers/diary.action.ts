import { IActionProvider, ActionSchema } from '../../registry/types';
import { moduleRegistry } from '../../registry/module-registry';

export class DiaryActionProvider implements IActionProvider {
  name = 'Diary';
  getActions(): ActionSchema[] {
    return [
      {
        name: 'create_diary_entry',
        description: 'Buat entri diary.',
        parameters: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            mood: { type: 'string' },
            title: { type: 'string' },
            entry_date: { type: 'string' },
          },
          required: ['content'],
        }
      }
    ];
  }
}

export const diaryActionProvider = new DiaryActionProvider();
const existing = moduleRegistry.getModule('Diary') || { name: 'Diary' };
existing.actionProvider = diaryActionProvider;
moduleRegistry.register(existing);