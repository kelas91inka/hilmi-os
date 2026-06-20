'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  url: string;
  title: string;
}

const SHARE_OPTIONS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`,
  },
  {
    id: 'x',
    label: 'X / Twitter',
    getUrl: (url: string, title: string) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    getUrl: (url: string) =>
      `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

export function ShareButton({ url, title }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        id={`share-btn-${url}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Share"
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-44 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {SHARE_OPTIONS.map(({ id, label, getUrl }) => (
            <a
              key={id}
              href={getUrl(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center px-3 py-2.5 text-sm hover:bg-muted transition-colors"
            >
              {label}
            </a>
          ))}
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors border-t border-border/40"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5 text-emerald-500" /> Disalin!</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Salin Link</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
