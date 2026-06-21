import { cookies } from 'next/headers';
import { type Language } from './i18n';

export async function getLanguageServer(): Promise<Language> {
  try {
    const cookieStore = await cookies();
    const lang = cookieStore.get('lang')?.value;
    return (lang === 'en' ? 'en' : 'id') as Language;
  } catch {
    return 'id';
  }
}
