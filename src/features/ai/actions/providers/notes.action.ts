import { IActionProvider, ActionSchema } from '../../registry/types';
import { moduleRegistry } from '../../registry/module-registry';

export class NotesActionProvider implements IActionProvider {
  name = 'Notes';
  getActions(): ActionSchema[] {
    return [
      {
        name: 'create_note',
        description: 'Buat catatan baru.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            is_favorite: { type: 'boolean' },
          },
          required: ['title'],
        }
      }
    ];
  }
}

export const notesActionProvider = new NotesActionProvider();
const existing = moduleRegistry.getModule('Notes') || { name: 'Notes' };
existing.actionProvider = notesActionProvider;
moduleRegistry.register(existing);