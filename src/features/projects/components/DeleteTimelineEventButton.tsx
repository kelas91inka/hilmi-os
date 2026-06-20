"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/features/tasks/components/DeleteConfirmDialog";
import { deleteProjectTimelineEventAction } from "../actions/project.actions";

type DeleteTimelineEventButtonProps = {
  eventId: string;
  projectId: string;
  eventTitle: string;
};

export function DeleteTimelineEventButton({
  eventId,
  projectId,
  eventTitle,
}: DeleteTimelineEventButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProjectTimelineEventAction(eventId, projectId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsOpen(true)}
        disabled={isDeleting}
        title="Hapus dari linimasa"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DeleteConfirmDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Peristiwa Linimasa"
        description={`Apakah Anda yakin ingin menghapus "${eventTitle}" dari linimasa proyek ini?`}
      />
    </>
  );
}
