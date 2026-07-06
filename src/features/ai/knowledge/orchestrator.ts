import { intentResolver } from '../registry/intent-resolver';
import { tokenBudgetManager } from './token-budget';
import { contextBuilder } from './context-builder';
import { contextBudgetEnforcer } from './context-budget-enforcer';
import { telemetryLogger } from './telemetry';
import { KnowledgeContext } from './types';
import './module-registry';

import './providers/tasks.provider';
import '../actions/providers/tasks.action';
import './providers/notes.provider';
import '../actions/providers/notes.action';
import './providers/projects.provider';
import '../actions/providers/projects.action';
import './providers/goals.provider';
import '../actions/providers/goals.action';
import './providers/habits.provider';
import './providers/finance.provider';
import '../actions/providers/finance.action';
import './providers/diary.provider';
import '../actions/providers/diary.action';
import './providers/cms.provider';
import '../actions/providers/cms.action';
import './providers/achievements.provider';
import '../actions/providers/achievements.action';

export class KnowledgeOrchestrator {
  /**
   * The primary entry point for the AI Knowledge Layer.
   * Safe to call inside API routes; will never throw an exception that breaks the chat.
   * 
   * @param userQuery The latest message from the user
   * @param historyTokens Estimated token count of the conversation history
   */
  async buildContext(userQuery: string, historyTokens: number = 1000): Promise<string> {
    try {
      telemetryLogger.startRun();
      
      // 1. Intent Detection
      const { modules } = await intentResolver.resolve(userQuery);
      const selectedModules = modules.map(m => m.knowledgeProvider).filter(Boolean) as any[];
      
      // 2. Token Budgeting
      const { allocations, remainingBudget } = tokenBudgetManager.distributeBudget(historyTokens, selectedModules);
      
      telemetryLogger.logSelectedModules(
        selectedModules.map(m => ({ 
          name: m.name, 
          priority: m.basePriority, 
          allocatedTokens: allocations.get(m.name) || 0 
        }))
      );

      if (selectedModules.length === 0) {
        telemetryLogger.endRun();
        return '';
      }

      // 3. Parallel Provider Fetch & Compression
      // Note: Compression happens inside the provider using ContextCompressor based on allocated budget
      const startFetch = Date.now();
      const promises = selectedModules.map(async (provider) => {
        const budget = allocations.get(provider.name) || 0;
        try {
          return await provider.getAIContext(userQuery, budget);
        } catch (error: any) {
          telemetryLogger.logError(`Provider ${provider.name} failed: ${error.message}`);
          return null; // Failsafe: Continue without this module
        }
      });

      const results = (await Promise.all(promises)).filter(Boolean) as KnowledgeContext[];
      telemetryLogger.logProviderFetchTiming(Date.now() - startFetch);

      // 4. Budget Enforcement (Strict Limit before string assembly)
      const enforcedResults = contextBudgetEnforcer.enforce(results, remainingBudget);

      // 5. Context Assembly
      const startBuild = Date.now();
      const finalContext = contextBuilder.build(enforcedResults);
      telemetryLogger.logCompressionTiming(Date.now() - startBuild);

      // 5. Final Telemetry Update
      const estimatedUsedTokens = Math.ceil(finalContext.length / 4);
      telemetryLogger.logTokenUsage(historyTokens, estimatedUsedTokens, remainingBudget - estimatedUsedTokens);
      telemetryLogger.endRun();

      return finalContext;
    } catch (error: any) {
      // Global failsafe: if anything breaks, return empty context so chat continues natively.
      console.error("[KnowledgeOrchestrator] Global Failsafe Triggered:", error);
      try {
        telemetryLogger.logError(`Orchestrator failed: ${error.message}`);
        telemetryLogger.endRun();
      } catch (e) {} // Ignore telemetry errors
      return '';
    }
  }
}

export const knowledgeOrchestrator = new KnowledgeOrchestrator();
