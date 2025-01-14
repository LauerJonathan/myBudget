// src/components/AddRecurringModal.tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";
import { RecurringTransaction } from "../types/storage";

interface AddRecurringModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: RecurringTransaction) => void;
}

// Définition des catégories avec leurs icônes
const CATEGORIES = [
  { id: "housing", name: "Logement", icon: "home", color: "#FF9800" },
  { id: "utilities", name: "Factures", icon: "flash", color: "#2196F3" },
  { id: "groceries", name: "Courses", icon: "cart", color: "#4CAF50" },
  { id: "transport", name: "Transport", icon: "car", color: "#9C27B0" },
  {
    id: "insurance",
    name: "Assurance",
    icon: "shield-checkmark",
    color: "#F44336",
  },
  { id: "health", name: "Santé", icon: "medical", color: "#E91E63" },
  { id: "leisure", name: "Loisirs", icon: "game-controller", color: "#009688" },
  { id: "other", name: "Autre", icon: "ellipsis-horizontal", color: "#757575" },
];

const AddRecurringModal = ({
  visible,
  onClose,
  onSave,
}: AddRecurringModalProps) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("");
  const [frequency, setFrequency] = useState<"monthly" | "weekly">("monthly");

  const handleSave = () => {
    if (!name || !amount || !selectedCategory || !dayOfMonth) {
      // Ajouter une validation plus tard
      return;
    }

    const category = CATEGORIES.find((cat) => cat.id === selectedCategory);

    // Utiliser le même traitement que pour les transactions ponctuelles
    const parsedAmount = Number(amount.replace(",", "."));

    const newTransaction: RecurringTransaction = {
      id: Date.now().toString(),
      name,
      amount: parsedAmount,
      type: "expense",
      category: category?.name || "Autre",
      frequency,
      dayOfMonth: parseInt(dayOfMonth),
      autoAdd: true,
    };

    onSave(newTransaction);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setAmount("");
    setSelectedCategory("");
    setDayOfMonth("");
    setFrequency("monthly");
  };

  const CategoryBubble = ({
    category,
  }: {
    category: (typeof CATEGORIES)[0];
  }) => (
    <TouchableOpacity
      style={[
        styles.categoryBubble,
        { backgroundColor: category.color + "20" }, // Ajoute une transparence à la couleur
        selectedCategory === category.id && {
          borderColor: category.color,
          borderWidth: 2,
        },
      ]}
      onPress={() => setSelectedCategory(category.id)}>
      <Ionicons name={category.icon as any} size={24} color={category.color} />
      <Text style={[styles.categoryText, { color: category.color }]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle dépense récurrente</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Loyer"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Montant (€)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catégorie</Text>
              <View style={styles.categoriesContainer}>
                {CATEGORIES.map((category) => (
                  <CategoryBubble key={category.id} category={category} />
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Jour du mois</Text>
              <TextInput
                style={styles.input}
                value={dayOfMonth}
                onChangeText={(text) => {
                  const num = parseInt(text);
                  if (!text || (num >= 1 && num <= 31)) {
                    setDayOfMonth(text);
                  }
                }}
                keyboardType="number-pad"
                placeholder="1-31"
                maxLength={2}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  categoryBubble: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    padding: 8,
  },
  categoryText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#333",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    padding: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginLeft: 10,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default AddRecurringModal;
