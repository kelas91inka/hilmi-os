import { diaryRepository } from '../repositories/diary.repository';
import { diaryEntrySchema } from '../validators/diary.schema';

export const diaryService = {
  async getEntries() {
    return diaryRepository.getEntries();
  },

  async getEntryByDate(date: string) {
    return diaryRepository.getEntryByDate(date);
  },

  async upsertEntry(data: unknown) {
    const validated = diaryEntrySchema.parse(data);
    return diaryRepository.upsertEntry(validated);
  },

  async deleteEntry(id: string) {
    return diaryRepository.deleteEntry(id);
  }
};
