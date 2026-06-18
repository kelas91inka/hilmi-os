import { ThemeSwitcher } from '@/components/theme-switcher';
import { GlobalSearch } from '@/components/shared/global-search';

export function PortalHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <GlobalSearch />
        <ThemeSwitcher />
      </div>
    </header>
  );
}
