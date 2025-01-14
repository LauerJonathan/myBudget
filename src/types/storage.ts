// src/types/storage.ts
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  name: string;
  frequency: 'monthly' | 'weekly';
  dayOfMonth?: number;
  autoAdd: boolean;
  lastProcessed?: string;
}

export interface Budget {
  initialBalance: number;
  lastUpdated: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}