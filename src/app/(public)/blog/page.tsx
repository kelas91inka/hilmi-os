import { permanentRedirect } from 'next/navigation';

export default function BlogIndexPage() {
  permanentRedirect('/explore?tab=feed');
}
