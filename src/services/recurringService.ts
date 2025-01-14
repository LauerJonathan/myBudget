import AsyncStorage from "@react-native-async-storage/async-storage";
import { RecurringTransaction } from "../types/storage";
import { storageService } from "./storageService";

const STORAGE_KEYS = {
  RECURRING: "@budget_app_recurring",
};

export const recurringService = {
  async addRecurringTransaction(
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
  },

  async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECURRING);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting recurring transactions:", error);
      return [];
    }
  },

  async processRecurringTransactions(): Promise<void> {
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
          // Vérifie si c'est le bon jour du mois et si ça n'a pas déjà été traité ce mois-ci
          shouldProcess =
            today.getDate() === transaction.dayOfMonth &&
            (!lastProcessed ||
              lastProcessed.getMonth() !== today.getMonth() ||
              lastProcessed.getFullYear() !== today.getFullYear());
          break;
        // Autres cas à implémenter (weekly, yearly)
      }

      if (shouldProcess) {
        // Ajouter la transaction
        const newTransaction = {
          id: Date.now().toString(),
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: today.toISOString(),
          description: transaction.name + " (Récurrent)",
        };

        // Mettre à jour la date de dernière exécution
        transaction.lastProcessed = today.toISOString();
        await this.updateRecurringTransaction(transaction);

        // Ajouter à la liste des transactions normales
        // Vous devrez implémenter cette fonction dans votre service de transactions
        await storageService.saveTransaction(newTransaction);
      }
    }
  },

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
  },
};
