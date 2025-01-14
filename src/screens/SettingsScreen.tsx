import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { storageService } from '../services/storageService';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async (type: 'all' | 'expenses' | 'recurring' | 'incomes') => {
    let title = '';
    let resetFunction: () => Promise<void>;

    switch (type) {
      case 'all':
        title = 'toutes les données';
        resetFunction = async () => {
          await storageService.clearAllData();
        };
        break;
      case 'expenses':
        title = 'les dépenses ponctuelles';
        resetFunction = async () => {
          const transactions = await storageService.getTransactions();
          const filteredTransactions = transactions.filter(t => t.type !== 'expense');
          await storageService.clearAllData(); // On efface tout d'abord
          // On réenregistre les transactions qui ne sont pas des dépenses
          for (const transaction of filteredTransactions) {
            await storageService.saveTransaction(transaction);
          }
        };
        break;
      case 'recurring':
        title = 'les dépenses récurrentes';
        resetFunction = async () => {
          const recurringTransactions = await storageService.getRecurringTransactions();
          const filteredRecurring = recurringTransactions.filter(t => t.type !== 'expense');
          await storageService.clearAllData(); // On efface tout d'abord
          // On réenregistre les transactions qui ne sont pas des dépenses
          for (const transaction of filteredRecurring) {
            await storageService.saveRecurringTransaction(transaction);
          }
        };
        break;
      case 'incomes':
        title = 'les revenus';
        resetFunction = async () => {
          const transactions = await storageService.getTransactions();
          const filteredTransactions = transactions.filter(t => t.type !== 'income');
          await storageService.clearAllData(); // On efface tout d'abord
          // On réenregistre les transactions qui ne sont pas des revenus
          for (const transaction of filteredTransactions) {
            await storageService.saveTransaction(transaction);
          }
        };
        break;
    }

    Alert.alert(
      'Réinitialisation des données',
      `Attention cette action sera irréversible et supprimera ${title}. Confirmer ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsResetting(true);
              await resetFunction();
              
              Alert.alert(
                'Succès',
                `${title.charAt(0).toUpperCase() + title.slice(1)} ont été supprimées avec succès`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.navigate('Dashboard', { 
                        refresh: Date.now() 
                      });
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error during reset:', error);
              Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de la réinitialisation',
                [{ text: 'OK' }]
              );
            } finally {
              setIsResetting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const ResetButton = ({ type, title, color }: { 
    type: 'all' | 'expenses' | 'recurring' | 'incomes', 
    title: string, 
    color: string 
  }) => (
    <TouchableOpacity
      style={[
        styles.resetButton,
        { backgroundColor: color },
        isResetting && styles.resetButtonDisabled
      ]}
      onPress={() => handleReset(type)}
      disabled={isResetting}
    >
      <Text style={styles.resetButtonText}>
        {isResetting ? 'Réinitialisation...' : title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réinitialisation des données</Text>
          
          <ResetButton 
            type="all"
            title="Réinitialiser toutes les données"
            color="#ff3b30"
          />
          
          <View style={styles.spacer} />
          
          <ResetButton 
            type="expenses"
            title="Réinitialiser les dépenses ponctuelles"
            color="#ff9500"
          />
          
          <View style={styles.spacer} />
          
          <ResetButton 
            type="recurring"
            title="Réinitialiser les dépenses récurrentes"
            color="#ff9500"
          />
          
          <View style={styles.spacer} />
          
          <ResetButton 
            type="incomes"
            title="Réinitialiser les revenus"
            color="#34c759"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginTop: Platform.OS === 'ios' ? 0 : 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  resetButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 12,
  },
});

export default SettingsScreen;