import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limitAmount: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBudgets = async () => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;

      const formattedBudgets: Budget[] = (data || []).map((item) => ({
        id: item.id,
        userId: item.user_id,
        category: item.category,
        limitAmount: Number(item.limit_amount),
        month: item.month,
        year: item.year,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setBudgets(formattedBudgets);
    } catch (error: any) {
      toast({
        title: 'Error fetching budgets',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setBudget = async (
    category: string,
    limitAmount: number,
    month?: number,
    year?: number
  ) => {
    if (!user) return null;

    const targetMonth = month ?? new Date().getMonth() + 1;
    const targetYear = year ?? new Date().getFullYear();

    try {
      // Check if budget exists for this category/month/year
      const existingBudget = budgets.find(
        (b) =>
          b.category === category &&
          b.month === targetMonth &&
          b.year === targetYear
      );

      if (existingBudget) {
        // Update existing budget
        const { error } = await supabase
          .from('budgets')
          .update({ limit_amount: limitAmount })
          .eq('id', existingBudget.id);

        if (error) throw error;

        setBudgets((prev) =>
          prev.map((b) =>
            b.id === existingBudget.id ? { ...b, limitAmount } : b
          )
        );
        toast({ title: 'Budget updated successfully' });
      } else {
        // Create new budget
        const { data, error } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            category,
            limit_amount: limitAmount,
            month: targetMonth,
            year: targetYear,
          })
          .select()
          .single();

        if (error) throw error;

        const newBudget: Budget = {
          id: data.id,
          userId: data.user_id,
          category: data.category,
          limitAmount: Number(data.limit_amount),
          month: data.month,
          year: data.year,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setBudgets((prev) => [newBudget, ...prev]);
        toast({ title: 'Budget created successfully' });
      }
    } catch (error: any) {
      toast({
        title: 'Error setting budget',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);

      if (error) throw error;

      setBudgets((prev) => prev.filter((b) => b.id !== id));
      toast({ title: 'Budget deleted successfully' });
    } catch (error: any) {
      toast({
        title: 'Error deleting budget',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getBudgetForCategory = (
    category: string,
    month?: number,
    year?: number
  ) => {
    const targetMonth = month ?? new Date().getMonth() + 1;
    const targetYear = year ?? new Date().getFullYear();

    return budgets.find(
      (b) =>
        b.category === category &&
        b.month === targetMonth &&
        b.year === targetYear
    );
  };

  const getCurrentMonthBudgets = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return budgets.filter(
      (b) => b.month === currentMonth && b.year === currentYear
    );
  };

  const getTotalBudgetLimit = (month?: number, year?: number) => {
    const targetMonth = month ?? new Date().getMonth() + 1;
    const targetYear = year ?? new Date().getFullYear();

    return budgets
      .filter((b) => b.month === targetMonth && b.year === targetYear)
      .reduce((sum, b) => sum + b.limitAmount, 0);
  };

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  return {
    budgets,
    loading,
    setBudget,
    deleteBudget,
    getBudgetForCategory,
    getCurrentMonthBudgets,
    getTotalBudgetLimit,
    refetch: fetchBudgets,
  };
};
