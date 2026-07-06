const fs = require('fs');
const path = require('path');

const providers = [
  {
    name: 'Goals',
    file: 'goals.action.ts',
    content: `
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
        }
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
        }
      }
    ];
  }
}

export const goalsActionProvider = new GoalsActionProvider();
const existing = moduleRegistry.getModule('Goals') || { name: 'Goals' };
existing.actionProvider = goalsActionProvider;
moduleRegistry.register(existing);
`
  },
  {
    name: 'Projects',
    file: 'projects.action.ts',
    content: `
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
`
  },
  {
    name: 'Notes',
    file: 'notes.action.ts',
    content: `
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
`
  },
  {
    name: 'Finance',
    file: 'finance.action.ts',
    content: `
import { IActionProvider, ActionSchema } from '../../registry/types';
import { moduleRegistry } from '../../registry/module-registry';

export class FinanceActionProvider implements IActionProvider {
  name = 'Finance';
  getActions(): ActionSchema[] {
    return [
      {
        name: 'create_finance_transaction',
        description: 'Buat transaksi keuangan.',
        parameters: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'income atau expense' },
            amount: { type: 'number' },
            category: { type: 'string' },
            description: { type: 'string' },
            transaction_date: { type: 'string' },
          },
          required: ['type', 'amount'],
        }
      }
    ];
  }
}

export const financeActionProvider = new FinanceActionProvider();
const existing = moduleRegistry.getModule('Finance') || { name: 'Finance' };
existing.actionProvider = financeActionProvider;
moduleRegistry.register(existing);
`
  },
  {
    name: 'Diary',
    file: 'diary.action.ts',
    content: `
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
`
  },
  {
    name: 'CMS',
    file: 'cms.action.ts',
    content: `
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
        }
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
        }
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
        }
      }
    ];
  }
}

export const cmsActionProvider = new CMSActionProvider();
const existing = moduleRegistry.getModule('CMS') || { name: 'CMS' };
existing.actionProvider = cmsActionProvider;
moduleRegistry.register(existing);
`
  },
  {
    name: 'Achievements',
    file: 'achievements.action.ts',
    content: `
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
        }
      }
    ];
  }
}

export const achievementsActionProvider = new AchievementsActionProvider();
const existing = moduleRegistry.getModule('Achievements') || { name: 'Achievements' };
existing.actionProvider = achievementsActionProvider;
moduleRegistry.register(existing);
`
  }
];

const dir = path.join(process.cwd(), 'src/features/ai/actions/providers');

providers.forEach(p => {
  fs.writeFileSync(path.join(dir, p.file), p.content.trim());
});

console.log('Generated action providers.');
