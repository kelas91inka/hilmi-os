import { IActionProvider, ActionSchema } from '../../registry/types';
import { moduleRegistry } from '../../registry/module-registry';

export class FinanceActionProvider implements IActionProvider {
  name = 'Finance';
  getActions(): ActionSchema[] {
    return [
      {
        name: 'create_finance_transaction',
        description: 'Buat transaksi keuangan.',
        parameters: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'income atau expense' },
            amount: { type: 'number' },
            category: { type: 'string' },
            description: { type: 'string' },
            transaction_date: { type: 'string' },
          },
          required: ['type', 'amount'],
        }
      }
    ];
  }
}

export const financeActionProvider = new FinanceActionProvider();
const existing = moduleRegistry.getModule('Finance') || { name: 'Finance' };
existing.actionProvider = financeActionProvider;
moduleRegistry.register(existing);