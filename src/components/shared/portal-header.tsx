'use client';

import { usePathname } from 'next/navigation';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { GlobalSearch } from '@/components/shared/global-search';

const pageTitles: Record<string, string> = {
  '/portal/dashboard': 'Dashboard',
  '/portal/tasks': 'Tugas',
  '/portal/projects': 'Proyek',
  '/portal/goals': 'Tujuan',
  '/portal/notes': 'Catatan',
  '/portal/diary': 'Jurnal',
  '/portal/habits': 'Kebiasaan',
  '/portal/finance': 'Keuangan',
  '/portal/cms': 'Blog & CMS',
  '/portal/settings': 'Pengaturan',
};

const pageIcons: Record<string, string> = {
  '/portal/dashboard': '⚡',
  '/portal/tasks': '✅',
  '/portal/projects': '📁',
  '/portal/goals': '🎯',
  '/portal/notes': '📖',
  '/portal/diary': '📔',
  '/portal/habits': '🔥',
  '/portal/finance': '💰',
  '/portal/cms': '✍️',
  '/portal/settings': '⚙️',
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  for (const [key, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(key + '/')) return title;
  }
  return 'Hilmi OS';
}

function getPageIcon(pathname: string): string {
  if (pageIcons[pathname]) return pageIcons[pathname];
  for (const [key, icon] of Object.entries(pageIcons)) {
    if (pathname.startsWith(key + '/')) return icon;
  }
  return '⚡';
}

export function PortalHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const pageIcon = getPageIcon(pathname);

  return (
    <header
      className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-6 shrink-0"
      aria-label="Header portal"
    >
      {/* Left: Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg leading-none" aria-hidden="true">{pageIcon}</span>
          <h1 className="font-display text-[17px] font-bold tracking-tight text-foreground truncate">
            {pageTitle}
          </h1>
        </div>
        {/* Live sync indicator */}
        <span
          className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0"
          aria-label="Status: tersinkronisasi"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono-num">Live</span>
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <GlobalSearch />
        <ThemeSwitcher />
      </div>
    </header>
  );
}
