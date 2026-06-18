"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeleteConfirmDialog } from "@/features/tasks/components/DeleteConfirmDialog";
import { deleteHabitAction } from "../actions/habit.actions";

interface DeleteHabitButtonProps {
  habitId: string;
  habitTitle: string;
}

export function DeleteHabitButton({ habitId, habitTitle }: DeleteHabitButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const result = await deleteHabitAction(habitId);
    if (result.success) {
      router.push("/portal/habits");
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 hover:text-destructive border-transparent hover:border-destructive/30">
        <Trash2 className="w-4 h-4 mr-2" />
        Hapus
      </Button>

      <DeleteConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Habit"
        description={`Apakah Anda yakin ingin menghapus habit "${habitTitle}"? Semua riwayat penyelesaian (logs) untuk habit ini juga akan terhapus. Tindakan ini tidak dapat dibatalkan.`}
      />
    </>
  );
}
