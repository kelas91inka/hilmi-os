import { permanentRedirect } from 'next/navigation';

export default function TimelinePage() {
  permanentRedirect('/explore?tab=journey');
}
