// src/navigation/AppNavigator.tsx
import React, { useState, useRef, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../screens/DashboardScreen";
import SettingsScreen from "../screens/SettingsScreen";
import StatsScreen from "../screens/StatsScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import { COLORS } from "../constants/theme";

const Stack = createNativeStackNavigator();
const { width } = Dimensions.get("window");

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>{title}</Text>
  </View>
);

const AppNavigator = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isMenuVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isMenuVisible]);

  const menuItems = [
    {
      id: "dashboard",
      title: "Tableau de bord",
      icon: "home-outline",
      screen: "Dashboard",
    },
    {
      id: "transactions",
      title: "Transactions",
      icon: "card-outline",
      screen: "Transactions",
    },
    {
      id: "stats",
      title: "Statistiques",
      icon: "pie-chart-outline",
      screen: "Statistics",
    },
    {
      id: "settings",
      title: "Paramètres",
      icon: "settings-outline",
      screen: "Settings",
    },
  ];

  const Menu = () => {
    const navigation = useNavigation();

    const handleMenuItemPress = (screenName: string) => {
      setIsMenuVisible(false);
      navigation.navigate(screenName as never);
    };

    return (
      <>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
              display: isMenuVisible ? "flex" : "none",
            },
          ]}
          pointerEvents={isMenuVisible ? "auto" : "none"}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setIsMenuVisible(false)}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }],
              display: isMenuVisible ? "flex" : "none",
            },
          ]}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.screen)}>
              <Ionicons
                name={item.icon as any}
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </>
    );
  };

  return (
    <>
      <Stack.Navigator>
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: "Mon Budget",
            headerRight: () => (
              <TouchableOpacity
                onPress={() => setIsMenuVisible(true)}
                style={styles.menuButton}>
                <Ionicons name="menu" size={24} color="white" />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{
            title: "Transactions",
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Statistics"
          component={StatsScreen}
          options={{
            title: "Statistiques",
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: "Paramètres",
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: "#fff",
          }}
        />
      </Stack.Navigator>
      <Menu />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  menuContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "70%",
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 50,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
  menuButton: {
    marginRight: 10,
  },
  versionContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  versionText: {
    color: "#666",
    fontSize: 12,
  },
});

export default AppNavigator;
