"use client";

import { useEffect } from "react";
import { useAIContext } from "../contexts/AIContext";

export function PageContextSetter({ context }: { context: string }) {
  const { setPageContext } = useAIContext();

  useEffect(() => {
    setPageContext(context);
  }, [context, setPageContext]);

  return null;
}
