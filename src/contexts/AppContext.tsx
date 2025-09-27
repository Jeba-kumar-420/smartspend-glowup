import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

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
  notes?: string;
  date: string;
  userId: string;
  recurringInterval?: string;
  source?: string;
  ocrRaw?: string;
  ocrParsed?: any;
  currencyCode?: string;
  originalAmount?: number;
  exchangeRate?: number;
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
  const { user: authUser } = useAuth();
  const { profile, updateProfile: updateUserProfile } = useProfile();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currency, setCurrencyState] = useState<string>('USD');
  const [currencyHistory, setCurrencyHistory] = useState<CurrencyHistory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Initialize from auth and profile
  useEffect(() => {
    if (authUser && profile) {
      setUser({
        id: authUser.id,
        name: profile.full_name || authUser.email || '',
        email: authUser.email || '',
        avatar: profile.avatar_url || undefined,
        joinDate: profile.created_at,
      });
      setIsLoggedIn(true);
      setCurrencyState(profile.currency || 'USD');
      fetchExpenses();
    } else {
      setUser(null);
      setIsLoggedIn(false);
      setExpenses([]);
    }
  }, [authUser, profile]);

  const fetchExpenses = async () => {
    if (!authUser) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedExpenses = data.map(expense => ({
        id: expense.id.toString(),
        amount: parseFloat(expense.amount.toString()),
        category: expense.category,
        note: expense.note || undefined,
        date: expense.date,
        userId: expense.user_id || authUser.id,
        recurringInterval: expense.recurring_interval || 'none',
        source: expense.source || 'manual',
        ocrRaw: expense.ocr_raw || undefined,
        ocrParsed: expense.ocr_parsed || undefined,
        currencyCode: expense.currency_code || 'USD',
        originalAmount: expense.original_amount ? parseFloat(expense.original_amount.toString()) : undefined,
        exchangeRate: expense.exchange_rate ? parseFloat(expense.exchange_rate.toString()) : 1.0,
      }));
      
      setExpenses(formattedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // User management functions
  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    setExpenses([]);
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (user && profile) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update profile in Supabase
      await updateUserProfile({
        full_name: userData.name,
        avatar_url: userData.avatar,
      });
    }
  };

  // Currency management functions
  const setCurrency = async (newCurrency: string) => {
    if (currency !== newCurrency && profile) {
      addCurrencyChange(currency, newCurrency, 'User preference change');
      setCurrencyState(newCurrency);
      
      // Update currency in profile
      await updateUserProfile({
        currency: newCurrency
      });
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
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId'>) => {
    if (!authUser) return;
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: authUser.id,
          amount: expenseData.amount,
          category: expenseData.category,
          note: expenseData.note || expenseData.notes || null,
          date: expenseData.date,
          recurring_interval: expenseData.recurringInterval || 'none',
          source: expenseData.source || 'manual',
          ocr_raw: expenseData.ocrRaw || null,
          ocr_parsed: expenseData.ocrParsed || null,
          currency_code: expenseData.currencyCode || currency,
          original_amount: expenseData.originalAmount || null,
          exchange_rate: expenseData.exchangeRate || 1.0,
        })
        .select()
        .single();

      if (error) throw error;

      const newExpense: Expense = {
        id: data.id.toString(),
        amount: parseFloat(data.amount.toString()),
        category: data.category,
        note: data.note || undefined,
        date: data.date,
        userId: data.user_id || authUser.id,
        recurringInterval: data.recurring_interval || 'none',
        source: data.source || 'manual',
        ocrRaw: data.ocr_raw || undefined,
        ocrParsed: data.ocr_parsed || undefined,
        currencyCode: data.currency_code || 'USD',
        originalAmount: data.original_amount ? parseFloat(data.original_amount.toString()) : undefined,
        exchangeRate: data.exchange_rate ? parseFloat(data.exchange_rate.toString()) : 1.0,
      };

      setExpenses(prev => [newExpense, ...prev]);
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    if (!authUser) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          amount: expenseData.amount,
          category: expenseData.category,
          note: expenseData.note || null,
          date: expenseData.date,
          currency_code: expenseData.currencyCode,
          original_amount: expenseData.originalAmount,
          exchange_rate: expenseData.exchangeRate,
        })
        .eq('id', parseInt(id))
        .eq('user_id', authUser.id);

      if (error) throw error;

      const newExpenses = expenses.map(exp => 
        exp.id === id ? { ...exp, ...expenseData } : exp
      );
      setExpenses(newExpenses);
      
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    }
  };

  const deleteExpense = async (id: string) => {
    if (!authUser) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', parseInt(id))
        .eq('user_id', authUser.id);

      if (error) throw error;

      const newExpenses = expenses.filter(exp => exp.id !== id);
      setExpenses(newExpenses);
      
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
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