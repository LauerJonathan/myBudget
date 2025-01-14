// src/components/UpcomingDeadlines.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RecurringTransaction } from "../types/storage";

interface UpcomingDeadlinesProps {
 transactions: RecurringTransaction[];
 currentMonth: number;
 currentYear: number;
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({
 transactions,
 currentMonth,
 currentYear,
}) => {
 const getUpcomingTransactions = () => {
   const today = new Date();
   const lastDayOfMonth = new Date(
     today.getFullYear(),
     today.getMonth() + 1,
     0
   ).getDate();

   return transactions
     .filter((transaction) => {
       return (
         transaction.autoAdd &&
         transaction.dayOfMonth &&
         transaction.dayOfMonth > today.getDate() &&
         transaction.dayOfMonth <= lastDayOfMonth
       );
     })
     .sort((a, b) => (a.dayOfMonth || 0) - (b.dayOfMonth || 0));
 };

 const upcomingTransactions = getUpcomingTransactions();

 if (upcomingTransactions.length === 0) {
   return (
     <View style={styles.alertContainer}>
       <Icon name="calendar-month" size={24} color="#666" />
       <Text style={styles.alertTitle}>Aucune échéance à venir</Text>
       <Text style={styles.alertDescription}>
         Vous n'avez pas d'échéance prévue pour le reste du mois en cours.
       </Text>
     </View>
   );
 }

 return (
   <View style={styles.container}>
     <Text style={styles.title}>Prochaines échéances</Text>
     <View style={styles.transactionsContainer}>
       {upcomingTransactions.map((transaction) => {
         const transactionDate = new Date(
           currentYear,
           currentMonth,
           transaction.dayOfMonth
         );

         return (
           <View key={transaction.id} style={styles.transactionItem}>
             <View>
               <Text style={styles.transactionDescription}>
                 {transaction.name}
               </Text>
               <Text style={styles.transactionDate}>
                 {transactionDate.toLocaleDateString("fr-FR")}
               </Text>
             </View>
             <Text
               style={[
                 styles.transactionAmount,
                 transaction.type === "expense"
                   ? styles.expenseText
                   : styles.incomeText,
               ]}
             >
               {new Intl.NumberFormat("fr-FR", {
                 style: "currency",
                 currency: "EUR",
               }).format(transaction.amount)}
             </Text>
           </View>
         );
       })}
     </View>
   </View>
 );
};

const styles = StyleSheet.create({
 container: {
   paddingVertical: 16,
 },
 title: {
   fontSize: 18,
   fontWeight: "600",
   color: "#1a1a1a",
   marginBottom: 12,
 },
 transactionsContainer: {
   gap: 8,
 },
 transactionItem: {
   flexDirection: "row",
   justifyContent: "space-between",
   alignItems: "center",
   padding: 12,
   backgroundColor: "white",
   borderRadius: 8,
   borderWidth: 1,
   borderColor: "#e5e5e5",
 },
 transactionDescription: {
   fontSize: 16,
   fontWeight: "500",
   color: "#1a1a1a",
 },
 transactionDate: {
   fontSize: 14,
   color: "#666",
   marginTop: 4,
 },
 transactionAmount: {
   fontSize: 16,
   fontWeight: "600",
 },
 alertContainer: {
   backgroundColor: "#f9fafb",
   borderWidth: 1,
   borderColor: "#e5e5e5",
   borderRadius: 8,
   padding: 16,
   alignItems: "center",
   gap: 8,
 },
 alertTitle: {
   fontSize: 16,
   fontWeight: "600",
   color: "#1a1a1a",
   textAlign: "center",
 },
 alertDescription: {
   fontSize: 14,
   color: "#666",
   textAlign: "center",
 },
 expenseText: {
   color: "#e74c3c",
 },
 incomeText: {
   color: "#2ecc71",
 },
});

export default UpcomingDeadlines;