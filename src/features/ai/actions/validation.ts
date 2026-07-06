import { z } from 'zod';

export class ActionValidator {
  /**
   * Validates a payload against a Zod schema.
   * If validation fails, it throws a user-friendly error that the LLM can understand and correct.
   */
  static validate<T>(schema: z.ZodSchema<T>, payload: unknown, actionName: string): T {
    const result = schema.safeParse(payload);
    
    if (!result.success) {
      const errorMessages = result.error.errors.map(err => {
        return `Field '${err.path.join('.')}' - ${err.message}`;
      });
      throw new Error(`Validasi gagal untuk aksi '${actionName}':\n${errorMessages.join('\n')}\nMohon perbaiki field yang salah atau tanyakan ke user jika ada informasi yang kurang.`);
    }

    return result.data;
  }
}
