export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
