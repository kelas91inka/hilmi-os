"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function NotesSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery) {
        if (query) {
          router.push(`/portal/notes?q=${encodeURIComponent(query)}`);
        } else {
          router.push(`/portal/notes`);
        }
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query, router, initialQuery]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 bg-card p-4 rounded-xl border justify-between items-start sm:items-center w-full">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari catatan..."
          className="pl-9 h-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
