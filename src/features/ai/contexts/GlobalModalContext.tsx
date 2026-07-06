'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Supported modal action types
export type GlobalModalActionType =
  | 'create_task'
  | 'update_task'
  | 'create_goal'
  | 'update_goal'
  | 'create_diary_entry'
  | 'create_finance_transaction'
  | 'create_note'
  | 'create_project'
  | 'update_project'
  | 'create_achievement'
  | 'create_cms_post'
  | 'update_task_status'
  | 'delete_task'
  | 'edit_cms_post'
  | 'publish_post'
  | 'create_habit';

export interface GlobalModalPayload {
  type: GlobalModalActionType;
  draft: Record<string, any>;
  /** Tool call ID from AI – used to mark the action state back in ChatInterface */
  toolCallId?: string;
}

interface GlobalModalState {
  /** Currently open modal. null = no modal open. */
  activeModal: GlobalModalPayload | null;
  /**
   * Open a modal for an AI action.
   * @param type  The action type (e.g. 'create_task')
   * @param draft Pre-filled form data from the AI tool result
   * @param toolCallId Optional tool call ID for result tracking
   */
  openModal: (type: GlobalModalActionType, draft: Record<string, any>, toolCallId?: string) => void;
  /** Close the current modal */
  closeModal: () => void;
}

const GlobalModalContext = createContext<GlobalModalState | undefined>(undefined);

export function GlobalModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<GlobalModalPayload | null>(null);

  const openModal = (
    type: GlobalModalActionType,
    draft: Record<string, any>,
    toolCallId?: string
  ) => {
    setActiveModal({ type, draft: draft || {}, toolCallId });
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <GlobalModalContext.Provider value={{ activeModal, openModal, closeModal }}>
      {children}
    </GlobalModalContext.Provider>
  );
}

export function useGlobalModal() {
  const ctx = useContext(GlobalModalContext);
  if (!ctx) {
    throw new Error('useGlobalModal must be used within a GlobalModalProvider');
  }
  return ctx;
}
