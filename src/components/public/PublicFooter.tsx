import Link from 'next/link';
import { Mail, Link2 } from 'lucide-react';

const Github = Link2;
const Linkedin = Link2;
const Twitter = Link2;

const SOCIALS = [
  { href: 'https://github.com/hilmimuafa', icon: Github, label: 'GitHub' },
  { href: 'https://linkedin.com/in/hilmimuafa', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://twitter.com/hilmimuafa', icon: Twitter, label: 'X / Twitter' },
  { href: 'mailto:hilmi@muhlim.my.id', icon: Mail, label: 'Email' },
];

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="container mx-auto max-w-4xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <Link href="/" className="text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity">
            Muhlim<span className="text-primary">.</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            © {year} Muhammad Hilmi Mu&apos;afa
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-1">
          {SOCIALS.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              aria-label={label}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
