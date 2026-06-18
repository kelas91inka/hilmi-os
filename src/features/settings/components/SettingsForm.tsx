'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { UserSettings } from '../types/settings.types';
import { updateSettingsAction } from '../actions/settings.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function SettingsForm({ initialData }: { initialData: UserSettings }) {
  const { setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    theme: string;
    language: string;
    timezone: string;
    ai_enabled: boolean;
  }>({
    theme: initialData.theme ?? 'system',
    language: initialData.language ?? 'id',
    timezone: initialData.timezone ?? 'Asia/Jakarta',
    ai_enabled: initialData.ai_enabled ?? true,
  });

  const handleStringChange = (key: 'theme' | 'language' | 'timezone', value: string | null) => {
    const safeValue = value ?? '';
    setFormData(prev => ({ ...prev, [key]: safeValue }));
    if (key === 'theme') setTheme(safeValue);
  };

  const handleBoolChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, ai_enabled: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    
    const result = await updateSettingsAction(formData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Gagal menyimpan pengaturan.');
    }
    
    setLoading(false);
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Preferensi Sistem</CardTitle>
        <CardDescription>
          Kelola tampilan dan perilaku Hilmi OS sesuai preferensi Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Setting */}
        <div className="flex flex-col space-y-2">
          <Label htmlFor="theme">Tampilan (Theme)</Label>
          <Select 
            value={formData.theme} 
            onValueChange={(val) => handleStringChange('theme', val)}
          >
            <SelectTrigger id="theme">
              <SelectValue placeholder="Pilih Tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">Sistem Default</SelectItem>
              <SelectItem value="light">Terang (Light)</SelectItem>
              <SelectItem value="dark">Gelap (Dark)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language Setting */}
        <div className="flex flex-col space-y-2">
          <Label htmlFor="language">Bahasa (Language)</Label>
          <Select 
            value={formData.language} 
            onValueChange={(val) => handleStringChange('language', val)}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Pilih Bahasa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">Bahasa Indonesia</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timezone Setting */}
        <div className="flex flex-col space-y-2">
          <Label htmlFor="timezone">Zona Waktu (Timezone)</Label>
          <Select 
            value={formData.timezone} 
            onValueChange={(val) => handleStringChange('timezone', val)}
          >
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Pilih Zona Waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Jakarta">WIB (Asia/Jakarta)</SelectItem>
              <SelectItem value="Asia/Makassar">WITA (Asia/Makassar)</SelectItem>
              <SelectItem value="Asia/Jayapura">WIT (Asia/Jayapura)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AI Enabled Toggle */}
        <div className="flex flex-row items-center justify-between rounded-lg border dark:border-slate-800 p-4 shadow-sm bg-card transition-colors">
          <div className="space-y-0.5">
            <Label>AI Assistant (Voice & Chat)</Label>
            <div className="text-sm text-muted-foreground">
              Aktifkan atau nonaktifkan fitur AI Copilot di seluruh sistem.
            </div>
          </div>
          <Switch 
            checked={formData.ai_enabled}
            onCheckedChange={(checked) => handleBoolChange(checked)}
          />
        </div>

        <div className="pt-4 flex items-center gap-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Pengaturan
          </Button>
          {success && (
            <div className="text-sm text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Pengaturan berhasil disimpan!</span>
            </div>
          )}
          
          {error && (
            <div className="text-sm text-rose-600 dark:text-rose-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
              <span>{error}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
