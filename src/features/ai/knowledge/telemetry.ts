import { TelemetryData } from './types';

class TelemetryLogger {
  private currentRun: Partial<TelemetryData> | null = null;
  private startTime: number = 0;

  startRun() {
    this.startTime = Date.now();
    this.currentRun = {
      timestamp: new Date().toISOString(),
      intentMethod: 'none',
      selectedModules: [],
      timing: {
        intentMs: 0,
        providerFetchMs: 0,
        compressionMs: 0,
        totalPipelineMs: 0,
      },
      tokenUsage: {
        historyTokens: 0,
        knowledgeTokens: 0,
        remainingBudget: 0,
      },
      errors: [],
    };
  }

  logIntentMethod(method: 'rule-based' | 'llm-fallback', ms: number) {
    if (this.currentRun && this.currentRun.timing) {
      this.currentRun.intentMethod = method;
      this.currentRun.timing.intentMs = ms;
    }
  }

  logSelectedModules(modules: Array<{ name: string; priority: number; allocatedTokens: number }>) {
    if (this.currentRun) {
      this.currentRun.selectedModules = modules;
    }
  }

  logProviderFetchTiming(ms: number) {
    if (this.currentRun && this.currentRun.timing) {
      this.currentRun.timing.providerFetchMs = ms;
    }
  }

  logCompressionTiming(ms: number) {
    if (this.currentRun && this.currentRun.timing) {
      this.currentRun.timing.compressionMs = ms;
    }
  }

  logTokenUsage(history: number, knowledge: number, remaining: number) {
    if (this.currentRun) {
      this.currentRun.tokenUsage = {
        historyTokens: history,
        knowledgeTokens: knowledge,
        remainingBudget: remaining,
      };
    }
  }

  logError(error: string) {
    if (this.currentRun) {
      this.currentRun.errors?.push(error);
    }
  }

  endRun(): TelemetryData | null {
    if (!this.currentRun || !this.currentRun.timing) return null;
    
    this.currentRun.timing.totalPipelineMs = Date.now() - this.startTime;
    
    const finalData = this.currentRun as TelemetryData;
    
    // In development mode or production logging integration, we can emit this to a structured logger.
    // For now, we remain silent as requested, but keep it available for observability.
    // console.debug('[Knowledge Layer Telemetry]', finalData);
    
    this.currentRun = null;
    return finalData;
  }
}

export const telemetryLogger = new TelemetryLogger();
