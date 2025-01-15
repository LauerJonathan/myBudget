import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Text, IconButton } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { RecurringTransaction } from "../types/storage";
import { COLORS, SPACING } from "../constants/theme";

interface EditRecurringModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedTransaction: RecurringTransaction) => void;
  transaction: RecurringTransaction;
}

const EditRecurringModal: React.FC<EditRecurringModalProps> = ({
  visible,
  onClose,
  onSave,
  transaction,
}) => {
  const [name, setName] = useState(transaction.name);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(transaction.category);
  const [dayOfMonth, setDayOfMonth] = useState(
    transaction.dayOfMonth.toString()
  );
  const [autoAdd, setAutoAdd] = useState(transaction.autoAdd);

  useEffect(() => {
    if (visible) {
      setName(transaction.name);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setDayOfMonth(transaction.dayOfMonth.toString());
      setAutoAdd(transaction.autoAdd);
    }
  }, [visible, transaction]);

  const handleSave = () => {
    const updatedTransaction: RecurringTransaction = {
      ...transaction,
      name,
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      category,
      dayOfMonth: parseInt(dayOfMonth),
      autoAdd,
    };
    onSave(updatedTransaction);
  };

  const validateDayOfMonth = (value: string) => {
    const day = parseInt(value);
    if (day >= 1 && day <= 31) {
      setDayOfMonth(value);
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
            <Text style={styles.modalTitle}>
              Modifier la transaction récurrente
            </Text>
            <IconButton
              icon={() => <Feather name="x" size={24} />}
              onPress={onClose}
            />
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nom de la transaction"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Montant</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={(value) => {
                  const formattedValue = value.replace(",", ".");
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
              <Text style={styles.label}>Jour du mois</Text>
              <TextInput
                style={styles.input}
                value={dayOfMonth}
                onChangeText={validateDayOfMonth}
                keyboardType="numeric"
                placeholder="1-31"
                maxLength={2}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Ajout automatique</Text>
              <Switch
                value={autoAdd}
                onValueChange={setAutoAdd}
                trackColor={{ false: "#767577", true: COLORS.primary }}
              />
            </View>

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
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.xs,
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

export default EditRecurringModal;
