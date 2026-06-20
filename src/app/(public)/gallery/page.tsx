import { permanentRedirect } from 'next/navigation';

export default function GalleryPage() {
  permanentRedirect('/explore?tab=feed');
}
