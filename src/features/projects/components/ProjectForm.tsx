"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, ProjectFormValues } from "../validators/project.schema";
import { PROJECT_STATUS, PROJECT_VISIBILITY } from "../types/project.types";
import { createProjectAction, updateProjectAction } from "../actions/project.actions";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Link as LinkIcon } from "lucide-react";

type ProjectFormProps = {
  initialData?: ProjectFormValues & { id?: string };
  onSuccess?: () => void;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ProjectForm({ 
  initialData, 
  onSuccess, 
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: ProjectFormProps) {
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
        slug: "",
        description: "",
        status: PROJECT_STATUS.PLANNING,
        visibility: PROJECT_VISIBILITY.PRIVATE,
        start_date: "",
        end_date: "",
        cover_image: "",
        featured: false,
      };
    }
    return {
      title: initialData.title || "",
      slug: initialData.slug || "",
      description: initialData.description || "",
      status: initialData.status || PROJECT_STATUS.PLANNING,
      visibility: initialData.visibility || PROJECT_VISIBILITY.PRIVATE,
      start_date: initialData.start_date || "",
      end_date: initialData.end_date || "",
      cover_image: initialData.cover_image || "",
      featured: initialData.featured || false,
    };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      setFormError(null);
    }
  }, [open, reset, defaultValues]);

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    let result;
    
    // Ensure empty strings are treated as null if needed
    const submissionData = {
      ...data,
      cover_image: data.cover_image?.trim() || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    };

    if (initialData?.id) {
      result = await updateProjectAction(initialData.id, submissionData);
    } else {
      result = await createProjectAction(submissionData);
    }
    
    setIsSubmitting(false);

    if (result.success) {
      setOpen(false);
      reset();
      if (onSuccess) onSuccess();
    } else {
      setFormError(result.error || "Gagal menyimpan project. Silakan coba lagi.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {(!isControlled || trigger) && (
        <DialogTrigger 
          render={trigger || <Button>Buat Project Baru</Button>} 
          nativeButton={!trigger}
        />
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Project" : "Project Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="title">Judul Project <span className="text-red-500">*</span></Label>
              <Input id="title" placeholder="Nama project..." {...register("title")} className={errors.title ? 'border-red-400' : ''} />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="slug">Slug URL (Opsional)</Label>
              <Input id="slug" placeholder="Kosongkan untuk otomatis..." {...register("slug")} />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" rows={3} placeholder="Deskripsi singkat tentang project ini..." {...register("description")} />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cover_image">URL Cover Image (Opsional)</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="cover_image" className="pl-9" placeholder="https://..." {...register("cover_image")} />
            </div>
            <p className="text-[10px] text-muted-foreground">Gambar akan ditampilkan sebagai banner di halaman detail project.</p>
            {errors.cover_image && <p className="text-xs text-red-500">{errors.cover_image.message}</p>}
          </div>

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
                      <SelectItem value={PROJECT_STATUS.PLANNING}>Perencanaan (Planning)</SelectItem>
                      <SelectItem value={PROJECT_STATUS.ACTIVE}>Aktif (Active)</SelectItem>
                      <SelectItem value={PROJECT_STATUS.PAUSED}>Ditunda (Paused)</SelectItem>
                      <SelectItem value={PROJECT_STATUS.COMPLETED}>Selesai (Completed)</SelectItem>
                      <SelectItem value={PROJECT_STATUS.ARCHIVED}>Diarsipkan (Archived)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Visibilitas</Label>
              <Controller
                control={control}
                name="visibility"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih visibilitas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PROJECT_VISIBILITY.PRIVATE}>Private (Internal)</SelectItem>
                      <SelectItem value={PROJECT_VISIBILITY.PUBLIC}>Public (Portfolio)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.visibility && <p className="text-xs text-red-500">{errors.visibility.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Tanggal Mulai</Label>
              <Input id="start_date" type="date" {...register("start_date")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_date">Tanggal Selesai (Opsional)</Label>
              <Input id="end_date" type="date" {...register("end_date")} />
            </div>
          </div>

          <div className="space-y-2 flex flex-col justify-center pt-2">
            <label className="flex items-center space-x-2 p-3 bg-muted/30 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input type="checkbox" {...register("featured")} className="h-4 w-4 rounded border-gray-300 accent-primary" />
              <span className="text-sm font-medium">Jadikan sebagai Featured Project di Portfolio</span>
            </label>
          </div>

          {formError && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mt-4">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
            </div>
          )}

          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Simpan Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
