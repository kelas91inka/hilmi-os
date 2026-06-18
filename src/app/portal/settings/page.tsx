import { Metadata } from 'next';
import { getSettingsAction } from '@/features/settings/actions/settings.actions';
import { SettingsForm } from '@/features/settings/components/SettingsForm';
import { Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pengaturan | Hilmi OS',
  description: 'Kelola preferensi dan sistem Hilmi OS',
};

export default async function SettingsPage() {
  const settings = await getSettingsAction();

  if (!settings) {
    return (
      <div className="p-4 text-red-500">
        Gagal memuat pengaturan. Silakan muat ulang.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary" />
            Pengaturan
          </h2>
          <p className="text-muted-foreground mt-1">
            Kelola preferensi dan sistem Hilmi OS.
          </p>
        </div>
      </div>

      <SettingsForm initialData={settings} />
    </div>
  );
}
