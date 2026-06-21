'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MessageCircle, Send, User } from 'lucide-react';
import { submitComment } from '@/features/feed/actions/comment.action';
import { getDateLocale, translations, type Language } from '@/lib/i18n';

interface Comment {
  id: string;
  display_name: string;
  body: string;
  created_at: string;
}

interface Props {
  postId: string;
  initialComments: Comment[];
  lang?: Language;
}

function getFingerprint(): string {
  const key = 'mhlm_fp';
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, fp);
  }
  return fp;
}

export function CommentSection({ postId, initialComments, lang = 'id' }: Props) {
  const [comments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];
  const dateLocale = getDateLocale(lang);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError(null);

    const fp = getFingerprint();
    const result = await submitComment(postId, body, name || t.comments.anonymous, fp);

    setLoading(false);
    if (result.status === 'success') {
      setSubmitted(true);
      setBody('');
      setName('');
    } else {
      setError(result.message ?? t.comments.errorSubmit);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-semibold text-base">
          {comments.length > 0
            ? `${comments.length} ${lang === 'en' && comments.length > 1 ? 'Comments' : t.comments.header}`
            : t.comments.header}
        </h2>
      </div>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{comment.display_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(comment.created_at), 'd MMM yyyy', { locale: dateLocale })}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t.comments.emptyState}</p>
      )}

      {/* Comment form */}
      <div className="border-t border-border/60 pt-6">
        {submitted ? (
          <div className="p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground text-center">
            {t.comments.successSubmit}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <h3 className="text-sm font-semibold">{t.comments.addComment}</h3>

            <input
              type="text"
              id="comment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.comments.placeholderName}
              maxLength={80}
              className="w-full text-sm border border-border/60 bg-background rounded-xl px-4 py-2.5 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
            />

            <textarea
              id="comment-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t.comments.placeholderBody}
              rows={3}
              maxLength={1000}
              required
              className="w-full text-sm border border-border/60 bg-background rounded-xl px-4 py-2.5 placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
            />

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {t.comments.reviewNotice}
              </p>
              <button
                type="submit"
                disabled={loading || !body.trim()}
                id="comment-submit"
                className="inline-flex items-center gap-2 bg-foreground text-background text-sm font-medium px-4 py-2 rounded-xl hover:opacity-85 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? t.comments.submittingBtn : t.comments.submitBtn}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
