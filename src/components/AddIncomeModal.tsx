// src/components/AddIncomeModal.tsx
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
import type { Transaction } from "../types/storage";

interface AddIncomeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
}

// Réutilisation des mêmes catégories
const CATEGORIES = [
  { id: "salary", name: "Salaire", icon: "cash", color: "#27ae60" },
  {
    id: "investment",
    name: "Rente",
    icon: "trending-up",
    color: "#2980b9",
  },
  { id: "gift", name: "Cadeau", icon: "gift", color: "#8e44ad" },
  { id: "other", name: "Autre", icon: "ellipsis-horizontal", color: "#95a5a6" },
];

const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSave = () => {
    if (!description || !amount || !selectedCategory) {
      // Ajouter une validation plus tard
      return;
    }

    const category = CATEGORIES.find((cat) => cat.id === selectedCategory);

    // Utiliser parseFloat mais fixer à 2 décimales
    const parsedAmount = Number(amount.replace(",", "."));

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description,
      amount: parsedAmount,
      type: "income",
      category: category?.name || "Autre",
      date: new Date().toISOString(),
    };

    onSave(newTransaction);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setSelectedCategory("");
  };

  const CategoryBubble = ({
    category,
  }: {
    category: (typeof CATEGORIES)[0];
  }) => (
    <TouchableOpacity
      style={[
        styles.categoryBubble,
        { backgroundColor: category.color + "20" },
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
            <Text style={styles.modalTitle}>Nouveau revenu</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Salaire Janvier"
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

export default AddIncomeModal;
