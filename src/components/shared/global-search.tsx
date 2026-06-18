'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from '@/components/ui/command';
import { performGlobalSearchAction } from '@/features/search/actions/search.actions';
import { SearchResult } from '@/features/search/types/search.types';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        const res = await performGlobalSearchAction(query);
        setResults(res);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const onSelect = (url: string) => {
    setOpen(false);
    setQuery('');
    setResults([]);
    router.push(url);
  };

  const groupedResults = results.reduce((acc, result) => {
    const group = acc[result.type] || [];
    group.push(result);
    acc[result.type] = group;
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/80 transition-colors border shadow-sm"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline-block">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">Ctrl+K</span>
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search across all modules..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Searching...</div>}
          {!loading && results.length === 0 && query.length >= 2 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {!loading && results.length === 0 && query.length < 2 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search.
            </div>
          )}

          {Object.entries(groupedResults).map(([type, items]) => (
            <CommandGroup key={type} heading={type.toUpperCase()} className="capitalize">
              {items.map((item) => (
                <CommandItem 
                  key={item.id} 
                  value={`${item.title} ${item.description}`}
                  onSelect={() => onSelect(item.url)}
                  className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                >
                  <div className="font-medium text-sm leading-none">{item.title}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
