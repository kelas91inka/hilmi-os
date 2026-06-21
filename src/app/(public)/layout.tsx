import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { getLanguageServer } from '@/lib/i18n-server';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLanguageServer();

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <PublicNavbar lang={lang} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <PublicFooter lang={lang} />
    </div>
  );
}
