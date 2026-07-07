'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Check, X, Loader2, Play, Sparkles
} from 'lucide-react';
import { confirmActionAction } from '../actions/ai.actions';
import { useAIContext } from '../contexts/AIContext';

interface EditableConfirmationCardProps {
  toolCallId: string;
  type: string;
  draft: Record<string, any>;
  addToolResult: (params: { toolCallId: string; result: any }) => void;
  isFloating?: boolean;
}

export function EditableConfirmationCard({
  toolCallId,
  type,
  draft: initialDraft,
  addToolResult,
  isFloating = false,
}: EditableConfirmationCardProps) {
  const [draft, setDraft] = useState(initialDraft || {});
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const router = useRouter();
  const { setIsOpen: setAIOpen } = useAIContext();

  const handleConfirm = async () => {
    setIsPending(true);
    setErrorMsg(null);
    try {
      const res = await confirmActionAction(type, draft);
      if (res.success) {
        // Send success back to stream
        addToolResult({ 
          toolCallId, 
          result: `Action ${type} completed successfully.` 
        });
        
        // Granular UI Refresh
        router.refresh(); 
      } else {
        setErrorMsg('error' in res ? res.error : 'Gagal mengeksekusi aksi.');
        setIsPending(false);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Terjadi kesalahan sistem.');
      setIsPending(false);
    }
  };

  const handleCancel = () => {
    addToolResult({
      toolCallId,
      result: `User cancelled the ${type} action.`
    });
  };

  // Helper to render editable fields dynamically based on draft keys
  const renderEditableFields = () => {
    return Object.keys(draft).map(key => {
      // Ignore hidden or complex fields for now, or format them based on keys
      if (key === 'task_id' || key === 'project_id' || key === 'post_id') return null;

      const value = draft[key];
      const isString = typeof value === 'string';
      const isNumber = typeof value === 'number';

      if (!isString && !isNumber && value !== undefined && value !== null) return null; // skip objects

      return (
        <div key={key} className="space-y-1">
          <Label className="text-xs uppercase text-muted-foreground font-semibold">{key.replace(/_/g, ' ')}</Label>
          {key === 'description' || key === 'body' || key === 'content' ? (
            <Textarea 
              value={value || ''} 
              onChange={(e) => setDraft(prev => ({ ...prev, [key]: e.target.value }))}
              className="text-sm bg-background border-border min-h-[80px]"
            />
          ) : (
            <Input 
              value={value || ''} 
              type={isNumber ? 'number' : 'text'}
              onChange={(e) => setDraft(prev => ({ ...prev, [key]: isNumber ? Number(e.target.value) : e.target.value }))}
              className="text-sm bg-background border-border h-8"
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className="mt-3 bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="p-3 bg-muted/50 border-b border-border/50 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold tracking-tight text-foreground">
          Konfirmasi {type.replace(/_/g, ' ')}
        </h4>
        <Badge variant="secondary" className="ml-auto text-[10px] uppercase font-bold">Draf</Badge>
      </div>

      <div className="p-3 space-y-3">
        {errorMsg && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md font-medium">
            {errorMsg}
          </div>
        )}
        
        {renderEditableFields()}
      </div>

      <div className="p-3 bg-muted/30 border-t border-border/50 flex items-center justify-end gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCancel}
          disabled={isPending}
          className="h-8 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Batal
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleConfirm}
          disabled={isPending}
          className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1" />}
          {isPending ? 'Menyimpan...' : 'Konfirmasi & Simpan'}
        </Button>
      </div>
    </div>
  );
}
