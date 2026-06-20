'use client';

import React, { useState, useTransition, useRef } from 'react';
import { Upload, Link as LinkIcon, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadImageAction } from '@/features/cms/actions/upload.actions';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUploader({
  label,
  value,
  onChange,
  placeholder = 'https://...',
  className,
}: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>(value ? 'url' : 'upload');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      const result = await uploadImageAction(formData);
      if (result.success && result.url) {
        onChange(result.url);
      } else {
        setError(result.error || 'Gagal mengunggah gambar');
      }
    });

    // Reset input file value so user can upload same file again if deleted
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (isPending) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Hanya dapat mengunggah berkas gambar.');
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      const result = await uploadImageAction(formData);
      if (result.success && result.url) {
        onChange(result.url);
      } else {
        setError(result.error || 'Gagal mengunggah gambar');
      }
    });
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</Label>}
      
      <div className="border rounded-xl bg-card/45 backdrop-blur-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-border/60 bg-muted/30">
          <button
            type="button"
            className={cn(
              'flex-1 py-2 text-xs font-medium border-b-2 transition-all flex items-center justify-center gap-1.5',
              activeTab === 'upload'
                ? 'border-primary text-primary bg-background/50 font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('upload')}
          >
            <Upload className="w-3.5 h-3.5" />
            Unggah Berkas
          </button>
          <button
            type="button"
            className={cn(
              'flex-1 py-2 text-xs font-medium border-b-2 transition-all flex items-center justify-center gap-1.5',
              activeTab === 'url'
                ? 'border-primary text-primary bg-background/50 font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('url')}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            URL Teks
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'upload' ? (
            <div className="space-y-3">
              {value ? (
                /* Uploaded Preview State */
                <div className="relative group rounded-lg overflow-hidden border border-border aspect-video bg-muted/20 max-h-48 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemove}
                      className="gap-1.5 shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ) : (
                /* Empty Upload Target */
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2.5',
                    isPending
                      ? 'border-muted-foreground/30 bg-muted/10 cursor-not-allowed'
                      : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5'
                  )}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={isPending}
                  />
                  {isPending ? (
                    <>
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-xs text-muted-foreground">Sedang mengunggah gambar ke Cloudinary...</p>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Klik untuk memilih atau seret gambar ke sini</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Mendukung format PNG, JPG, JPEG (Maks. 5MB)</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Input URL Tab */
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      onChange(e.target.value);
                      setError(null);
                    }}
                    placeholder={placeholder}
                    className="pl-9 text-xs"
                  />
                </div>
                {value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemove}
                    className="text-destructive hover:bg-destructive/10 shrink-0 h-9 w-9"
                    title="Kosongkan URL"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {value && (
                <div className="rounded-lg overflow-hidden border border-border aspect-video bg-muted/20 max-h-36 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt="Preview URL"
                    className="max-h-full max-w-full object-contain"
                    onError={() => setError('Gagal memuat preview gambar dari URL ini.')}
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive mt-2 leading-relaxed bg-destructive/10 p-2 rounded-md border border-destructive/20">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
