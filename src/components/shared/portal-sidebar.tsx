'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Target,
  BookOpen,
  BookHeart,
  Repeat,
  Wallet,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoutButton } from '@/features/auth/components/logout-button';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: 'Utama',
    items: [
      { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
      { name: 'AI Copilot', href: '/portal/ai', icon: Sparkles },
    ],
  },

  {
    label: 'Produktivitas',
    items: [
      { name: 'Tugas', href: '/portal/tasks', icon: CheckSquare },
      { name: 'Proyek', href: '/portal/projects', icon: FolderKanban },
      { name: 'Tujuan', href: '/portal/goals', icon: Target },
    ],
  },
  {
    label: 'Pengetahuan',
    items: [
      { name: 'Catatan', href: '/portal/notes', icon: BookOpen },
      { name: 'Jurnal', href: '/portal/diary', icon: BookHeart },
    ],
  },
  {
    label: 'Pelacakan',
    items: [
      { name: 'Kebiasaan', href: '/portal/habits', icon: Repeat },
      { name: 'Keuangan', href: '/portal/finance', icon: Wallet },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { name: 'CMS', href: '/portal/cms', icon: FileText },
      { name: 'Pengaturan', href: '/portal/settings', icon: Settings },
    ],
  },
];

export function PortalSidebar({
  isMobile = false,
  onClose,
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const isExpanded = isMobile ? true : expanded;

  return (
    <div className={cn(isMobile ? 'h-full w-full' : 'hidden md:block relative h-full shrink-0')}>
      <aside
        className={cn(
          'flex h-full flex-col bg-sidebar transition-all duration-300 ease-in-out overflow-hidden',
          isMobile ? 'w-full border-r-0' : 'border-r',
          isMobile ? '' : (isExpanded ? 'w-56' : 'w-[70px]')
        )}
        aria-label="Navigasi utama"
      >
        {/* Brand */}
        <div className={cn(
          'flex h-[60px] items-center border-b border-sidebar-border shrink-0 px-3',
          isExpanded ? 'justify-start gap-3' : 'justify-center'
        )}>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground glow-primary cursor-pointer"
            title="Hilmi OS"
          >
            <Zap className="h-[18px] w-[18px]" />
          </div>
          {isExpanded && (
            <div>
              <span className="font-display text-base font-bold tracking-tight text-sidebar-foreground block leading-tight">
                Hilmi OS
              </span>
              <span className="text-[10px] text-muted-foreground font-mono-num leading-none">Personal OS</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Menu navigasi">
          {navSections.map((section, sIdx) => (
            <div key={section.label} className={cn(sIdx > 0 && 'mt-5')}>
              {isExpanded && (
                <p className="mb-2 px-2 section-label">
                  {section.label}
                </p>
              )}
              {!isExpanded && sIdx > 0 && (
                <div className="mx-auto my-3 h-px w-8 bg-sidebar-border" />
              )}
              <div className="grid gap-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        if (onClose) onClose();
                      }}
                      aria-label={item.name}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isExpanded ? 'flex-row px-3 py-2.5' : 'flex-col py-2.5 px-0 items-center justify-center',
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent'
                      )}
                    >
                      <Icon
                        className={cn(
                          'shrink-0 transition-colors',
                          isExpanded ? 'h-[18px] w-[18px]' : 'h-[20px] w-[20px]',
                          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                      <span
                        className={cn(
                          'leading-none font-medium transition-all',
                          isExpanded ? 'text-[13px]' : 'text-[9px] mt-0.5',
                          isExpanded ? '' : 'max-w-full truncate text-center'
                        )}
                      >
                        {item.name}
                      </span>

                      {/* Tooltip for collapsed state */}
                      {!isExpanded && (
                        <span
                          className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-popover border border-border px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-xl transition-all duration-150 group-hover:opacity-100 z-50"
                          role="tooltip"
                        >
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: Sync indicator + Logout */}
        <div className={cn('border-t border-sidebar-border p-2 shrink-0 space-y-1.5', isExpanded ? '' : 'flex flex-col items-center')}>
          {/* Sync pulse */}
          <div className={cn(
            'flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium px-2 py-1 rounded-lg',
            !isExpanded && 'justify-center px-0'
          )}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {isExpanded && <span className="font-mono-num">Tersinkron</span>}
          </div>
          <LogoutButton expanded={isExpanded} />
        </div>
      </aside>

      {/* Expand/Collapse Toggle */}
      {!isMobile && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'absolute top-[72px] -right-3 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-sidebar text-muted-foreground shadow-md transition-all hover:text-foreground hover:border-primary/30 hover:shadow-primary/10 focus-visible:ring-2 focus-visible:ring-primary',
            !isExpanded && 'hidden md:flex'
          )}
          aria-label={isExpanded ? 'Ciutkan sidebar' : 'Perluas sidebar'}
        >
          {isExpanded ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
}
