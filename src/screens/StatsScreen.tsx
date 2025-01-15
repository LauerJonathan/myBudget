import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { storageService } from '../services/storageService';
import { Transaction, RecurringTransaction } from '../types/storage';
import { COLORS, SPACING } from '../constants/theme';

const StatsScreen: React.FC = () => {
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringTransaction[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const transactions = await storageService.getTransactions();
      const recurringTransactions = await storageService.getRecurringTransactions();
      setExpenses(transactions);
      setRecurringExpenses(recurringTransactions.filter(t => t.type === 'expense'));
      console.log('Loaded transactions:', transactions.length);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryColors = {
      Alimentation: COLORS.primary,
      Transport: COLORS.secondary,
      Logement: COLORS.success,
      Loisirs: COLORS.warning,
      Santé: COLORS.info,
      Shopping: '#9C27B0',
      Factures: '#FF5722',
      Autres: '#795548'
    };
    return categoryColors[category as keyof typeof categoryColors] || COLORS.primary;
  };

  const getExpensesByCategory = () => {
    return expenses
      .filter(t => t.type === 'expense')
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);
  };

  const renderGlobalBar = (data: [string, number][]) => {
    // Calculer le total des dépenses
    const totalExpenses = data.reduce((sum, [_, value]) => sum + value, 0);
    
    // Calculer le total des revenus
    const totalIncome = expenses
      .filter(t => t.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    let accumWidth = 0;
    const remainingPercentage = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    return (
      <View style={styles.globalBarContainer}>
        <View style={styles.globalBar}>
          {/* Sections des dépenses */}
          {data.map(([category, amount]) => {
            const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
            const left = accumWidth;
            accumWidth += percentage;
            
            return (
              <View
                key={category}
                style={[
                  styles.globalBarSection,
                  {
                    backgroundColor: getCategoryColor(category),
                    width: `${percentage}%`,
                    left: `${left}%`
                  }
                ]}
              />
            );
          })}
          
          {/* Section de l'argent disponible */}
          {remainingPercentage > 0 && (
            <View
              style={[
                styles.globalBarSection,
                {
                  backgroundColor: '#E0E0E0',
                  width: `${remainingPercentage}%`,
                  left: `${accumWidth}%`
                }
              ]}
            />
          )}
        </View>
        
        {/* Labels pour les montants */}
        <View style={styles.globalBarLabels}>
          <Text style={styles.globalBarLabel}>
            Total dépenses: {totalExpenses.toFixed(2)}€
          </Text>
          <Text style={styles.globalBarLabel}>
            Disponible: {(totalIncome - totalExpenses).toFixed(2)}€
          </Text>
        </View>
      </View>
    );
  };

  const renderCategoryList = (data: [string, number][]) => {
    const total = data.reduce((sum, [_, value]) => sum + value, 0);
    
    return (
      <View style={styles.categoryList}>
        {renderGlobalBar(data)}
        {data.map(([category, amount]) => {
          const percentage = (amount / total) * 100;
          return (
            <View key={category} style={styles.categoryListItem}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryColor, { backgroundColor: getCategoryColor(category) }]} />
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryAmount}>{amount.toFixed(2)}€</Text>
              </View>
              <View style={styles.percentageBarContainer}>
                <View 
                  style={[
                    styles.percentageBar,
                    { 
                      width: `${percentage}%`,
                      backgroundColor: getCategoryColor(category)
                    }
                  ]} 
                />
                <Text style={styles.percentageText}>{percentage.toFixed(1)}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const getMonthlyTotals = () => {
    return expenses
      .filter(t => t.type === 'expense')
      .reduce((acc, expense) => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);
  };

  const renderMonthlyBar = (month: string, amount: number, maxAmount: number) => {
    const width = (amount / maxAmount) * 100;
    const displayMonth = new Date(month + '-01').toLocaleString('fr-FR', { month: 'short' });
    return (
      <View key={month} style={styles.monthItem}>
        <Text style={styles.monthLabel}>{displayMonth}</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${width}%`, backgroundColor: COLORS.secondary }]} />
          <Text style={styles.barLabel}>{amount.toFixed(2)} €</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Chargement des statistiques...</Text>
      </View>
    );
  }

  const categoryData = Object.entries(getExpensesByCategory());
  const monthlyData = Object.entries(getMonthlyTotals()).sort((a, b) => a[0].localeCompare(b[0]));
  const maxMonthlyAmount = Math.max(...monthlyData.map(([_, amount]) => amount));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dépenses du mois</Text>
      </View>

      {categoryData.length > 0 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Répartition par catégorie</Text>
          {renderCategoryList(categoryData)}
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <Text style={styles.noDataText}>Aucune dépense enregistrée</Text>
        </View>
      )}

      {monthlyData.length > 0 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Évolution mensuelle</Text>
          {monthlyData.map(([month, amount]) => 
            renderMonthlyBar(month, amount, maxMonthlyAmount)
          )}
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <Text style={styles.noDataText}>Aucune donnée mensuelle disponible</Text>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: SPACING.md,
    backgroundColor: '#fff',
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  chartContainer: {
    padding: SPACING.md,
    backgroundColor: '#fff',
    marginVertical: SPACING.sm,
    borderRadius: 8,
    marginHorizontal: SPACING.md,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.dark,
  },
  categoryList: {
    width: '100%',
  },
  categoryListItem: {
    marginBottom: SPACING.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  categoryName: {
    flex: 1,
    color: COLORS.dark,
    fontSize: 14,
  },
  categoryAmount: {
    color: COLORS.dark,
    fontSize: 14,
    fontWeight: 'bold',
  },
  percentageBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  percentageBar: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    position: 'absolute',
    right: 0,
    top: 10,
    fontSize: 12,
    color: COLORS.dark,
  },
  monthItem: {
    marginBottom: SPACING.md,
  },
  monthLabel: {
    marginBottom: SPACING.xs,
    color: COLORS.dark,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  barLabel: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: COLORS.dark,
    position: 'absolute',
    right: SPACING.xs,
  },
  noDataText: {
    textAlign: 'center',
    color: COLORS.dark,
    fontSize: 16,
    marginVertical: SPACING.md,
  },
  globalBarContainer: {
    marginBottom: SPACING.xl,
  },
  globalBar: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  globalBarSection: {
    height: '100%',
    position: 'absolute',
  },
  globalBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  globalBarLabel: {
    fontSize: 12,
    color: COLORS.dark,
  },
});

export default StatsScreen;