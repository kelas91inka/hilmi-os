import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { GalleryGrid } from '@/components/public/GalleryGrid';

export const metadata: Metadata = {
  title: 'Galeri | Hilmi OS',
  description: 'Koleksi foto dan karya visual Muhammad Hilmi Mu\'afa.',
};

async function getGalleryItems() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('gallery')
    .select('id, title, image_url, description, created_at')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 sm:py-24 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">
          Galeri
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Koleksi Visual
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Momen, karya, dan hal-hal yang layak untuk diabadikan.
        </p>
      </div>

      {/* Item count */}
      {items.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {items.length} foto
        </p>
      )}

      <GalleryGrid items={items} />
    </div>
  );
}
