"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalMilestoneSchema, GoalMilestoneFormData } from "../validators/goal.schema";
import { createMilestoneAction, updateMilestoneAction } from "../actions/goal.actions";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type MilestoneFormProps = {
  goalId: string;
  initialData?: GoalMilestoneFormData & { id?: string };
  onSuccess?: () => void;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function MilestoneForm({ 
  goalId,
  initialData, 
  onSuccess, 
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: MilestoneFormProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(value);
    } else {
      setUncontrolledOpen(value);
    }
  };

  const defaultValues = useMemo(() => {
    if (!initialData) {
      return {
        title: "",
        description: "",
        completed: false,
        completed_at: "",
      };
    }
    return {
      title: initialData.title || "",
      description: initialData.description || "",
      completed: initialData.completed || false,
      completed_at: initialData.completed_at || "",
    };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(goalMilestoneSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      setFormError(null);
    }
  }, [open, reset, defaultValues]);

  const onSubmit = async (data: GoalMilestoneFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    let result;
    if (initialData?.id) {
      // If toggling completion state, we update completed_at
      if (data.completed && !initialData.completed) {
        data.completed_at = new Date().toISOString();
      } else if (!data.completed && initialData.completed) {
        data.completed_at = null;
      }
      result = await updateMilestoneAction(initialData.id, data, goalId);
    } else {
      if (data.completed) {
        data.completed_at = new Date().toISOString();
      }
      result = await createMilestoneAction(goalId, data);
    }
    
    setIsSubmitting(false);

    if (result.success) {
      setOpen(false);
      reset();
      if (onSuccess) onSuccess();
    } else {
      setFormError(result.error || "Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {(!isControlled || trigger) && (
        <DialogTrigger 
          render={trigger || <Button variant="outline">Tambah Milestone</Button>} 
        />
      )}
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Milestone" : "Milestone Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Milestone</Label>
            <Input id="title" placeholder="Misal: Selesaikan Bab 1..." {...register("title")} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea id="description" rows={2} placeholder="..." {...register("description")} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-2 flex flex-col justify-center">
            <label className="flex items-center space-x-2">
              <input type="checkbox" {...register("completed")} className="h-4 w-4 rounded border-gray-300" />
              <span className="text-sm font-medium">Tandai Selesai</span>
            </label>
          </div>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Simpan Milestone"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
