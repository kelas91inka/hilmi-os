import { redirect } from 'next/navigation';

export default function BlogCMSPage() {
  redirect('/portal/cms?tab=posts');
}

