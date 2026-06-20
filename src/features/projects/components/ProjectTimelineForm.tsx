"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectTimelineSchema, ProjectTimelineFormValues } from "../validators/project.schema";
import { createProjectTimelineEventAction } from "../actions/project.actions";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, CalendarIcon, Plus } from "lucide-react";

type ProjectTimelineFormProps = {
  projectId: string;
  onSuccess?: () => void;
  trigger?: React.ReactElement;
};

export function ProjectTimelineForm({
  projectId,
  onSuccess,
  trigger,
}: ProjectTimelineFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectTimelineFormValues>({
    resolver: zodResolver(projectTimelineSchema),
    defaultValues: {
      title: "",
      description: "",
      event_date: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: "",
        description: "",
        event_date: new Date().toISOString().split("T")[0],
      });
      setFormError(null);
    }
  }, [open, reset]);

  const onSubmit = async (data: ProjectTimelineFormValues) => {
    setIsSubmitting(true);
    setFormError(null);

    const submissionData = {
      ...data,
      description: data.description?.trim() || null,
      event_date: data.event_date || null,
    };

    const result = await createProjectTimelineEventAction(projectId, submissionData);
    setIsSubmitting(false);

    if (result.success) {
      setOpen(false);
      reset();
      if (onSuccess) onSuccess();
    } else {
      setFormError(result.error || "Gagal menyimpan peristiwa linimasa. Silakan coba lagi.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button size="sm" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Tambah Event
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Tambah Peristiwa Linimasa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul Peristiwa / Milestone <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              placeholder="e.g. Kickoff Proyek, Rilis v1.0, Integrasi API..."
              {...register("title")}
              className={errors.title ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {errors.title && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Detail mengenai pencapaian atau peristiwa ini..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Event Date */}
          <div className="space-y-1.5">
            <Label htmlFor="event_date">Tanggal</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="event_date"
                type="date"
                className="pl-9"
                {...register("event_date")}
              />
            </div>
            {errors.event_date && (
              <p className="text-xs text-red-500">{errors.event_date.message}</p>
            )}
          </div>

          {formError && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
            </div>
          )}

          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Peristiwa"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
