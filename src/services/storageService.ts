// src/services/storageService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Transaction,
  RecurringTransaction,
  Budget,
  Category,
} from "../types/storage";

const STORAGE_KEYS = {
  TRANSACTIONS: "@budget_app_transactions",
  BUDGET: "@budget_app_budget",
  CATEGORIES: "@budget_app_categories",
  RECURRING: "@budget_app_recurring",
};

class StorageService {
  // Transactions régulières
  async saveTransaction(transaction: Transaction): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      transactions.push(transaction);
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error("Error saving transaction:", error);
      throw error;
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting transactions:", error);
      return [];
    }
  }

  async updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>
  ): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const index = transactions.findIndex((t) => t.id === transactionId);
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates };
        await AsyncStorage.setItem(
          STORAGE_KEYS.TRANSACTIONS,
          JSON.stringify(transactions)
        );
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const filtered = transactions.filter((t) => t.id !== transactionId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  }

  // Transactions récurrentes
  async saveRecurringTransaction(
    transaction: RecurringTransaction
  ): Promise<void> {
    try {
      const transactions = await this.getRecurringTransactions();
      transactions.push(transaction);
      await AsyncStorage.setItem(
        STORAGE_KEYS.RECURRING,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error("Error saving recurring transaction:", error);
      throw error;
    }
  }

  async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECURRING);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting recurring transactions:", error);
      return [];
    }
  }

  async updateRecurringTransaction(
    transaction: RecurringTransaction
  ): Promise<void> {
    try {
      const transactions = await this.getRecurringTransactions();
      const index = transactions.findIndex((t) => t.id === transaction.id);
      if (index !== -1) {
        transactions[index] = transaction;
        await AsyncStorage.setItem(
          STORAGE_KEYS.RECURRING,
          JSON.stringify(transactions)
        );
      }
    } catch (error) {
      console.error("Error updating recurring transaction:", error);
      throw error;
    }
  }

  async processRecurringTransactions(): Promise<void> {
    try {
      const today = new Date();
      const recurring = await this.getRecurringTransactions();

      for (const transaction of recurring) {
        if (!transaction.autoAdd) continue;

        const lastProcessed = transaction.lastProcessed
          ? new Date(transaction.lastProcessed)
          : null;

        let shouldProcess = false;

        switch (transaction.frequency) {
          case "monthly":
            shouldProcess =
              today.getDate() === transaction.dayOfMonth &&
              (!lastProcessed ||
                lastProcessed.getMonth() !== today.getMonth() ||
                lastProcessed.getFullYear() !== today.getFullYear());
            break;
        }

        if (shouldProcess) {
          const newTransaction = {
            id: Date.now().toString(),
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            date: today.toISOString(),
            description: transaction.name + " (Récurrent)",
          };

          transaction.lastProcessed = today.toISOString();
          await this.updateRecurringTransaction(transaction);
          await this.saveTransaction(newTransaction);
        }
      }
    } catch (error) {
      console.error("Error processing recurring transactions:", error);
      throw error;
    }
  }

  // Budget
  async saveBudget(budget: Budget): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
    } catch (error) {
      console.error("Error saving budget:", error);
      throw error;
    }
  }

  async getBudget(): Promise<Budget | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BUDGET);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting budget:", error);
      return null;
    }
  }

  async updateBudget(updates: Partial<Budget>): Promise<void> {
    try {
      const currentBudget = await this.getBudget();
      const updatedBudget = { ...currentBudget, ...updates };
      await this.saveBudget(updatedBudget);
    } catch (error) {
      console.error("Error updating budget:", error);
      throw error;
    }
  }

  // Utilitaires
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TRANSACTIONS,
        STORAGE_KEYS.BUDGET,
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.RECURRING,
      ]);
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    }
  }

  async getBalance(): Promise<number> {
    try {
      const transactions = await this.getTransactions();
      const budget = await this.getBudget();

      const balance = transactions.reduce((acc, transaction) => {
        return transaction.type === "income"
          ? acc + transaction.amount
          : acc - transaction.amount;
      }, budget?.initialBalance || 0);

      return balance;
    } catch (error) {
      console.error("Error calculating balance:", error);
      return 0;
    }
  }
}

export const storageService = new StorageService();
