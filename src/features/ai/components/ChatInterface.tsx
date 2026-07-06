/* eslint-disable */
// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { type UIMessage as Message, type ToolInvocation, DefaultChatTransport } from 'ai';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Sparkles, Zap, Loader2, Mic, AlertCircle, Check, X } from 'lucide-react';
import { AIConversation } from '../types/ai.types';
import { renameConversationAction, saveMessageAction } from '../actions/ai.actions';
import { generateConversationTitle } from '../utils/generate-title';
import { useAIContext } from '../contexts/AIContext';
import { EditableConfirmationCard } from './EditableConfirmationCard';
import { InteractiveDataCard, parseDataMarkers } from './InteractiveDataCard';

const MODULE_ROUTES: Record<string, string> = {
  create_task: '/portal/tasks',
  create_goal: '/portal/goals',
  create_diary_entry: '/portal/diary',
  create_finance_transaction: '/portal/finance',
  update_task_status: '/portal/tasks',
  create_note: '/portal/notes',
  create_project: '/portal/projects',
  create_achievement: '/portal/cms',
  create_cms_post: '/portal/cms',
};

const MODULE_LABELS: Record<string, string> = {
  create_task: 'Tasks',
  create_goal: 'Goals',
  create_diary_entry: 'Diary',
  create_finance_transaction: 'Finance',
  update_task_status: 'Tasks',
  create_note: 'Notes',
  create_project: 'Projects',
  create_achievement: 'CMS',
  create_cms_post: 'CMS Posts',
};


function getMessageText(message: any): string {
  if (message.content && typeof message.content === 'string' && message.content.trim() !== '') {
    return message.content;
  }
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((part: any) => part.type === 'text')
      .map((part: any) => part.text)
      .join('');
  }
  return '';
}

export function ChatInterface({ 
  initialConversation,
  initialMessages = [],
  systemContext = "General",
  isFloating = false,
  onTitleGenerated,
}: { 
  initialConversation: AIConversation,
  initialMessages: Message[],
  systemContext?: string,
  isFloating?: boolean,
  onTitleGenerated?: (title: string) => void,
}) {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  const previousInitialMessagesRef = useRef<Message[]>();
  const isSameInitialMessages = previousInitialMessagesRef.current === initialMessages;
  previousInitialMessagesRef.current = initialMessages;

  console.log(`\n================= USECHAT EXPERIMENT LOGS =================`);
  console.log(`[ChatInterface BEFORE useChat]`);
  console.log(`conversation.id: ${initialConversation.id}`);
  console.log(`initialMessages.length: ${initialMessages?.length || 0}`);
  console.log(`initialMessages === previousInitialMessages: ${isSameInitialMessages}`);
  console.log(`renderCount: ${renderCountRef.current}`);
  console.log(`===========================================================`);

  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setIsOpen: setAIOpen } = useAIContext();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        setIsSpeechSupported(true);
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'id-ID';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };
  
  const { messages, status, sendMessage, error, addToolResult } = useChat({
    id: initialConversation.id,
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
      body: { conversationId: initialConversation.id, systemContext },
    }),
    messages: initialMessages,
    maxSteps: 5,
    onFinish: ({ message }) => {
      // Save the full assistant UIMessage (with parts, toolInvocations) to DB
      if (message?.content || message?.parts?.length) {
        const text = getMessageText(message);
        saveMessageAction(
          initialConversation.id,
          'assistant',
          text,
          JSON.stringify(message)
        ).catch((e: any) =>
          console.error('[ChatInterface] Failed to save assistant message:', e?.message)
        );
      }
    },
    onError: (err) => {
      console.error('[ChatInterface] useChat error:', err);
      setErrorMsg(err?.message || 'Terjadi kesalahan, coba lagi.');
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (status !== 'error') setErrorMsg(null);
  }, [status]);

  useEffect(() => {
    console.log('[ChatInterface] messages updated, count:', messages.length, 'status:', status);
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      console.log('[ChatInterface] Last message role:', last.role, 'parts:', JSON.stringify(last.parts), 'content:', (last as any).content);
    }
  }, [messages, status]);

  const handleQuickPrompt = (prompt: string) => {
    console.log('[ChatInterface] Quick prompt sent:', prompt);
    setErrorMsg(null);
    sendMessage({ text: prompt });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    console.log('[ChatInterface] User sent message:', input);
    setErrorMsg(null);
    
    // Save the user message with full UIMessage data before sending
    const userMsgText = input;
    const userMessage = { id: crypto.randomUUID(), role: 'user' as const, content: userMsgText, parts: [{ type: 'text' as const, text: userMsgText }] };
    saveMessageAction(
      initialConversation.id,
      'user',
      userMsgText,
      JSON.stringify(userMessage)
    ).catch((e: any) =>
      console.error('[ChatInterface] Failed to save user message:', e?.message)
    );
    
    sendMessage({ text: input });
    
    // Auto-title: generate title from first meaningful message if conversation has default title
    const defaultTitles = ['Percakapan Baru', 'Sesi Baru', 'Sesi Cepat'];
    if (defaultTitles.includes(initialConversation.title)) {
      const newTitle = generateConversationTitle(input);
      if (newTitle && newTitle !== initialConversation.title) {
        renameConversationAction(initialConversation.id, newTitle).then(() => {
          onTitleGenerated?.(newTitle);
        }).catch(console.error);
      }
    }
    
    setInput('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={`flex flex-col w-full bg-background ${isFloating ? 'h-full border-none' : 'h-[calc(100vh-3.5rem)] max-w-4xl mx-auto border-x'}`}>
      {!isFloating && (
        <div className="flex items-center gap-3 border-b p-4 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg leading-tight">{initialConversation.title}</h2>
          <p className="text-xs text-muted-foreground font-medium">Hilmi OS AI Assistant</p>
        </div>
      </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-8 py-10">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse-subtle">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-medium">Mulai percakapan dengan AI Assistant...</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2.5 max-w-md">
              <button 
                type="button"
                onClick={() => handleQuickPrompt('Tolong buatkan Review Mingguan dari task saya')} 
                className="text-xs flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border hover:border-primary/30 transition-all font-semibold"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-500" /> Review Mingguan
              </button>
              <button 
                type="button"
                onClick={() => handleQuickPrompt('Analisis progress goal saya saat ini')} 
                className="text-xs flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border hover:border-primary/30 transition-all font-semibold"
              >
                <Zap className="w-3.5 h-3.5 text-blue-500" /> Progress Goal
              </button>
              <button 
                type="button"
                onClick={() => handleQuickPrompt('Apa saja project saya yang sedang aktif?')} 
                className="text-xs flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border hover:border-primary/30 transition-all font-semibold"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-500" /> Project Aktif
              </button>
            </div>
          </div>
        )}

        {messages.map((m: Message, index: number) => {
            return (
          <div key={m.id} className={`flex gap-3 sm:gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            )}
            
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 border shadow-sm ${
              m.role === 'user' 
                ? 'bg-primary border-primary/10 text-primary-foreground rounded-tr-sm' 
                : 'bg-card border-border rounded-tl-sm'
            }`}>
              {/* Render Reasoning Parts */}
              {m.parts?.some((part: any) => part.type === 'reasoning') && (
                <div className="text-xs text-muted-foreground/70 italic border-l-2 pl-2 mb-2 border-primary/35">
                  {m.parts
                    .filter((part: any) => part.type === 'reasoning')
                    .map((part: any) => part.text)
                    .join('')}
                </div>
              )}
              
              <div className="text-sm sm:text-base leading-relaxed">
                {(() => {
                  const text = getMessageText(m);
                  const parts = parseDataMarkers(text);
                  return parts.map((part, i) => {
                    if (part.type === 'data' && part.dataType && part.data && part.data.length > 0) {
                      return <InteractiveDataCard key={i} type={part.dataType} data={part.data} />;
                    }
                    // Assistant messages: render markdown; user messages: plain text
                    if (m.role === 'assistant') {
                      return (
                        <div key={i} className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-blockquote:my-2 prose-a:text-primary">
                          <ReactMarkdown
                            components={{
                              a: ({ href, children }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-muted/60 rounded-lg p-3 text-xs overflow-x-auto border border-border/60">{children}</pre>
                              ),
                              code: ({ className, children, ...props }: any) => {
                                const isBlock = className?.includes('language-');
                                if (isBlock) return <code className={className} {...props}>{children}</code>;
                                return <code className="bg-muted/60 px-1.5 py-0.5 rounded text-xs border border-border/40" {...props}>{children}</code>;
                              },
                            }}
                          >
                            {part.content}
                          </ReactMarkdown>
                        </div>
                      );
                    }
                    return <span key={i} className="whitespace-pre-wrap">{part.content}</span>;
                  });
                })()}
              </div>
              
              {/* Render Tool Invocations */}
              {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
                const { toolCallId, toolName, state } = toolInvocation;
                
                const isActionTool = [
                  'create_task', 'update_task', 'delete_task', 
                  'create_goal', 'update_goal', 'create_diary_entry', 
                  'create_finance_transaction', 'update_task_status', 
                  'create_note', 'create_project', 'update_project', 
                  'create_achievement', 'create_cms_post', 'edit_cms_post', 
                  'publish_post'
                ].includes(toolName);

                // If it's an action tool and we haven't given a result yet, it's a draft
                const isDraftCall = isActionTool && state === 'call';

                // Render result if we have it (from addToolResult)
                if (isActionTool && state === 'result') {
                  const resultMsg = typeof toolInvocation.result === 'string' ? toolInvocation.result : 'Aksi selesai.';
                  const isCancelled = resultMsg.includes('cancelled');
                  const route = MODULE_ROUTES[toolName] || '/portal/dashboard';
                  const label = MODULE_LABELS[toolName] || 'Module';

                  if (isCancelled) {
                    return (
                      <div key={toolCallId} className="mt-3 bg-muted border border-border text-muted-foreground rounded-xl p-3 flex items-center gap-2 text-xs font-semibold shadow-sm">
                        <X className="w-4 h-4 shrink-0" />
                        <span>Aksi dibatalkan.</span>
                      </div>
                    );
                  }

                  return (
                    <div key={toolCallId} className="mt-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl p-3 flex items-center justify-between gap-2 text-xs font-semibold shadow-sm">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                        <span>{resultMsg}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (isFloating) setAIOpen(false);
                          router.push(route);
                        }}
                        className="shrink-0 text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        {label} →
                      </button>
                    </div>
                  );
                }

                if (isDraftCall) {
                  return (
                    <EditableConfirmationCard
                      key={toolCallId}
                      toolCallId={toolCallId}
                      type={toolName}
                      draft={toolInvocation.args}
                      addToolResult={addToolResult}
                      isFloating={isFloating}
                    />
                  );
                }

                // Default status rendering
                return (
                  <div key={toolCallId} className="mt-3 bg-muted/60 rounded-xl p-3 text-xs border border-border/80">
                    <div className="flex items-center gap-2 font-medium text-muted-foreground">
                      {state === 'call' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                      )}
                      <span>
                        {toolName === 'get_weekly_tasks' && 'Menganalisis Task Mingguan...'}
                        {toolName === 'get_active_projects' && 'Membaca Project Aktif...'}
                        {toolName === 'get_goals_progress' && 'Mengecek Progress Goal...'}
                        {toolName === 'get_recent_diary' && 'Membaca Jurnal Terbaru...'}
                        {toolName === 'get_habit_stats' && 'Menganalisis Habit...'}
                        {toolName === 'get_finance_summary' && 'Menganalisis Ringkasan Keuangan...'}
                        {toolName === 'get_achievements' && 'Membaca Pencapaian...'}
                        {toolName === 'get_dashboard_insight' && 'Mengambil Insight Dashboard...'}
                        {toolName === 'create_task' && 'Menyiapkan Draf Task Baru...'}
                        {toolName === 'create_goal' && 'Menyiapkan Draf Goal Baru...'}
                        {toolName === 'create_diary_entry' && 'Menyiapkan Draf Jurnal...'}
                        {toolName === 'create_finance_transaction' && 'Menyiapkan Draf Transaksi Keuangan...'}
                        {toolName === 'update_task_status' && 'Menyiapkan Draf Perubahan Status...'}
                        {toolName === 'create_note' && 'Menyiapkan Draf Note Baru...'}
                        {toolName === 'create_project' && 'Menyiapkan Draf Project Baru...'}
                        {toolName === 'create_achievement' && 'Menyiapkan Draf Achievement...'}
                        {toolName === 'create_cms_post' && 'Menyiapkan Draf Post CMS...'}
                        {!['get_weekly_tasks','get_active_projects','get_goals_progress','get_recent_diary','get_habit_stats','get_finance_summary','get_achievements','get_dashboard_insight','create_task','create_goal','create_diary_entry','create_finance_transaction','update_task_status','create_note','create_project','create_achievement','create_cms_post','get_active_tasks','get_notes','get_weekly_insight','get_monthly_insight','get_cms_posts'].includes(toolName) && `Memanggil: ${toolName}...`}
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </div>
            )}
          </div>
        );
        })}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3 sm:gap-4 justify-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/45 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/45 animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/45 animate-bounce delay-200" />
            </div>
          </div>
        )}

        {/* Error Display */}
        {(errorMsg || error) && (
          <div className="flex gap-3 sm:gap-4 justify-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 border border-destructive/20">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            </div>
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-destructive">
              {errorMsg || error?.message || 'Terjadi kesalahan. Silakan coba lagi.'}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-background border-t">
        <form id="chat-form" onSubmit={onSubmit} className="flex gap-2 relative max-w-3xl mx-auto">
          <Input 
            value={input || ''}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Mendengarkan..." : "Ketik pesan atau gunakan suara..."} 
            className={`flex-1 pr-[5.5rem] h-14 rounded-full bg-muted/30 border-muted-foreground/20 focus-visible:ring-1 focus-visible:bg-background text-base shadow-sm transition-all ${isListening ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
            disabled={isLoading}
          />
          <div className="absolute right-1.5 top-1.5 bottom-1.5 flex gap-1">
            <Button 
              type="button" 
              size="icon" 
              variant={isListening ? "default" : "ghost"}
              className={`h-11 w-11 rounded-full ${isListening ? 'animate-pulse bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={toggleListening}
              disabled={isLoading || !isSpeechSupported}
              title="Perintah Suara"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button 
              type="submit" 
              size="icon" 
              className="h-11 w-11 rounded-full shadow-sm"
              disabled={isLoading || !input?.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
