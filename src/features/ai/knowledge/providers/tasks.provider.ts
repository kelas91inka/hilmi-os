import { IKnowledgeProvider, KnowledgeContext, KnowledgeItem, CompressionLevel } from '../types';
import { moduleRegistry } from '../module-registry';
import { knowledgeCache } from '../cache-manager';
import { ContextCompressor } from '../context-compressor';
import { aiRepository } from '@/features/ai/repositories/ai.repository';

export class TasksKnowledgeProvider implements IKnowledgeProvider {
  name = 'tasks';
  keywords = ['tugas', 'task', 'deadline', 'kerjaan', 'prioritas'];
  basePriority = 90; // High priority

  async getAIContext(query: string, tokenBudget: number): Promise<KnowledgeContext> {
    // 1. Check cache
    let rawTasks = knowledgeCache.get(this.name, 'active');

    // 2. Fetch if not cached (re-using existing DB method)
    if (!rawTasks) {
      rawTasks = await aiRepository.getActiveTasks();
      knowledgeCache.set(this.name, 'active', rawTasks);
    }

    if (!rawTasks || rawTasks.length === 0) {
      return { moduleName: 'Tasks', items: [] };
    }

    // Determine target level based on budget
    const level: CompressionLevel = tokenBudget > 1000 ? 'rich' : tokenBudget > 400 ? 'structured' : 'ultra-summary';

    // 3. Compress Data
    let items: KnowledgeItem[] = [];

    if (level === 'ultra-summary') {
      // Special ultra-summary logic: Aggregate instead of listing individually
      const overdue = rawTasks.filter((t: any) => t.due_date && new Date(t.due_date) < new Date()).length;
      const content = `Total: ${rawTasks.length} active tasks. Overdue: ${overdue}.`;
      items = [{
        title: 'Task Summary',
        importance: overdue > 0 ? 'critical' : 'high',
        content,
        estimatedTokens: ContextCompressor.estimateTokens(content)
      }];
    } else {
      // Rich or Structured: List individual tasks up to budget limit
      items = ContextCompressor.compress(
        rawTasks,
        (task: any) => this.mapTaskToKnowledge(task, level),
        level,
        tokenBudget
      );
    }

    return {
      moduleName: 'Tasks',
      items
    };
  }

  private mapTaskToKnowledge(task: any, level: CompressionLevel): KnowledgeItem | null {
    const isOverdue = task.due_date && new Date(task.due_date) < new Date();
    const isHighPriority = task.priority === 'High' || task.priority === 'Urgent';
    const importance = isOverdue || isHighPriority ? 'critical' : 'medium';
    
    let content = '';
    if (level === 'rich') {
      content = `Status: ${task.status}. Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}. Priority: ${task.priority || 'Normal'}. Description: ${task.description || 'None'}`;
    } else {
      // Structured
      content = `${task.status} | Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}`;
    }

    const estimatedTokens = ContextCompressor.estimateTokens(content + task.title);

    return {
      title: task.title,
      importance,
      content,
      estimatedTokens
    };
  }

  invalidateCache() {
    knowledgeCache.invalidate(this.name);
  }
}

// Auto-register the provider
moduleRegistry.register(new TasksKnowledgeProvider());
