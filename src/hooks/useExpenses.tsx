import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  userId: string;
  recurringInterval?: string;
}

export const useExpenses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchExpenses();
    } else {
      setExpenses([]);
      setLoading(false);
    }
  }, [user]);

  const fetchExpenses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedExpenses = data.map(expense => ({
        id: expense.id.toString(),
        amount: parseFloat(expense.amount.toString()),
        category: expense.category,
        date: expense.date,
        notes: expense.note || '',
        userId: expense.user_id || user.id,
        recurringInterval: expense.recurring_interval || 'none',
      }));
      
      setExpenses(formattedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.date,
          note: expenseData.notes || null,
          recurring_interval: expenseData.recurringInterval || 'none',
        })
        .select()
        .single();

      if (error) throw error;

      const newExpense: Expense = {
        id: data.id.toString(),
        amount: parseFloat(data.amount.toString()),
        category: data.category,
        date: data.date,
        notes: data.note || '',
        userId: data.user_id || user.id,
        recurringInterval: data.recurring_interval || 'none',
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.date,
          note: expenseData.notes || null,
          recurring_interval: expenseData.recurringInterval || 'none',
        })
        .eq('id', parseInt(id))
        .eq('user_id', user.id);

      if (error) throw error;

      const newExpenses = expenses.map(expense => 
        expense.id === id ? { ...expense, ...expenseData } : expense
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', parseInt(id))
        .eq('user_id', user.id);

      if (error) throw error;

      const newExpenses = expenses.filter(expense => expense.id !== id);
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

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses
  };
};