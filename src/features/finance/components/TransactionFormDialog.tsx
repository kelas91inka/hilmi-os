'use client';

import { useState, ReactElement } from 'react';
import { TransactionFormData, transactionSchema } from '../validators/finance.schema';
import { createTransactionAction, updateTransactionAction } from '../actions/finance.actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionFormDialogProps {
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category?: string | null;
    description?: string | null;
    transaction_date: string;
  };
}

const CATEGORIES = [
  'Salary',
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Other'
];

export function TransactionFormDialog({ trigger, open: controlledOpen, onOpenChange: setControlledOpen, initialData }: TransactionFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen || setInternalOpen;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TransactionFormData>(
    initialData
      ? {
          type: initialData.type,
          amount: initialData.amount,
          category: initialData.category || 'Other',
          description: initialData.description || '',
          transaction_date: initialData.transaction_date.split('T')[0],
        }
      : {
          type: 'expense',
          amount: 0,
          category: 'Other',
          description: '',
          transaction_date: format(new Date(), 'yyyy-MM-dd'),
        }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const validated = transactionSchema.parse(formData);
      
      const result = initialData 
        ? await updateTransactionAction(initialData.id, validated)
        : await createTransactionAction(validated);

      if (result.success) {
        setOpen(false);
        if (!initialData) {
          setFormData({
            type: 'expense',
            amount: 0,
            category: 'Other',
            description: '',
            transaction_date: format(new Date(), 'yyyy-MM-dd'),
          });
        }
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Validation error');
      } else {
        setError('Validation error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        )}
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <div className="text-sm text-destructive">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => { if (val) setFormData({ ...formData, type: val as 'income' | 'expense' }) }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (IDR)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              placeholder="e.g. 150000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={formData.category || ''} 
              onValueChange={(val) => { if (val) setFormData({ ...formData, category: val }) }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Groceries"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="mr-2">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
