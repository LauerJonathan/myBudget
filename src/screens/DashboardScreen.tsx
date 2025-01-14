// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";
import { storageService } from "../services/storageService";
import UpcomingDeadlines from "../components/UpcomingDeadlines";
import AddRecurringModal from "../components/AddRecurringModal";
import { COLORS } from "../constants/theme";
import type { Transaction, RecurringTransaction } from "../types/storage";
import { BlurView } from "expo-blur";
import AddIncomeModal from "../components/AddIncomeModal";
import AddExpenseModal from "../components/AddExpenseModal";

interface DashboardData {
  balance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  recentTransactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  previsionalBalance: number;
}

const DashboardScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    monthlyExpenses: 0,
    monthlyIncome: 0,
    recentTransactions: [],
    recurringTransactions: [],
    previsionalBalance: 0,
  });

  const calculateMonthlyTotals = (transactions: Transaction[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return transactions.reduce(
      (acc, transaction) => {
        const transactionDate = new Date(transaction.date);
        if (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        ) {
          if (transaction.type === "expense") {
            acc.expenses += transaction.amount;
          } else {
            acc.income += transaction.amount;
          }
        }
        return acc;
      },
      { expenses: 0, income: 0 }
    );
  };

  const calculatePrevisionalBalance = (
    currentBalance: number,
    recurringTransactions: RecurringTransaction[]
  ): number => {
    const today = new Date();
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();

    return recurringTransactions.reduce((balance, transaction) => {
      if (
        transaction.autoAdd &&
        transaction.dayOfMonth &&
        transaction.dayOfMonth > today.getDate() &&
        transaction.dayOfMonth <= lastDayOfMonth
      ) {
        return transaction.type === "expense"
          ? balance - transaction.amount
          : balance + transaction.amount;
      }
      return balance;
    }, currentBalance);
  };

  const loadDashboardData = async () => {
    try {
      await storageService.processRecurringTransactions();

      const [balance, transactions, recurringTransactions] = await Promise.all([
        storageService.getBalance(),
        storageService.getTransactions(),
        storageService.getRecurringTransactions(),
      ]);

      const monthlyTotals = calculateMonthlyTotals(transactions);
      const previsionalBalance = calculatePrevisionalBalance(
        balance,
        recurringTransactions
      );

      const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setDashboardData({
        balance,
        monthlyExpenses: monthlyTotals.expenses,
        monthlyIncome: monthlyTotals.income,
        recentTransactions: sortedTransactions.slice(0, 5),
        recurringTransactions,
        previsionalBalance,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const handleAddRecurring = async (transaction: RecurringTransaction) => {
    try {
      await storageService.saveRecurringTransaction(transaction);
      await loadDashboardData();
    } catch (error) {
      console.error("Error saving recurring transaction:", error);
    }
  };

  const handleAddTransaction = async (transaction: Transaction) => {
    try {
      await storageService.saveTransaction(transaction);
      await loadDashboardData();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await loadDashboardData();
      setIsLoading(false);
    };
    initialize();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };
  const renderFloatingButtons = () => {
    if (!isMenuOpen) {
      return (
        <>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setIsMenuOpen(true)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </>
      );
    }

    return (
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fabSecondary, styles.fabExpense]}
          onPress={() => {
            setIsMenuOpen(false);
            setIsExpenseModalVisible(true);
          }}>
          <Ionicons name="remove-circle" size={24} color="#fff" />
          <Text style={styles.fabLabel} numberOfLines={1}>
            Dépense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fabSecondary, styles.fabIncome]}
          onPress={() => {
            setIsMenuOpen(false);
            setIsIncomeModalVisible(true);
          }}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.fabLabel} numberOfLines={1}>
            Revenu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fabSecondary, styles.fabRecurring]}
          onPress={() => {
            setIsMenuOpen(false);
            setIsModalVisible(true);
          }}>
          <Ionicons name="repeat" size={24} color="#fff" />
          <Text style={styles.fabLabel} numberOfLines={1}>
            Récurrent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.fabClose]}
          onPress={() => setIsMenuOpen(false)}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {isMenuOpen && (
        <>
          <BlurView style={styles.overlay} intensity={20} tint="dark" />
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setIsMenuOpen(false)}
          />
        </>
      )}
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>
        {/* Soldes */}
        <View style={styles.balanceContainer}>
          <View style={[styles.balanceCard, { marginRight: 8 }]}>
            <Text style={styles.balanceLabel}>Solde actuel</Text>
            <Text style={styles.balanceAmount}>
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(dashboardData.balance)}
            </Text>
          </View>
          <View style={[styles.balanceCard, { marginLeft: 8 }]}>
            <Text style={styles.balanceLabel}>Solde prévisionnel</Text>
            <Text style={styles.balanceAmount}>
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(dashboardData.previsionalBalance)}
            </Text>
          </View>
        </View>

        {/* Résumé mensuel */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { marginRight: 8 }]}>
            <Icon name="arrow-down-bold" size={24} color="#e74c3c" />
            <Text style={[styles.summaryAmount, styles.expenseText]}>
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(dashboardData.monthlyExpenses)}
            </Text>
            <Text style={styles.summaryLabel}>Dépenses</Text>
          </View>

          <View style={[styles.summaryCard, { marginLeft: 8 }]}>
            <Icon name="arrow-up-bold" size={24} color="#2ecc71" />
            <Text style={[styles.summaryAmount, styles.incomeText]}>
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(dashboardData.monthlyIncome)}
            </Text>
            <Text style={styles.summaryLabel}>Revenus</Text>
          </View>
        </View>

        {/* Prochaines échéances */}
        <View style={styles.sectionContainer}>
          <UpcomingDeadlines
            transactions={dashboardData.recurringTransactions}
            currentMonth={new Date().getMonth()}
            currentYear={new Date().getFullYear()}
          />
        </View>

        {/* Dernières transactions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dernières transactions</Text>
          {dashboardData.recentTransactions.length === 0 ? (
            <Text style={styles.noDataText}>Aucune transaction récente</Text>
          ) : (
            dashboardData.recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString("fr-FR")}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.type === "expense"
                      ? styles.expenseText
                      : styles.incomeText,
                  ]}>
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(transaction.amount)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {renderFloatingButtons()}

      <AddRecurringModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleAddRecurring}
      />
      <AddIncomeModal
        visible={isIncomeModalVisible}
        onClose={() => setIsIncomeModalVisible(false)}
        onSave={handleAddTransaction}
      />
      <AddExpenseModal
        visible={isExpenseModalVisible}
        onClose={() => setIsExpenseModalVisible(false)}
        onSave={handleAddTransaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 1,
  },
  balanceContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  sectionContainer: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: "#000",
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  expenseText: {
    color: "#e74c3c",
  },
  incomeText: {
    color: "#2ecc71",
  },
  noDataText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginVertical: 20,
  },
  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: 20,
    alignItems: "center",
    zIndex: 2,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabSecondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 8,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    position: "relative", // Ajouté pour le positionnement du label
  },
  fabExpense: {
    backgroundColor: "#e74c3c",
  },
  fabIncome: {
    backgroundColor: "#2ecc71",
  },
  fabRecurring: {
    backgroundColor: "#f39c12",
  },
  fabClose: {
    display: "none",
  },
  fabLabel: {
    position: "absolute",
    right: 64, // Pour que le label soit légèrement masqué par le bouton
    height: 56, // Même hauteur que le bouton
    backgroundColor: "#fff",
    borderRadius: 28, // Même que le bouton pour un look cohérent
    fontSize: 14,
    color: "#333",
    elevation: 4,
    zIndex: 3,
    justifyContent: "center", // Pour centrer le texte verticalement
    alignItems: "center",
    minWidth: 150, // Pour avoir une largeur suffisante
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    lineHeight: 54,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default DashboardScreen;
