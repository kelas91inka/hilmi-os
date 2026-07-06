import { z } from 'zod';
import { IActionProvider, ActionSchema } from '../../registry/types';

// Zod schemas for validation
const CreateTaskSchema = z.object({
  title: z.string().min(1, "Judul tugas tidak boleh kosong"),
  description: z.string().optional(),
  priority: z.enum(['rendah', 'normal', 'tinggi', 'kritis']).default('normal'),
  status: z.enum(['belum_dimulai', 'sedang_dikerjakan', 'selesai', 'ditunda']).default('belum_dimulai'),
  due_date: z.string().optional(), // YYYY-MM-DD
});

const UpdateTaskSchema = z.object({
  task_id: z.string().uuid("Task ID harus berupa UUID valid"),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['rendah', 'normal', 'tinggi', 'kritis']).optional(),
  status: z.enum(['belum_dimulai', 'sedang_dikerjakan', 'selesai', 'ditunda']).optional(),
  due_date: z.string().optional(),
});

const DeleteTaskSchema = z.object({
  task_id: z.string().uuid("Task ID harus berupa UUID valid"),
});

export class TasksActionProvider implements IActionProvider {
  name = 'Tasks';

  getActions(): ActionSchema[] {
    return [
      {
        name: 'create_task',
        description: 'Buat tugas (task) baru. Panggil ini ketika user meminta membuat tugas. Harus menyertakan title.',
        zodSchema: CreateTaskSchema,
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Judul tugas (wajib).' },
            description: { type: 'string', description: 'Detail tugas.' },
            priority: { type: 'string', description: 'rendah, normal, tinggi, kritis. Default: normal.' },
            status: { type: 'string', description: 'belum_dimulai, sedang_dikerjakan, selesai, ditunda. Default: belum_dimulai.' },
            due_date: { type: 'string', description: 'Batas waktu format YYYY-MM-DD (opsional).' },
          },
          required: ['title'],
        },
        execute: async (args) => {
          return { requiresConfirmation: true, type: 'create_task', draft: args };
        }
      },
      {
        name: 'update_task',
        description: 'Ubah tugas yang sudah ada. Harus menyertakan task_id.',
        zodSchema: UpdateTaskSchema,
        parameters: {
          type: 'object',
          properties: {
            task_id: { type: 'string', description: 'UUID tugas yang akan diubah (wajib).' },
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string' },
            status: { type: 'string' },
            due_date: { type: 'string' },
          },
          required: ['task_id'],
        },
        execute: async (args) => {
          return { requiresConfirmation: true, type: 'update_task', draft: args };
        }
      },
      {
        name: 'delete_task',
        description: 'Hapus tugas. Harus menyertakan task_id.',
        zodSchema: DeleteTaskSchema,
        parameters: {
          type: 'object',
          properties: {
            task_id: { type: 'string', description: 'UUID tugas yang akan dihapus (wajib).' },
          },
          required: ['task_id'],
        },
        execute: async (args) => {
          return { requiresConfirmation: true, type: 'delete_task', draft: args };
        }
      }
    ];
  }
}

export const tasksActionProvider = new TasksActionProvider();

// Register the capability explicitly (can also be done globally in a main registry file)
import { moduleRegistry } from '../../registry/module-registry';
// Ensure the knowledge provider is preserved if it was already registered
const existing = moduleRegistry.getModule('Tasks') || { name: 'Tasks' };
existing.actionProvider = tasksActionProvider;
moduleRegistry.register(existing);
