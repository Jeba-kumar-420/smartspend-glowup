import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Income {
  id: string;
  userId: string;
  source: string;
  amount: number;
  incomeDate: string;
  createdAt: string;
}

export const useIncome = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchIncomes = async () => {
    if (!user) {
      setIncomes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .order('income_date', { ascending: false });

      if (error) throw error;

      const formattedIncomes: Income[] = (data || []).map((item) => ({
        id: item.id,
        userId: item.user_id,
        source: item.source,
        amount: Number(item.amount),
        incomeDate: item.income_date,
        createdAt: item.created_at,
      }));

      setIncomes(formattedIncomes);
    } catch (error: any) {
      toast({
        title: 'Error fetching income',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addIncome = async (incomeData: Omit<Income, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('income')
        .insert({
          user_id: user.id,
          source: incomeData.source,
          amount: incomeData.amount,
          income_date: incomeData.incomeDate,
        })
        .select()
        .single();

      if (error) throw error;

      const newIncome: Income = {
        id: data.id,
        userId: data.user_id,
        source: data.source,
        amount: Number(data.amount),
        incomeDate: data.income_date,
        createdAt: data.created_at,
      };

      setIncomes((prev) => [newIncome, ...prev]);
      toast({ title: 'Income added successfully' });
      return newIncome;
    } catch (error: any) {
      toast({
        title: 'Error adding income',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateIncome = async (id: string, incomeData: Partial<Income>) => {
    try {
      const updateData: any = {};
      if (incomeData.source !== undefined) updateData.source = incomeData.source;
      if (incomeData.amount !== undefined) updateData.amount = incomeData.amount;
      if (incomeData.incomeDate !== undefined) updateData.income_date = incomeData.incomeDate;

      const { error } = await supabase
        .from('income')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setIncomes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...incomeData } : item
        )
      );
      toast({ title: 'Income updated successfully' });
    } catch (error: any) {
      toast({
        title: 'Error updating income',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      const { error } = await supabase.from('income').delete().eq('id', id);

      if (error) throw error;

      setIncomes((prev) => prev.filter((item) => item.id !== id));
      toast({ title: 'Income deleted successfully' });
    } catch (error: any) {
      toast({
        title: 'Error deleting income',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getTotalIncome = (month?: number, year?: number) => {
    let filtered = incomes;
    if (month !== undefined && year !== undefined) {
      filtered = incomes.filter((income) => {
        const date = new Date(income.incomeDate);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
    }
    return filtered.reduce((sum, income) => sum + income.amount, 0);
  };

  useEffect(() => {
    fetchIncomes();
  }, [user]);

  return {
    incomes,
    loading,
    addIncome,
    updateIncome,
    deleteIncome,
    getTotalIncome,
    refetch: fetchIncomes,
  };
};
