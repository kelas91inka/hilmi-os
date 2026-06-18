"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormValues } from "../validators/task.schema";
import { TASK_STATUS, TASK_PRIORITY } from "../types/task.types";
import { createTaskAction, updateTaskAction } from "../actions/task.actions";
import { Project } from "@/features/projects/types/project.types";
import { Goal } from "@/features/goals/types/goal.types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, Tag, Plus, AlertCircle } from "lucide-react";

type TaskFormProps = {
  initialData?: TaskFormValues & { id?: string };
  projects?: Project[];
  goals?: Goal[];
  onSuccess?: () => void;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function TaskForm({
  initialData,
  projects = [],
  goals = [],
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: TaskFormProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Tag management
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(value);
    } else {
      setUncontrolledOpen(value);
    }
  };

  const defaultValues = initialData || {
    title: "",
    description: "",
    status: TASK_STATUS.BELUM_DIMULAI,
    priority: TASK_PRIORITY.NORMAL,
    due_date: "",
    project_id: "",
    goal_id: "",
    tags: [],
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      const resetTags = initialData?.tags || [];
      reset({ ...defaultValues, tags: resetTags });
      setTags(resetTags);
      setTagInput('');
      setFormError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset]);

  // Sync tags to form state
  useEffect(() => {
    setValue('tags', tags);
  }, [tags, setValue]);

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!trimmed || tags.includes(trimmed) || tags.length >= 10) return;
    setTags(prev => [...prev, trimmed]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    setFormError(null);

    const submissionData = {
      ...data,
      tags,
      project_id: data.project_id === "none" || !data.project_id ? null : data.project_id,
      goal_id: data.goal_id === "none" || !data.goal_id ? null : data.goal_id,
    };

    let result;
    if (initialData?.id) {
      result = await updateTaskAction(initialData.id, submissionData);
    } else {
      result = await createTaskAction(submissionData);
    }

    setIsSubmitting(false);

    if (result.success) {
      setOpen(false);
      reset();
      setTags([]);
      if (onSuccess) onSuccess();
    } else {
      setFormError(result.error || 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {(!isControlled || trigger) && (
        <DialogTrigger
          render={trigger || <Button>Tambah Tugas</Button>}
          nativeButton={!trigger}
        />
      )}
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Tugas" : "Tugas Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              placeholder="Apa yang ingin dikerjakan?"
              {...register("title")}
              className={errors.title ? 'border-red-400 focus-visible:ring-red-400' : ''}
            />
            {errors.title && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Detail tugas (opsional)..."
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TASK_STATUS.BELUM_DIMULAI}>Belum Dimulai</SelectItem>
                      <SelectItem value={TASK_STATUS.SEDANG_DIKERJAKAN}>Sedang Dikerjakan</SelectItem>
                      <SelectItem value={TASK_STATUS.SELESAI}>Selesai</SelectItem>
                      <SelectItem value={TASK_STATUS.DITUNDA}>Ditunda</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Prioritas</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TASK_PRIORITY.RENDAH}>⚪ Rendah</SelectItem>
                      <SelectItem value={TASK_PRIORITY.NORMAL}>🔵 Normal</SelectItem>
                      <SelectItem value={TASK_PRIORITY.TINGGI}>🟠 Tinggi</SelectItem>
                      <SelectItem value={TASK_PRIORITY.KRITIS}>🔴 Kritis</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="due_date">Tenggat Waktu</Label>
            <Input id="due_date" type="date" {...register("due_date")} />
          </div>

          {/* Project + Goal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Proyek</Label>
              <Controller
                control={control}
                name="project_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih proyek..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada</SelectItem>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tujuan</Label>
              <Controller
                control={control}
                name="goal_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tujuan..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada</SelectItem>
                      {goals.map(g => (
                        <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Tags input */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Tags
              <span className="text-xs text-muted-foreground font-normal">(maks. 10)</span>
            </Label>

            {/* Tag chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-foreground transition-colors"
                      aria-label={`Hapus tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag input field */}
            {tags.length < 10 && (
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value.replace(/[^a-zA-Z0-9\-_]/g, ''))}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Ketik tag, tekan Enter..."
                  className="flex-1 h-9 text-sm"
                  maxLength={30}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                  className="h-9 px-3 rounded-md border hover:bg-muted transition-colors disabled:opacity-40 shrink-0"
                  aria-label="Tambah tag"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Hanya huruf, angka, dan tanda hubung. Tekan Enter atau klik + untuk tambah.
            </p>
          </div>

          {/* Form-level error */}
          {formError && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
            </div>
          )}

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Buat Tugas"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
