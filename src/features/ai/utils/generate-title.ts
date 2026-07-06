/**
 * Generate a concise 4-6 word title from a user message.
 * Strips filler words and extracts the most meaningful phrase.
 */

const FILLER_WORDS_ID = new Set([
  'tolong', 'bisa', 'bisa kah', 'boleh', 'mohon', 'minta',
  'apa', 'apakah', 'bagaimana', 'gimana', 'kenapa', 'mengapa',
  'siapa', 'dimana', 'kapan', 'berapa',
  'saya', 'aku', 'gue', 'gw', 'kamu', 'anda',
  'ini', 'itu', 'nya', 'yang', 'dan', 'atau', 'tapi',
  'juga', 'saja', 'sudah', 'belum', 'akan', 'mau',
  'dong', 'deh', 'nih', 'sih', 'lah', 'kan',
  'halo', 'hai', 'hey', 'hi', 'hello',
  'buat', 'buatkan', 'bantu', 'coba', 'kasih',
  'kasih tau', 'tunjukkan', 'tampilkan',
  'the', 'a', 'an', 'is', 'are', 'was', 'were',
  'can', 'could', 'would', 'should', 'will',
  'please', 'help', 'me', 'my', 'i', 'you',
  'do', 'does', 'did', 'have', 'has',
  'dengan', 'untuk', 'dari', 'ke', 'di', 'pada',
  'tentang', 'oleh', 'karena', 'jika', 'kalau',
]);

export function generateConversationTitle(message: string): string {
  if (!message || message.trim().length < 3) {
    return 'Percakapan AI';
  }

  // Clean the message
  let cleaned = message
    .replace(/[?!.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  // Split into words
  const words = cleaned.split(' ').filter(w => w.length > 0);

  // Remove leading filler words
  let startIndex = 0;
  while (startIndex < words.length && FILLER_WORDS_ID.has(words[startIndex])) {
    startIndex++;
  }

  // If all words are fillers, start from beginning
  if (startIndex >= words.length) {
    startIndex = 0;
  }

  // Take 4-6 meaningful words
  const meaningful = words.slice(startIndex, startIndex + 6);

  if (meaningful.length === 0) {
    return 'Percakapan AI';
  }

  // Capitalize first letter
  const title = meaningful.join(' ');
  return title.charAt(0).toUpperCase() + title.slice(1);
}
