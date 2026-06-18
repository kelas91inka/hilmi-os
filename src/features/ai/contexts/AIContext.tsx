"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIContextState {
  isOpen: boolean;
  pageContext: string;
  setIsOpen: (isOpen: boolean) => void;
  setPageContext: (context: string) => void;
  openAIWithContext: (context: string) => void;
}

const AIContext = createContext<AIContextState | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pageContext, setPageContext] = useState("Dashboard");

  const openAIWithContext = (context: string) => {
    setPageContext(context);
    setIsOpen(true);
  };

  return (
    <AIContext.Provider value={{ isOpen, pageContext, setIsOpen, setPageContext, openAIWithContext }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
}
