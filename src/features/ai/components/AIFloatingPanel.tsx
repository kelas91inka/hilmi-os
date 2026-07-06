"use client";

import { useAIContext } from "../contexts/AIContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChatInterface } from "./ChatInterface";
import { useEffect, useState, useRef, useCallback } from "react";
import { AIConversation } from "../types/ai.types";
import { type UIMessage as Message } from "ai";
import { createConversationAction, getConversationMessagesAction } from "../actions/ai.actions";
import { parseStoredMessages } from "../utils/message-parser";
import { Sparkles, Loader2 } from "lucide-react";

const SESSION_KEY = 'hilmi_ai_quick_chat_conversation_id';

export function AIFloatingPanel() {
  const { isOpen, setIsOpen, pageContext } = useAIContext();
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const prevOpenRef = useRef(false);
  const initializingRef = useRef(false);

  // Load or create a conversation for the floating panel.
  // Uses sessionStorage to persist the conversation ID across opens/closes
  // within the same browser session, so context is not lost.
  const initConversation = useCallback(async () => {
    if (initializingRef.current) return;
    initializingRef.current = true;
    setIsLoading(true);

    try {
      const savedId = typeof window !== 'undefined'
        ? sessionStorage.getItem(SESSION_KEY)
        : null;

      if (savedId) {
        // Try to resume existing conversation
        try {
          const msgsResult = await getConversationMessagesAction(savedId);
          if (msgsResult.success && msgsResult.data) {
            // Restore conversation object with the saved ID
            const existingConversation: AIConversation = {
              id: savedId,
              title: 'Sesi Cepat',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: '',
            };
            setConversation(existingConversation);

            // Restore messages from DB
            const msgs = parseStoredMessages(msgsResult.data || []);
            setInitialMessages(msgs);
            return;
          }
        } catch {
          // Saved conversation no longer exists, create a new one
          sessionStorage.removeItem(SESSION_KEY);
        }
      }

      // Create a new conversation
      const createResult = await createConversationAction('Sesi Cepat');
      if (createResult.success && createResult.data) {
        const conv = createResult.data;
        sessionStorage.setItem(SESSION_KEY, conv.id);
        setConversation(conv);
        setInitialMessages([]);
      }
    } catch (error) {
      console.error("Failed to init quick chat conversation", error);
    } finally {
      setIsLoading(false);
      initializingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      // Transition from closed → open
      if (!conversation) {
        initConversation();
      }
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, conversation, initConversation]);

  return (
    <>
      {/* Floating Trigger Button — premium design */}
      <button
        id="ai-panel-trigger"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-200 flex items-center justify-center z-40 group glow-primary"
        aria-label="Buka AI Assistant"
        title="AI Assistant (Hilmi OS)"
      >
        <span className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </span>
        {/* Animated ping for first-time hint */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
        </span>
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full z-[100]">

          {/* Sheet Header — premium */}
          <SheetHeader className="p-4 border-b border-border bg-card shrink-0">
            <SheetTitle className="text-left flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-bold block leading-tight">Hilmi AI Assistant</span>
                <span className="text-[10px] text-muted-foreground font-normal font-mono-num">
                  Konteks: {pageContext}
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden relative">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground">Menyiapkan sesi...</p>
              </div>
            ) : conversation ? (
              <ChatInterface
                initialConversation={conversation}
                initialMessages={initialMessages}
                systemContext={pageContext}
                isFloating={true}
                onTitleGenerated={() => {
                  // Floating widget doesn't show conversation list, no update needed
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-red-500">Gagal memuat AI Assistant</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
