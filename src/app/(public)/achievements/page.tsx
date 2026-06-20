import { permanentRedirect } from 'next/navigation';

export default function AchievementsPage() {
  permanentRedirect('/explore?tab=achievements');
}

