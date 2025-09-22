import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  id: string;
  user_id: string;
  monthly_budget: number;
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
    
    return budgets.find(budget => 
      budget.month === currentMonth && budget.year === currentYear
    );
  };

  const setBudget = async (amount: number, month?: number, year?: number) => {
    if (!user) return { error: new Error('User not authenticated') };

    const now = new Date();
    const targetMonth = month || (now.getMonth() + 1);
    const targetYear = year || now.getFullYear();

    try {
      const existingBudget = budgets.find(b => 
        b.month === targetMonth && b.year === targetYear
      );

      if (existingBudget) {
        // Update existing budget
        const { error } = await supabase
          .from('budgets')
          .update({ monthly_budget: amount })
          .eq('id', existingBudget.id);

        if (error) throw error;

        setBudgets(prev => prev.map(b => 
          b.id === existingBudget.id 
            ? { ...b, monthly_budget: amount }
            : b
        ));
      } else {
        // Create new budget
        const { data, error } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            monthly_budget: amount,
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