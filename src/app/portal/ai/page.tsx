import { Metadata } from 'next';
import { AIChatPageClient } from '@/features/ai/components/AIChatPageClient';

export const metadata: Metadata = {
  title: 'AI Copilot | Hilmi OS',
  description: 'Asisten AI cerdas untuk membantu Anda mengelola tugas, tujuan, proyek, dan lebih banyak lagi.',
};

export default function AIPage() {
  return <AIChatPageClient />;
}
