// src/components/FloatingActionMenu.tsx
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

interface FloatingActionMenuProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  onAddRecurring: () => void;
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
  onAddExpense,
  onAddIncome,
  onAddRecurring,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = new Animated.Value(0);

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"],
        }),
      },
    ],
  };

  const expenseStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -180],
        }),
      },
    ],
  };

  const incomeStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -120],
        }),
      },
    ],
  };

  const recurringStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -60],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.menuItem, expenseStyle]}>
        <TouchableOpacity
          style={[styles.button, styles.expenseButton]}
          onPress={() => {
            toggleMenu();
            onAddExpense();
          }}>
          <Ionicons name="remove-circle" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.label}>Dépense</Text>
      </Animated.View>

      <Animated.View style={[styles.menuItem, incomeStyle]}>
        <TouchableOpacity
          style={[styles.button, styles.incomeButton]}
          onPress={() => {
            toggleMenu();
            onAddIncome();
          }}>
          <Ionicons name="add-circle" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.label}>Revenu</Text>
      </Animated.View>

      <Animated.View style={[styles.menuItem, recurringStyle]}>
        <TouchableOpacity
          style={[styles.button, styles.recurringButton]}
          onPress={() => {
            toggleMenu();
            onAddRecurring();
          }}>
          <Ionicons name="repeat" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.label}>Récurrent</Text>
      </Animated.View>

      <TouchableOpacity
        style={[styles.button, styles.mainButton]}
        onPress={toggleMenu}>
        <Animated.View style={rotation}>
          <Ionicons name="add" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "center",
  },
  menuItem: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    opacity: 1,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
  },
  expenseButton: {
    backgroundColor: "#e74c3c",
  },
  incomeButton: {
    backgroundColor: "#2ecc71",
  },
  recurringButton: {
    backgroundColor: "#f39c12",
  },
  label: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
});

export default FloatingActionMenu;
