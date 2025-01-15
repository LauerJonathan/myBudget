import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { storageService } from "../services/storageService";
import { Transaction, RecurringTransaction } from "../types/storage";
import { COLORS, SPACING } from "../constants/theme";
import EditTransactionModal from "../components/EditTransactionModal";
import EditRecurringModal from "../components/EditRecurringModal";

const TransactionsScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editingRecurring, setEditingRecurring] =
    useState<RecurringTransaction | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const allTransactions = await storageService.getTransactions();
      const allRecurringTransactions =
        await storageService.getRecurringTransactions();

      // Filtrer pour le mois en cours
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthlyTransactions = allTransactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      });

      setTransactions(monthlyTransactions);
      setRecurringTransactions(allRecurringTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, isRecurring: boolean) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer cette transaction ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              if (isRecurring) {
                await storageService.deleteRecurringTransaction(id);
                setRecurringTransactions((prev) =>
                  prev.filter((transaction) => transaction.id !== id)
                );
              } else {
                await storageService.deleteTransaction(id);
                setTransactions((prev) =>
                  prev.filter((transaction) => transaction.id !== id)
                );
              }
            } catch (error) {
              console.error("Error deleting transaction:", error);
              Alert.alert("Erreur", "Impossible de supprimer la transaction");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (
    transaction: Transaction | RecurringTransaction,
    isRecurring: boolean
  ) => {
    if (isRecurring) {
      setEditingRecurring(transaction as RecurringTransaction);
    } else {
      setEditingTransaction(transaction as Transaction);
    }
  };

  const getNextOccurrence = (recurringTransaction: RecurringTransaction) => {
    const today = new Date();
    const lastProcessed = recurringTransaction.lastProcessed
      ? new Date(recurringTransaction.lastProcessed)
      : null;

    let nextDate = new Date();
    nextDate.setDate(recurringTransaction.dayOfMonth);

    if (lastProcessed) {
      if (nextDate.getTime() <= lastProcessed.getTime()) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    }

    return nextDate;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderTransaction = (
    transaction: Transaction | RecurringTransaction,
    isRecurring: boolean
  ) => {
    const nextDate = isRecurring
      ? getNextOccurrence(transaction as RecurringTransaction)
      : new Date(transaction.date);

    return (
      <View key={transaction.id} style={styles.transactionItem}>
        <View style={styles.transactionMain}>
          <View>
            <Text style={styles.transactionName}>
              {isRecurring
                ? (transaction as RecurringTransaction).name
                : transaction.description}
            </Text>
            <Text style={styles.transactionDate}>
              {isRecurring ? "Prochaine échéance:" : ""} {formatDate(nextDate)}
            </Text>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              {
                color:
                  transaction.type === "income"
                    ? COLORS.success
                    : COLORS.danger,
              },
            ]}>
            {transaction.type === "income" ? "+" : "-"}
            {transaction.amount.toFixed(2)}€
          </Text>
        </View>

        <View style={styles.transactionActions}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{transaction.category}</Text>
          </View>
          <View style={styles.actionButtons}>
            <IconButton
              icon={() => (
                <Feather name="edit-2" size={20} color={COLORS.warning} />
              )}
              onPress={() => handleEdit(transaction, isRecurring)}
            />
            <IconButton
              icon={() => (
                <Feather name="trash-2" size={20} color={COLORS.danger} />
              )}
              onPress={() => handleDelete(transaction.id, isRecurring)}
            />
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Chargement des transactions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dépenses récurrentes</Text>
        <View style={styles.transactionsList}>
          {recurringTransactions.length > 0 ? (
            recurringTransactions.map((transaction) =>
              renderTransaction(transaction, true)
            )
          ) : (
            <Text style={styles.emptyText}>Aucune dépense récurrente</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transactions du mois</Text>
        <View style={styles.transactionsList}>
          {transactions.length > 0 ? (
            transactions.map((transaction) =>
              renderTransaction(transaction, false)
            )
          ) : (
            <Text style={styles.emptyText}>Aucune transaction ce mois-ci</Text>
          )}
        </View>
      </View>
      {/* Modales d'édition */}
      {editingTransaction && (
        <EditTransactionModal
          visible={!!editingTransaction}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={async (updatedTransaction) => {
            try {
              await storageService.updateTransaction(
                updatedTransaction.id,
                updatedTransaction
              );
              loadData(); // Recharger les données
              setEditingTransaction(null);
            } catch (error) {
              console.error("Error updating transaction:", error);
              Alert.alert(
                "Erreur",
                "Impossible de mettre à jour la transaction"
              );
            }
          }}
        />
      )}

      {editingRecurring && (
        <EditRecurringModal
          visible={!!editingRecurring}
          transaction={editingRecurring}
          onClose={() => setEditingRecurring(null)}
          onSave={async (updatedTransaction) => {
            try {
              await storageService.updateRecurringTransaction(
                updatedTransaction
              );
              loadData(); // Recharger les données
              setEditingRecurring(null);
            } catch (error) {
              console.error("Error updating recurring transaction:", error);
              Alert.alert(
                "Erreur",
                "Impossible de mettre à jour la transaction récurrente"
              );
            }
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginVertical: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  transactionsList: {
    gap: SPACING.md,
  },
  transactionItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  transactionMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.dark,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.dark,
    opacity: 0.7,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  categoryTag: {
    backgroundColor: COLORS.light,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.dark,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.dark,
    opacity: 0.6,
    padding: SPACING.md,
  },
});

export default TransactionsScreen;
