import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export const useBudget = () => {
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
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error: any) {
      console.error('Error fetching budgets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch budgets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentBudget = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Return total budget limit for current month
    const monthBudgets = budgets.filter(budget => 
      budget.month === currentMonth && budget.year === currentYear
    );
    
    return monthBudgets.length > 0 
      ? { monthly_budget: monthBudgets.reduce((sum, b) => sum + b.limit_amount, 0) }
      : undefined;
  };

  const setBudget = async (amount: number, month?: number, year?: number, category: string = 'General') => {
    if (!user) return { error: new Error('User not authenticated') };

    const now = new Date();
    const targetMonth = month || (now.getMonth() + 1);
    const targetYear = year || now.getFullYear();

    try {
      const existingBudget = budgets.find(b => 
        b.month === targetMonth && b.year === targetYear && b.category === category
      );

      if (existingBudget) {
        // Update existing budget
        const { error } = await supabase
          .from('budgets')
          .update({ limit_amount: amount })
          .eq('id', existingBudget.id);

        if (error) throw error;

        setBudgets(prev => prev.map(b => 
          b.id === existingBudget.id 
            ? { ...b, limit_amount: amount }
            : b
        ));
      } else {
        // Create new budget
        const { data, error } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            category,
            limit_amount: amount,
            month: targetMonth,
            year: targetYear
          })
          .select()
          .single();

        if (error) throw error;
        setBudgets(prev => [data, ...prev]);
      }

      toast({
        title: "Success",
        description: "Budget updated successfully",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error setting budget:', error);
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  return {
    budgets,
    loading,
    getCurrentBudget,
    setBudget,
    refetch: fetchBudgets,
  };
};
