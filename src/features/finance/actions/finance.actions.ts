'use server';

import { revalidatePath } from 'next/cache';
import { financeService } from '../services/finance.service';

export async function createTransactionAction(data: unknown) {
  try {
    const tx = await financeService.createTransaction(data);
    revalidatePath('/portal/finance');
    revalidatePath('/portal/dashboard');
    return { success: true, data: tx };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteTransactionAction(id: string) {
  try {
    await financeService.deleteTransaction(id);
    revalidatePath('/portal/finance');
    revalidatePath('/portal/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateTransactionAction(id: string, data: unknown) {
  try {
    const tx = await financeService.updateTransaction(id, data);
    revalidatePath('/portal/finance');
    revalidatePath('/portal/dashboard');
    return { success: true, data: tx };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
