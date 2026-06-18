import { PortalSidebar } from '@/components/shared/portal-sidebar';
import { PortalHeader } from '@/components/shared/portal-header';
import { AIProvider } from '@/features/ai/contexts/AIContext';
import { AIFloatingPanel } from '@/features/ai/components/AIFloatingPanel';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AIProvider>
      <div className="flex h-screen overflow-hidden bg-background relative">
        <PortalSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <PortalHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
        
        {/* Global Floating AI Assistant */}
        <AIFloatingPanel />
      </div>
    </AIProvider>
  );
}
