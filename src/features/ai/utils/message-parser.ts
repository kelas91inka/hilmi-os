import { type UIMessage as Message } from 'ai';

/**
 * Parses raw message data from the Supabase repository into standardized UIMessages
 * for the Vercel AI SDK React hooks (useChat).
 */
export function parseStoredMessages(rawMessages: any[]): Message[] {
  const msgs: Message[] = [];
  const seenIds = new Set<string>();

  for (const m of (rawMessages || [])) {
    let restored: Message | null = null;
    
    // Attempt to restore full Vercel AI SDK state from message_data JSON
    if (m.message_data) {
      try {
        const parsed = JSON.parse(m.message_data);
        if (parsed && typeof parsed === 'object') {
          parsed.id = m.id;
          if (parsed.createdAt && typeof parsed.createdAt === 'string') {
            parsed.createdAt = new Date(parsed.createdAt);
          }
          restored = parsed as Message;
        }
      } catch { 
        // fallback to standard processing if JSON parsing fails
      }
    }

    // Fallback if message_data is missing or unparseable
    if (!restored) {
      restored = {
        id: m.id,
        role: (m.role === 'data' ? 'assistant' : m.role) as 'user' | 'assistant',
        parts: [{ type: 'text' as const, text: m.content || '' }],
      };
    }

    // Deduplicate
    if (restored && !seenIds.has(restored.id)) {
      seenIds.add(restored.id);
      msgs.push(restored);
    }
  }

  return msgs;
}
