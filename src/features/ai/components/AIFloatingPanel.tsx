"use client";

import { useAIContext } from "../contexts/AIContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChatInterface } from "./ChatInterface";
import { useEffect, useState } from "react";
import { AIConversation } from "../types/ai.types";
import { type UIMessage as Message } from "ai";
import { createConversationAction, getConversationsAction, getConversationMessagesAction } from "../actions/ai.actions";

export function AIFloatingPanel() {
  const { isOpen, setIsOpen, pageContext } = useAIContext();
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch conversation when opened for the first time
    if (isOpen && !conversation) {
      loadConversation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadConversation = async () => {
    setIsLoading(true);
    try {
      const convoResult = await getConversationsAction();
      let activeConvo = convoResult.data?.[0];

      if (!activeConvo) {
        const createResult = await createConversationAction('Sesi Baru');
        if (createResult.success && createResult.data) {
          activeConvo = createResult.data;
        }
      }

      if (activeConvo) {
        setConversation(activeConvo);
        const msgResult = await getConversationMessagesAction(activeConvo.id);
        setInitialMessages((msgResult.data || []).map(m => ({
          id: m.id,
          role: (m.role === 'data' ? 'assistant' : m.role) as "system" | "user" | "assistant",
          content: m.content,
          parts: [{ type: 'text' as const, text: m.content }]
        })));
      }
    } catch (error) {
      console.error("Failed to load conversation", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center z-50 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full z-[100]">
          <SheetHeader className="p-4 border-b bg-card">
            <SheetTitle className="text-left text-lg flex items-center gap-2">
              AI Assistant
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-normal">
                {pageContext}
              </span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-hidden relative">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground animate-pulse">Menghubungkan AI...</p>
              </div>
            ) : conversation ? (
              <ChatInterface 
                initialConversation={conversation}
                initialMessages={initialMessages}
                systemContext={pageContext}
                isFloating={true}
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
