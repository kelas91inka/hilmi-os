import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { GalleryCMS } from '@/features/cms/components/GalleryCMS';

export const metadata: Metadata = {
  title: 'Galeri CMS | Hilmi OS',
};

async function getGalleryItems() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function GalleryCMSPage() {
  const items = await getGalleryItems();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <GalleryCMS initialItems={items} />
    </div>
  );
}
