'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { translations, type Language } from '@/lib/i18n';

export function PublicNavbar({ lang }: { lang: Language }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const t = translations[lang];

  const NAV_LINKS = [
    { href: '/', label: t.navbar.home, exact: true },
    { href: '/explore', label: t.navbar.explore, exact: false },
    { href: '/projects', label: t.navbar.projects, exact: false },
  ];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLanguageToggle = () => {
    const nextLang = lang === 'id' ? 'en' : 'id';
    document.cookie = `lang=${nextLang}; path=/; max-age=31536000`; // 1 year
    localStorage.setItem('lang', nextLang);
    router.refresh();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        scrolled
          ? 'border-b border-border/60 bg-background/90 backdrop-blur-md shadow-sm'
          : 'bg-background/0'
      )}
    >
      <div className="container mx-auto max-w-4xl flex h-14 items-center px-4 justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center font-semibold text-base tracking-tight hover:opacity-80 transition-opacity"
        >
          Muhlim
          <span className="text-primary ml-0.5">.</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                isActive(link.href, link.exact)
                  ? 'text-foreground bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLanguageToggle}
            title={lang === 'id' ? 'Switch to English' : 'Ubah ke Bahasa Indonesia'}
            className="h-9 w-9 text-muted-foreground hover:text-foreground text-xs font-semibold"
          >
            {lang === 'id' ? 'EN' : 'ID'}
          </Button>

          <ThemeSwitcher />

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors ml-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md px-4 py-3 space-y-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex py-2.5 px-3 text-sm font-medium transition-colors rounded-md',
                isActive(link.href, link.exact)
                  ? 'text-foreground bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
