'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderKanban, 
  Target, 
  BookOpen, 
  BookHeart, 
  Repeat, 
  Wallet, 
  Sparkles, 
  Settings,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoutButton } from '@/features/auth/components/logout-button';

const navigation = [
  { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { name: 'Tugas', href: '/portal/tasks', icon: CheckSquare },
  { name: 'Proyek', href: '/portal/projects', icon: FolderKanban },
  { name: 'Tujuan', href: '/portal/goals', icon: Target },
  { name: 'Catatan', href: '/portal/notes', icon: BookOpen },
  { name: 'Diary', href: '/portal/diary', icon: BookHeart },
  { name: 'Kebiasaan', href: '/portal/habits', icon: Repeat },
  { name: 'Keuangan', href: '/portal/finance', icon: Wallet },
  { name: 'Blog', href: '/portal/cms', icon: FileText },
  { name: 'Pengaturan', href: '/portal/settings', icon: Settings },
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/20">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-semibold tracking-tight">Hilmi OS</span>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <LogoutButton />
      </div>
    </div>
  );
}
