'use server';

import { aiRepository } from '../repositories/ai.repository';
import { normalizeDraft } from '../tools/tool-normalizer';

// ─── Conversation Actions ─────────────────────────────────────────────────────

export async function getConversationsAction() {
  try {
    const data = await aiRepository.getConversations();
    return { success: true, data };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function getConversationMessagesAction(conversationId: string) {
  try {
    const data = await aiRepository.getMessages(conversationId);
    return { success: true, data };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function createConversationAction(title: string) {
  try {
    const data = await aiRepository.createConversation(title);
    return { success: true, data };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function saveMessageAction(
  conversationId: string,
  role: string,
  content: string,
  messageData?: any
) {  try {
    const data = await aiRepository.saveMessage(conversationId, role, content, messageData);
    return { success: true, data };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function renameConversationAction(id: string, title: string) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { error } = await supabase
      .from('ai_conversations')
      .update({ title })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function deleteConversationAction(id: string) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    // No need to delete ai_messages manually because of ON DELETE CASCADE
    const { error } = await supabase.from('ai_conversations').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

// ─── AI Action Confirmation ───────────────────────────────────────────────────

import { ActionValidator } from './validation';
import { TransactionLayer } from './transaction';
import { z } from 'zod';

const CreateTaskSchema = z.object({
  title: z.string().min(1, "Judul tugas tidak boleh kosong"),
  description: z.string().optional(),
  priority: z.enum(['rendah', 'normal', 'tinggi', 'kritis']).default('normal'),
  status: z.enum(['belum_dimulai', 'sedang_dikerjakan', 'selesai', 'ditunda']).default('belum_dimulai'),
  due_date: z.string().optional().nullable(),
});

const UpdateTaskSchema = z.object({
  task_id: z.string().uuid("Task ID harus berupa UUID valid"),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['rendah', 'normal', 'tinggi', 'kritis']).optional(),
  status: z.enum(['belum_dimulai', 'sedang_dikerjakan', 'selesai', 'ditunda']).optional(),
  due_date: z.string().optional().nullable(),
});

const DeleteTaskSchema = z.object({
  task_id: z.string().uuid("Task ID harus berupa UUID valid"),
});

export async function confirmActionAction(type: string, rawDraft: any) {
  try {
    const draft = normalizeDraft(type, rawDraft || {}) as any;

    return await TransactionLayer.execute(`AI_Action_${type}`, async (registerRollback) => {
      let result: any;

      switch (type) {
        // ── Tasks ──────────────────────────────────────────────────────────────
        case 'create_task': {
          const validated = ActionValidator.validate(CreateTaskSchema, draft, type);
          result = await aiRepository.createTask(
            validated.title,
            validated.description,
            validated.priority,
            validated.due_date ?? undefined
          );
          if (result && result.id) {
            registerRollback(async () => {
              await aiRepository.deleteTask(result.id);
            });
          }
          break;
        }

        case 'update_task':
        case 'update_task_status': {
          const validated = ActionValidator.validate(UpdateTaskSchema, { ...draft, task_id: draft.task_id || draft.id }, type);
          const { createClient } = await import('@/lib/supabase/server');
          const supabase = await createClient();
          const { data: original } = await supabase.from('tasks').select('*').eq('id', validated.task_id).single();

          const updateData: any = {};
          if (validated.title) updateData.title = validated.title;
          if (validated.description !== undefined) updateData.description = validated.description;
          if (validated.priority) updateData.priority = validated.priority;
          if (validated.status) updateData.status = validated.status;
          if (validated.due_date !== undefined) updateData.due_date = validated.due_date;
          if (validated.status === 'selesai') updateData.completed_at = new Date().toISOString();

          const { data, error } = await supabase.from('tasks').update(updateData).eq('id', validated.task_id).select().single();
          if (error) throw new Error(error.message);
          result = data;

          if (original) {
            registerRollback(async () => {
              await supabase.from('tasks').update(original).eq('id', validated.task_id);
            });
          }
          break;
        }

        case 'delete_task': {
          const validated = ActionValidator.validate(DeleteTaskSchema, { task_id: draft.task_id || draft.id }, type);
          const { createClient } = await import('@/lib/supabase/server');
          const supabase = await createClient();
          const { data: original } = await supabase.from('tasks').select('*').eq('id', validated.task_id).single();

          const { error } = await supabase.from('tasks').delete().eq('id', validated.task_id);
          if (error) throw new Error(error.message);
          result = { deleted: true, task_id: validated.task_id };

          if (original) {
            registerRollback(async () => {
               await supabase.from('tasks').insert(original);
            });
          }
          break;
        }

        // Keep existing logic for other modules temporarily (will be refactored soon)
        case 'create_goal': {
          result = await aiRepository.createGoal(draft.title, draft.description, draft.goal_type, draft.target_date, draft.category);
          break;
        }
        case 'update_goal': {
          const { createClient } = await import('@/lib/supabase/server');
          const supabase = await createClient();
          const updateData: any = {};
          if (draft.title) updateData.title = draft.title;
          if (draft.description !== undefined) updateData.description = draft.description;
          if (draft.progress !== undefined) updateData.progress = draft.progress;
          if (draft.status) updateData.status = draft.status;
          if (draft.target_date !== undefined) updateData.target_date = draft.target_date;
          const { data, error } = await supabase.from('goals').update(updateData).eq('id', draft.goal_id).select().single();
          if (error) throw new Error(error.message);
          result = data;
          break;
        }
        case 'create_finance_transaction': {
          const { financeRepository } = await import('@/features/finance/repositories/finance.repository');
          result = await financeRepository.createTransaction({
            type: draft.type,
            amount: Number(draft.amount),
            category: draft.category || null,
            description: draft.description || null,
            transaction_date: draft.transaction_date,
          });
          break;
        }
        case 'create_diary_entry': {
          result = await aiRepository.createDiaryEntry(draft.content, draft.mood);
          break;
        }
        case 'create_note': {
          const { createNoteAction } = await import('@/features/notes/actions/note.actions');
          result = await createNoteAction({
            title: draft.title,
            content: draft.content || '',
            excerpt: draft.content ? draft.content.substring(0, 200) : '',
            is_favorite: draft.is_favorite || false,
          });
          break;
        }
        case 'create_project': {
          const { createProjectAction } = await import('@/features/projects/actions/project.actions');
          result = await createProjectAction({
            title: draft.title,
            description: draft.description || '',
            status: draft.status || 'active',
            visibility: 'private',
            featured: false,
            cover_image: null,
            start_date: draft.start_date || null,
            end_date: draft.end_date || null,
          });
          break;
        }
        case 'update_project': {
          const { createClient } = await import('@/lib/supabase/server');
          const supabase = await createClient();
          const updateData: any = {};
          if (draft.title) updateData.title = draft.title;
          if (draft.description !== undefined) updateData.description = draft.description;
          if (draft.status) updateData.status = draft.status;
          if (draft.end_date !== undefined) updateData.end_date = draft.end_date;
          const { data, error } = await supabase.from('projects').update(updateData).eq('id', draft.project_id).select().single();
          if (error) throw new Error(error.message);
          result = data;
          break;
        }
        case 'create_achievement': {
          const { createClient } = await import('@/lib/supabase/server');
          const supabase = await createClient();
          const { data, error } = await supabase.from('achievements').insert({
              title: draft.title,
              description: draft.description || null,
              category: draft.category || null,
              achievement_date: draft.achievement_date || null,
            }).select().single();
          if (error) throw new Error(error.message);
          result = data;
          break;
        }
        case 'create_cms_post': {
          const { createPostDraftAction, updatePostAction } = await import('@/features/cms/actions/posts.actions');
          const postResult = await createPostDraftAction(draft.title, draft.post_type);
          if (!postResult.success) throw new Error(postResult.error || 'Failed to create post');
          if (draft.body && postResult.data) {
            await updatePostAction(postResult.data.id, { body: draft.body });
          }
          result = postResult.data;
          break;
        }
        case 'edit_cms_post': {
          const { updatePostAction } = await import('@/features/cms/actions/posts.actions');
          const updateData: Record<string, any> = {};
          if (draft.title) updateData.title = draft.title;
          if (draft.body) updateData.body = draft.body;
          if (draft.post_type) updateData.post_type = draft.post_type;
          result = await updatePostAction(draft.post_id, updateData);
          break;
        }
        case 'publish_post': {
          const { createClient } = await import('@/lib/supabase/server');
          const supabase = await createClient();
          const { data, error } = await supabase.from('posts').update({ published: true, published_at: new Date().toISOString() }).eq('id', draft.post_id).select().single();
          if (error) throw new Error(error.message);
          result = data;
          break;
        }
        default:
          throw new Error(`Unknown action type: ${type}`);
      }

      return { success: true, data: result };
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[confirmActionAction] Error:', err.message);
    return { success: false, error: err.message };
  }
}
