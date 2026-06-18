'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, Bot, RefreshCw } from 'lucide-react';

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setIsDone(false);
    if (!text) return;

    let i = 0;
    const speed = Math.max(10, Math.min(30, 2000 / text.length));

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
        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
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
    <div className="rounded-xl border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            AI Daily Briefing
          </h2>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchBriefing(true)}
          disabled={loading || refreshing}
          className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          title="Refresh briefing"
          aria-label="Refresh AI briefing"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="text-sm leading-relaxed text-foreground/90 pl-1">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-[90%] bg-muted rounded" />
            <div className="h-4 w-[80%] bg-muted rounded" />
            <div className="h-4 w-[60%] bg-muted rounded" />
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
