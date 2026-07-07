import { IActionProvider, ActionSchema } from '../../registry/types';
import { moduleRegistry } from '../../registry/module-registry';

export class CMSActionProvider implements IActionProvider {
  name = 'CMS';
  getActions(): ActionSchema[] {
    return [
      {
        name: 'create_cms_post',
        description: 'Buat CMS post.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            status: { type: 'string' },
          },
          required: ['title'],
        },
        execute: async (args: any) => ({ requiresConfirmation: true, type: 'create_cms_post', draft: args })
      },
      {
        name: 'edit_cms_post',
        description: 'Edit CMS post.',
        parameters: {
          type: 'object',
          properties: {
            post_id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            status: { type: 'string' },
          },
          required: ['post_id'],
        },
        execute: async (args: any) => ({ requiresConfirmation: true, type: 'edit_cms_post', draft: args })
      },
      {
        name: 'publish_post',
        description: 'Publish CMS post.',
        parameters: {
          type: 'object',
          properties: {
            post_id: { type: 'string' },
          },
          required: ['post_id'],
        },
        execute: async (args: any) => ({ requiresConfirmation: true, type: 'publish_post', draft: args })
      }
    ];
  }
}

export const cmsActionProvider = new CMSActionProvider();
const existing = moduleRegistry.getModule('CMS') || { name: 'CMS' };
existing.actionProvider = cmsActionProvider;
moduleRegistry.register(existing);