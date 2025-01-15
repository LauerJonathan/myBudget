import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, IconButton } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { Transaction } from "../types/storage";
import { COLORS, SPACING } from "../constants/theme";

interface EditTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedTransaction: Transaction) => void;
  transaction: Transaction;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  visible,
  onClose,
  onSave,
  transaction,
}) => {
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(transaction.category);
  const [date, setDate] = useState(new Date(transaction.date));
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setDescription(transaction.description);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setDate(new Date(transaction.date));
    }
  }, [visible, transaction]);

  const handleSave = () => {
    const updatedTransaction: Transaction = {
      ...transaction,
      description,
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      category,
      date: date.toISOString(),
    };
    onSave(updatedTransaction);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Modifier la transaction</Text>
            <IconButton
              icon={() => <Feather name="x" size={24} />}
              onPress={onClose}
            />
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Description"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Montant</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={(value) => {
                  const formattedValue = value.replace(",", ".");
                  // N'accepter que les nombres avec jusqu'à 2 décimales
                  if (/^\d*\.?\d{0,2}$/.test(formattedValue)) {
                    setAmount(formattedValue);
                  }
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Catégorie</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Catégorie"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}>
                <Text>{date.toLocaleDateString()}</Text>
                <Feather name="calendar" size={20} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}>
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}>
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  Enregistrer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.md,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  form: {
    gap: SPACING.md,
  },
  formGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: 14,
    color: COLORS.dark,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: 16,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: SPACING.sm,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  button: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.light,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 16,
    color: COLORS.dark,
  },
  saveButtonText: {
    color: "white",
  },
});

export default EditTransactionModal;
