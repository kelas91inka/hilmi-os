"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema, GoalFormData } from "../validators/goal.schema";
import { createGoalAction, updateGoalAction } from "../actions/goal.actions";
import { GoalType, GoalStatus } from "../types/goal.types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const GOAL_TYPE_LABELS: Record<string, string> = {
  mingguan: "Mingguan",
  bulanan: "Bulanan",
  tahunan: "Tahunan",
  lifetime: "Lifetime",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  completed: "Selesai",
  archived: "Diarsipkan",
};

type GoalFormProps = {
  initialData?: GoalFormData & { id?: string };
  onSuccess?: () => void;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function GoalForm({ 
  initialData, 
  onSuccess, 
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: GoalFormProps) {
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
        goal_type: "bulanan" as GoalType,
        status: "active" as GoalStatus,
        target_date: "",
        progress: 0,
        category: "",
      };
    }
    return {
      title: initialData.title || "",
      description: initialData.description || "",
      goal_type: initialData.goal_type || "bulanan",
      status: initialData.status || "active",
      target_date: initialData.target_date || "",
      progress: initialData.progress || 0,
      category: initialData.category || "",
    };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      const timer = setTimeout(() => setFormError(null), 0);
      return () => clearTimeout(timer);
    }
  }, [open, reset, defaultValues]);

  const onSubmit = async (data: GoalFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    let result;
    if (initialData?.id) {
      result = await updateGoalAction(initialData.id, data);
    } else {
      result = await createGoalAction(data);
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
          render={trigger || <Button>Buat Tujuan Baru</Button>} 
        />
      )}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Tujuan" : "Tujuan Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Tujuan</Label>
            <Input id="title" placeholder="Misal: Mencapai Revenue $10k..." {...register("title")} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" rows={3} placeholder="Penjelasan detail mengapa goal ini penting..." {...register("description")} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipe Tujuan</Label>
              <Controller
                control={control}
                name="goal_type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe">
                        {field.value ? GOAL_TYPE_LABELS[field.value] : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mingguan">Mingguan</SelectItem>
                      <SelectItem value="bulanan">Bulanan</SelectItem>
                      <SelectItem value="tahunan">Tahunan</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.goal_type && <p className="text-sm text-red-500">{errors.goal_type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status">
                        {field.value ? STATUS_LABELS[field.value] : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="archived">Diarsipkan</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">Tanggal Target Penyelesaian (Opsional)</Label>
            <Input id="target_date" type="date" {...register("target_date")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori (Opsional)</Label>
            <Input id="category" placeholder="Misal: Finansial, Karir, Kesehatan, dll" {...register("category")} />
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Buat Tujuan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
