'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function LogoutButton({ expanded = true }: { expanded?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <Button 
      variant="ghost" 
      className={cn(
        "w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive relative group transition-all duration-200",
        !expanded && "justify-center px-0"
      )}
      onClick={handleLogout}
      disabled={isLoading}
      title={!expanded ? "Sign out" : undefined}
    >
      {isLoading ? (
        <Loader2 className={cn("h-4 w-4 animate-spin", expanded && "mr-2")} />
      ) : (
        <LogOut className={cn("h-4 w-4", expanded && "mr-2")} />
      )}
      {expanded && <span>Sign out</span>}

      {!expanded && (
        <span
          className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-popover border border-border px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-xl transition-all duration-150 group-hover:opacity-100 z-50"
          role="tooltip"
        >
          Sign out
        </span>
      )}
    </Button>
  );
}
