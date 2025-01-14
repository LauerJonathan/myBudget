// src/screens/RecurringTransactionsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { recurringService } from "../services/recurringService";
import { RecurringTransaction } from "../types/storage";
import { COLORS } from "../constants/theme";

const RecurringTransactionsScreen = () => {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const data = await recurringService.getRecurringTransactions();
    setTransactions(data);
  };

  const toggleAutoAdd = async (transaction: RecurringTransaction) => {
    const updated = {
      ...transaction,
      autoAdd: !transaction.autoAdd,
    };
    await recurringService.updateRecurringTransaction(updated);
    await loadTransactions();
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}>
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>
          Ajouter une transaction récurrente
        </Text>
      </TouchableOpacity>

      {transactions.map((transaction) => (
        <View key={transaction.id} style={styles.transactionCard}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionName}>{transaction.name}</Text>
            <Switch
              value={transaction.autoAdd}
              onValueChange={() => toggleAutoAdd(transaction)}
            />
          </View>

          <View style={styles.transactionDetails}>
            <Text style={styles.amount}>
              {transaction.type === "expense" ? "-" : "+"}
              {transaction.amount.toFixed(2)} €
            </Text>
            <Text style={styles.frequency}>
              {transaction.frequency === "monthly" ? "Mensuel" : "Hebdomadaire"}
            </Text>
          </View>

          <Text style={styles.category}>{transaction.category}</Text>

          {transaction.frequency === "monthly" && (
            <Text style={styles.dayInfo}>
              Le {transaction.dayOfMonth} de chaque mois
            </Text>
          )}
        </View>
      ))}

      {/* Le Modal pour ajouter une nouvelle transaction sera implémenté séparément */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  transactionCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  transactionName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: "500",
  },
  frequency: {
    color: "#666",
  },
  category: {
    color: COLORS.primary,
    marginBottom: 5,
  },
  dayInfo: {
    color: "#666",
    fontSize: 14,
  },
});

export default RecurringTransactionsScreen;
