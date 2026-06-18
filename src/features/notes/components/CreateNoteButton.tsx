'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createNoteAction } from '../actions/note.actions';

export const CreateNoteButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    const result = await createNoteAction({
      title: 'Untitled Note',
      content: '',
      is_favorite: false,
    });

    if (result.success && result.data) {
      router.push(`/portal/notes/${result.data.id}`);
    } else {
      console.error(result.error);
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCreate} disabled={isLoading}>
      <Plus className="w-4 h-4 mr-2" />
      {isLoading ? 'Creating...' : 'New Note'}
    </Button>
  );
};
