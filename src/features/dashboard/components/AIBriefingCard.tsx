'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, RefreshCw, Brain } from 'lucide-react';

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setIsDone(false);
    if (!text) return;

    let i = 0;
    const speed = Math.max(8, Math.min(25, 2000 / text.length));

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setIsDone(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!isDone && (
        <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse align-middle rounded-full" />
      )}
    </span>
  );
}

export function AIBriefingCard() {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBriefing = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setBriefing(null);

    try {
      const res = await fetch('/api/ai/briefing', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setBriefing(data.text);
      } else {
        setBriefing('Gagal memuat AI Briefing saat ini. Coba refresh.');
      }
    } catch {
      setBriefing('Gagal terhubung ke AI Assistant.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

  return (
    <div className="glow-card rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/6 via-card to-card p-5 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/6 blur-xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              AI Daily Briefing
            </h2>
            <p className="text-[10px] text-muted-foreground">Analisis konteks hari ini</p>
          </div>
        </div>

        <button
          onClick={() => fetchBriefing(true)}
          disabled={loading || refreshing}
          className="w-8 h-8 rounded-xl hover:bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all disabled:opacity-40"
          title="Refresh briefing"
          aria-label="Refresh AI briefing"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="text-sm leading-relaxed text-foreground/90 relative">
        {loading ? (
          <div className="space-y-2.5 animate-pulse">
            <div className="h-3.5 w-full bg-muted/80 rounded-full" />
            <div className="h-3.5 w-[92%] bg-muted/80 rounded-full" />
            <div className="h-3.5 w-[85%] bg-muted/80 rounded-full" />
            <div className="h-3.5 w-[65%] bg-muted/80 rounded-full" />
          </div>
        ) : briefing ? (
          <p className="whitespace-pre-wrap">
            <TypewriterText text={briefing} />
          </p>
        ) : null}
      </div>
    </div>
  );
}
