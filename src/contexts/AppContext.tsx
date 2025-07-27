import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
  userId: string;
}

export interface CurrencyHistory {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  changeDate: string;
  reason?: string;
}

export interface AppContextType {
  // User management
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  
  // Currency management
  currency: string;
  setCurrency: (currency: string) => void;
  currencyHistory: CurrencyHistory[];
  addCurrencyChange: (fromCurrency: string, toCurrency: string, reason?: string) => void;
  
  // Expense management
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'userId'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Utility functions
  formatCurrency: (amount: number) => string;
  getTotalSpending: (period: 'today' | 'week' | 'month') => number;
  getSpendingByCategory: () => Record<string, number>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currency, setCurrencyState] = useState<string>('USD');
  const [currencyHistory, setCurrencyHistory] = useState<CurrencyHistory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Initialize from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('smartspend_user');
    const savedCurrency = localStorage.getItem('smartspend_currency');
    const savedCurrencyHistory = localStorage.getItem('smartspend_currency_history');
    const savedExpenses = localStorage.getItem('smartspend_expenses');

    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsLoggedIn(true);
    } else {
      // Set default user for demo
      const defaultUser: User = {
        id: 'demo-user',
        name: 'John Doe',
        email: 'john.doe@example.com',
        joinDate: new Date().toISOString(),
      };
      setUser(defaultUser);
      setIsLoggedIn(true);
    }

    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }

    if (savedCurrencyHistory) {
      setCurrencyHistory(JSON.parse(savedCurrencyHistory));
    }

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // User management functions
  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('smartspend_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('smartspend_user');
    localStorage.removeItem('smartspend_expenses');
    setExpenses([]);
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('smartspend_user', JSON.stringify(updatedUser));
    }
  };

  // Currency management functions
  const setCurrency = (newCurrency: string) => {
    if (currency !== newCurrency) {
      addCurrencyChange(currency, newCurrency, 'User preference change');
      setCurrencyState(newCurrency);
      localStorage.setItem('smartspend_currency', newCurrency);
    }
  };

  const addCurrencyChange = (fromCurrency: string, toCurrency: string, reason?: string) => {
    const change: CurrencyHistory = {
      id: Date.now().toString(),
      fromCurrency,
      toCurrency,
      changeDate: new Date().toISOString(),
      reason,
    };
    
    const newHistory = [change, ...currencyHistory].slice(0, 50); // Keep last 50 changes
    setCurrencyHistory(newHistory);
    localStorage.setItem('smartspend_currency_history', JSON.stringify(newHistory));
  };

  // Expense management functions
  const addExpense = (expenseData: Omit<Expense, 'id' | 'userId'>) => {
    if (!user) return;
    
    const expense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      userId: user.id,
    };
    
    const newExpenses = [expense, ...expenses];
    setExpenses(newExpenses);
    localStorage.setItem('smartspend_expenses', JSON.stringify(newExpenses));
  };

  const updateExpense = (id: string, expenseData: Partial<Expense>) => {
    const newExpenses = expenses.map(exp => 
      exp.id === id ? { ...exp, ...expenseData } : exp
    );
    setExpenses(newExpenses);
    localStorage.setItem('smartspend_expenses', JSON.stringify(newExpenses));
  };

  const deleteExpense = (id: string) => {
    const newExpenses = expenses.filter(exp => exp.id !== id);
    setExpenses(newExpenses);
    localStorage.setItem('smartspend_expenses', JSON.stringify(newExpenses));
  };

  // Utility functions
  const formatCurrency = (amount: number): string => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  const getTotalSpending = (period: 'today' | 'week' | 'month'): number => {
    const now = new Date();
    const startOfPeriod = new Date();

    switch (period) {
      case 'today':
        startOfPeriod.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startOfPeriod.setDate(now.getDate() - 7);
        break;
      case 'month':
        startOfPeriod.setMonth(now.getMonth() - 1);
        break;
    }

    return expenses
      .filter(expense => new Date(expense.date) >= startOfPeriod)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getSpendingByCategory = (): Record<string, number> => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const value: AppContextType = {
    user,
    isLoggedIn,
    login,
    logout,
    updateProfile,
    currency,
    setCurrency,
    currencyHistory,
    addCurrencyChange,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    formatCurrency,
    getTotalSpending,
    getSpendingByCategory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};