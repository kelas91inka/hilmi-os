'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateProfileSettingsAction } from '../actions/posts.actions';
import { User, BookOpen, Wrench, Mail, MessageSquare, Target, Settings, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileSettingsProps {
  initialSettings: Record<string, string>;
}

export function ProfileSettings({ initialSettings }: ProfileSettingsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const settings: Record<string, string> = {};

    formData.forEach((value, key) => {
      settings[key] = value as string;
    });

    startTransition(async () => {
      const result = await updateProfileSettingsAction(settings);
      if (result.success) {
        setMessage({ type: 'success', text: 'Pengaturan profil berhasil disimpan!' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.error || 'Gagal menyimpan pengaturan profil' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Title Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 backdrop-blur-xs p-5 rounded-2xl border glow-card">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
            <Settings className="w-5.5 h-5.5 text-primary" />
            Pengaturan Profil Publik
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sesuaikan deskripsi, kontak, pendidikan, dan kemampuan Anda yang ditampilkan pada halaman utama.
          </p>
        </div>
        <Button type="submit" disabled={isPending} className="rounded-xl font-semibold gap-1.5 shadow-sm">
          {isPending ? 'Menyimpan...' : 'Simpan Profil'}
        </Button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}
        >
          {message.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section: Biodata Utama */}
        <div className="bg-card/45 backdrop-blur-xs border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Biodata Utama
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline / Pekerjaan</Label>
            <Input
              id="tagline"
              name="tagline"
              defaultValue={initialSettings.tagline || ''}
              placeholder="e.g. Student · Builder · System Administrator"
              className="text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografi Singkat (Bio)</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={initialSettings.bio || ''}
              placeholder="Ceritakan siapa Anda secara ringkas..."
              rows={4}
              className="text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal_statement">Pernyataan Personal (Personal Statement)</Label>
            <Textarea
              id="personal_statement"
              name="personal_statement"
              defaultValue={initialSettings.personal_statement || ''}
              placeholder="e.g. Building systems that solve real problems. Exploring technology, education, and innovation."
              rows={3}
              className="text-xs"
            />
          </div>
        </div>

        {/* Section: Fokus & Pendidikan */}
        <div className="bg-card/45 backdrop-blur-xs border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b pb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Pendidikan & Fokus
          </h3>

          <div className="space-y-2">
            <Label htmlFor="education">Pendidikan Terakhir</Label>
            <Input
              id="education"
              name="education"
              defaultValue={initialSettings.education || ''}
              placeholder="e.g. SMK Telkom Sidoarjo — Teknik Komputer dan Jaringan"
              className="text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_focus">Fokus Saat Ini</Label>
            <Textarea
              id="current_focus"
              name="current_focus"
              defaultValue={initialSettings.current_focus || ''}
              placeholder="e.g. Membangun Hilmi OS, mendalami Next.js 15, networking..."
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Keahlian (Pisahkan dengan koma)</Label>
            <Textarea
              id="skills"
              name="skills"
              defaultValue={initialSettings.skills || ''}
              placeholder="e.g. React, Next.js, Linux, Cisco, Mikrotik"
              rows={2}
              className="text-xs"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tech_stack">Tech Stack (Pisahkan dengan koma)</Label>
            <Textarea
              id="tech_stack"
              name="tech_stack"
              defaultValue={initialSettings.tech_stack || ''}
              placeholder="e.g. Next.js, Supabase, TailwindCSS, Cloudinary"
              rows={2}
              className="text-xs"
            />
          </div>
        </div>

        {/* Section: Kontak & Sosial Media */}
        <div className="bg-card/45 backdrop-blur-xs border rounded-2xl p-5 space-y-4 md:col-span-2">
          <h3 className="text-sm font-bold text-foreground border-b pb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Kontak & Sosial Media
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-xs">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialSettings.email || ''}
                placeholder="hilmi@example.com"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-1.5 text-xs">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                WhatsApp (URL atau nomor HP)
              </Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                defaultValue={initialSettings.whatsapp || ''}
                placeholder="e.g. 6281234567890"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-1.5 text-xs">
                <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                Profil GitHub
              </Label>
              <Input
                id="github"
                name="github"
                defaultValue={initialSettings.github || ''}
                placeholder="https://github.com/hilmimuafa"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-1.5 text-xs">
                <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                Profil LinkedIn
              </Label>
              <Input
                id="linkedin"
                name="linkedin"
                defaultValue={initialSettings.linkedin || ''}
                placeholder="https://linkedin.com/in/hilmimuafa"
                className="text-xs"
              />
            </div>
          </div>
        </div>

      </div>
    </form>
  );
}
