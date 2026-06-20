import { redirect } from 'next/navigation';

export default function GalleryCMSPage() {
  redirect('/portal/cms?tab=posts');
}

