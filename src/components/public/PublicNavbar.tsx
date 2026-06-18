'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/about', label: 'Tentang' },
  { href: '/projects', label: 'Proyek' },
  { href: '/blog', label: 'Blog' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/achievements', label: 'Pencapaian' },
  { href: '/gallery', label: 'Galeri' },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-5xl flex h-16 items-center px-4 justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 font-bold text-lg">
          Hilmi<span className="text-primary">.OS</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-foreground',
                pathname.startsWith(link.href) ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link
            href="/portal/dashboard"
            className="hidden sm:inline-flex items-center text-xs border rounded-full px-3 py-1.5 font-medium hover:bg-muted transition-colors"
          >
            Dashboard →
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block py-2.5 text-sm font-medium transition-colors hover:text-foreground rounded-md px-2',
                pathname.startsWith(link.href) ? 'text-foreground bg-muted/50' : 'text-foreground/60'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/portal/dashboard"
            onClick={() => setMobileOpen(false)}
            className="block mt-3 py-2.5 text-sm font-semibold text-primary"
          >
            Dashboard →
          </Link>
        </div>
      )}
    </header>
  );
}
