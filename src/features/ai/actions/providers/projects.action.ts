import { IActionProvider, ActionSchema } from '../../registry/types';
import { moduleRegistry } from '../../registry/module-registry';

export class ProjectsActionProvider implements IActionProvider {
  name = 'Projects';
  getActions(): ActionSchema[] {
    return [
      {
        name: 'create_project',
        description: 'Buat draft project baru.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            start_date: { type: 'string' },
            end_date: { type: 'string' },
          },
          required: ['title'],
        }
      },
      {
        name: 'update_project',
        description: 'Update project yang ada.',
        parameters: {
          type: 'object',
          properties: {
            project_id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            end_date: { type: 'string' },
          },
          required: ['project_id'],
        }
      }
    ];
  }
}

export const projectsActionProvider = new ProjectsActionProvider();
const existing = moduleRegistry.getModule('Projects') || { name: 'Projects' };
existing.actionProvider = projectsActionProvider;
moduleRegistry.register(existing);