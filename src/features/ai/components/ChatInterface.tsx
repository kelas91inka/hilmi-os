/* eslint-disable */
// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { type Message, type ToolInvocation, DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Sparkles, Zap, Loader2, Mic } from 'lucide-react';
import { saveMessageAction } from '../actions/ai.actions';
import { AIConversation } from '../types/ai.types';

export function ChatInterface({ 
  initialConversation,
  initialMessages = [],
  systemContext = "General",
  isFloating = false
}: { 
  initialConversation: AIConversation,
  initialMessages: Message[],
  systemContext?: string,
  isFloating?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
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
  
  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
      body: { conversationId: initialConversation.id, systemContext },
    }),
    initialMessages,
    maxSteps: 5,
    onFinish: async ({ message }) => {
      const text = message.parts
        ? message.parts
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('')
        : message.content || '';
      await saveMessageAction(initialConversation.id, message.role, text);
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleQuickPrompt = (prompt: string) => {
    sendMessage({ text: prompt });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
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

        {messages.map((m: Message) => (
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
              
              <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                {m.content || 
                  m.parts
                    ?.filter((part: any) => part.type === 'text')
                    .map((part: any) => part.text)
                    .join('') || 
                  ''}
              </div>
              
              {/* Render Tool Invocations */}
              {m.toolInvocations?.map((toolInvocation: ToolInvocation) => (
                <div key={toolInvocation.toolCallId} className="mt-3 bg-muted/60 rounded-xl p-3 text-xs border border-border/80">
                  <div className="flex items-center gap-2 font-medium text-muted-foreground">
                    {toolInvocation.state === 'call' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span>
                      {toolInvocation.toolName === 'get_weekly_tasks' && 'Menganalisis Task Mingguan...'}
                      {toolInvocation.toolName === 'get_active_projects' && 'Membaca Project Aktif...'}
                      {toolInvocation.toolName === 'get_goals_progress' && 'Mengecek Progress Goal...'}
                      {toolInvocation.toolName === 'get_recent_diary' && 'Membaca Jurnal Terbaru...'}
                      {toolInvocation.toolName === 'get_habit_stats' && 'Menganalisis Habit...'}
                      {toolInvocation.toolName === 'create_task' && 'Menambahkan Task Baru...'}
                      {toolInvocation.toolName === 'create_diary_entry' && 'Menambahkan Catatan Jurnal...'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        
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

