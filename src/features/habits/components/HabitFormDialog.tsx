'use client';

import * as React from 'react';
import { useState, ReactElement } from 'react';
import { HabitFormData, habitSchema } from '../validators/habit.schema';
import { createHabitAction, updateHabitAction } from '../actions/habit.actions';
import { Habit } from '../types/habit.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface HabitFormDialogProps {
  initialData?: Habit;
  draftData?: { title?: string; description?: string; target_frequency?: string };
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HabitFormDialog({
  initialData,
  draftData,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: HabitFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(value);
    } else {
      setUncontrolledOpen(value);
    }
  };

  const [formData, setFormData] = useState<HabitFormData>({
    title: draftData?.title || initialData?.title || '',
    description: draftData?.description || initialData?.description || '',
    target_frequency: (draftData?.target_frequency || initialData?.target_frequency || 'daily') as any,
    active: initialData ? initialData.active : true,
  });

  // Sync when draftData changes (AI pre-fill)
  React.useEffect(() => {
    if (draftData) {
      setFormData(prev => ({
        ...prev,
        title: draftData.title || prev.title,
        description: draftData.description || prev.description,
        target_frequency: (draftData.target_frequency || prev.target_frequency) as any,
      }));
    }
  }, [draftData?.title, draftData?.description, draftData?.target_frequency]);

  // Keep form sync when initialData/open changes (pre-filling form)
  React.useEffect(() => {
    if (open && initialData) {
      const timer = setTimeout(() => {
        setFormData({
          title: initialData.title,
          description: initialData.description || '',
          target_frequency: initialData.target_frequency,
          active: initialData.active,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const validated = habitSchema.parse(formData);
      
      let result;
      if (initialData) {
        result = await updateHabitAction(initialData.id, validated);
      } else {
        result = await createHabitAction(validated);
      }

      if (result.success) {
        setOpen(false);
        if (!initialData) {
          // Reset form on successful creation
          setFormData({ title: '', description: '', target_frequency: 'daily', active: true });
        }
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Validation error');
      } else {
        setError('Validation error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            trigger || (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Habit
              </Button>
            )
          }
        />
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <div className="text-sm text-destructive">{error}</div>}
          
          <div className="space-y-2">
            <Label htmlFor="title">Habit Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Read 20 pages"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Why is this important?"
            />
          </div>

          {/* Target Frequency can be expanded here later */}

          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="mr-2">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
