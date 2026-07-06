/* eslint-disable */
// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from '@/features/ai/components/ChatInterface';
import { type UIMessage as Message } from 'ai';
import { AIConversation } from '@/features/ai/types/ai.types';
import {
  getConversationsAction,
  createConversationAction,
  getConversationMessagesAction,
} from '@/features/ai/actions/ai.actions';
import { parseStoredMessages } from '@/features/ai/utils/message-parser';
import {
  Brain, Plus, MessageSquare, Loader2, Trash2, Edit2, Check, X, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { renameConversationAction, deleteConversationAction } from '@/features/ai/actions/ai.actions';
import { PageContextSetter } from './PageContextSetter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: {
  conversation: AIConversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleRename = async () => {
    if (title.trim() && title !== conversation.title) {
      await onRename(conversation.id, title.trim());
    }
    setEditing(false);
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150',
        isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/60 border border-transparent'
      )}
      onClick={() => !editing && onSelect()}
    >
      <MessageSquare className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />

      {editing ? (
        <input
          autoFocus
          className="flex-1 text-xs bg-transparent outline-none border-b border-primary/50"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') { setTitle(conversation.title); setEditing(false); }
          }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span className={cn('flex-1 text-xs truncate', isActive ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
          {conversation.title}
        </span>
      )}

      <div className={cn('flex gap-0.5', editing ? 'flex' : 'hidden group-hover:flex')} onClick={e => e.stopPropagation()}>
        {editing ? (
          <>
            <button className="p-1 rounded hover:bg-primary/10 text-primary" onClick={handleRename}><Check className="w-3 h-3" /></button>
            <button className="p-1 rounded hover:bg-muted text-muted-foreground" onClick={() => { setTitle(conversation.title); setEditing(false); }}><X className="w-3 h-3" /></button>
          </>
        ) : (
          <>
            <button className="p-1 rounded hover:bg-muted text-muted-foreground" onClick={(e) => { e.stopPropagation(); setEditing(true); }}><Edit2 className="w-3 h-3" /></button>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger 
                className="p-1 rounded hover:bg-destructive/10 text-destructive/70 hover:text-destructive" 
                onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
              >
                <Trash2 className="w-3 h-3" />
              </DialogTrigger>
              <DialogContent onClick={e => e.stopPropagation()}>
                <DialogHeader>
                  <DialogTitle>Hapus Percakapan?</DialogTitle>
                  <DialogDescription>
                    Apakah Anda yakin ingin menghapus "{conversation.title}"? Semua pesan di dalamnya akan terhapus secara permanen.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>Batal</Button>
                  <Button variant="destructive" onClick={() => { setDeleteOpen(false); onDelete(conversation.id); }}>
                    Hapus
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}

export function AIChatPageClient() {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConvo, setIsLoadingConvo] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoadingConvo(true);
    const result = await getConversationsAction();
    if (result.success && result.data) {
      setConversations(result.data);
      setIsLoadingConvo(false); // selesaikan loading sidebar dulu
      // Auto-select first conversation
      if (result.data.length > 0 && !activeConversation) {
        await selectConversation(result.data[0]);
      } else if (result.data.length === 0) {
        await createNewConversation();
      }
    } else {
      setIsLoadingConvo(false);
    }
  };

  const selectConversation = async (conv: AIConversation) => {
    // Mount loading state FIRST so ChatInterface unmounts before switching conversation
    setIsLoadingMessages(true);
    setMessages([]);
    setActiveConversation(conv);

    const result = await getConversationMessagesAction(conv.id);
    const msgs = parseStoredMessages(result.data || []);
    setMessages(msgs);
    setIsLoadingMessages(false);
  };



  const createNewConversation = async () => {
    const title = `Percakapan Baru`;
    const result = await createConversationAction(title);
    if (result.success && result.data) {
      setConversations(prev => [result.data!, ...prev]);
      setActiveConversation(result.data!);
      setMessages([]);
    }
  };

  const handleRename = async (id: string, newTitle: string) => {
    const result = await renameConversationAction(id, newTitle);
    if (result.success) {
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
      if (activeConversation?.id === id) setActiveConversation(prev => prev ? { ...prev, title: newTitle } : null);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteConversationAction(id);
    if (result.success) {
      const remaining = conversations.filter(c => c.id !== id);
      setConversations(remaining);
      if (activeConversation?.id === id) {
        if (remaining.length > 0) {
          await selectConversation(remaining[0]);
        } else {
          await createNewConversation();
        }
      }
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-background overflow-hidden -mx-4 md:-mx-6 -mt-4 md:-mt-6">
      <PageContextSetter context="AI Copilot — Portal Percakapan AI" />
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className={cn(
        'flex-col border-r border-border bg-card/50 transition-all duration-300 overflow-hidden',
        sidebarOpen ? 'w-64 flex' : 'w-0 hidden'
      )}>
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-sm text-foreground flex-1">AI Copilot</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={createNewConversation} title="Percakapan Baru">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-xs bg-background/50"
              placeholder="Cari percakapan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {isLoadingConvo ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Tidak ada percakapan</p>
          ) : (
            filteredConversations.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeConversation?.id === conv.id}
                onSelect={() => selectConversation(conv)}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Main Chat Area ──────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card/50 shrink-0">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title="Toggle sidebar"
          >
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold truncate">
              {activeConversation?.title || 'AI Copilot'}
            </span>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] text-muted-foreground bg-primary/8 border border-primary/15 px-2 py-0.5 rounded-full font-mono-num">
              llama-3.1-8b
            </span>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          {isLoadingMessages ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm">Memuat percakapan...</p>
            </div>
          ) : activeConversation ? (
            <ChatInterface
              key={activeConversation.id}
              initialConversation={activeConversation}
              initialMessages={messages}
              systemContext="AI Copilot — Full System"
              isFloating={true}
              onTitleGenerated={(newTitle) => {
                setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, title: newTitle } : c));
                setActiveConversation(prev => prev ? { ...prev, title: newTitle } : null);
              }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Brain className="w-12 h-12 text-primary/30" />
              <p className="text-sm text-muted-foreground">Pilih atau buat percakapan baru</p>
              <Button onClick={createNewConversation} size="sm">
                <Plus className="w-4 h-4 mr-2" /> Percakapan Baru
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
