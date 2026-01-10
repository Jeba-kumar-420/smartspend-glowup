import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  created_at: string;
}

interface SavingsGoalRow {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export const useSavingsGoals = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch goals from database
  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('savings_goals' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedGoals = ((data || []) as unknown as SavingsGoalRow[]).map(goal => ({
        id: goal.id,
        title: goal.title,
        target_amount: Number(goal.target_amount),
        current_amount: Number(goal.current_amount),
        deadline: goal.deadline || undefined,
        created_at: goal.created_at,
      }));

      setGoals(formattedGoals);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      toast({
        title: "Error",
        description: "Failed to load savings goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new goal
  const addGoal = async (goalData: {
    title: string;
    target_amount: number;
    deadline?: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('savings_goals' as any)
        .insert({
          user_id: user.id,
          title: goalData.title,
          target_amount: goalData.target_amount,
          deadline: goalData.deadline || null,
        })
        .select()
        .single();

      if (error) throw error;

      const goalRow = data as unknown as SavingsGoalRow;
      const newGoal: SavingsGoal = {
        id: goalRow.id,
        title: goalRow.title,
        target_amount: Number(goalRow.target_amount),
        current_amount: Number(goalRow.current_amount),
        deadline: goalRow.deadline || undefined,
        created_at: goalRow.created_at,
      };

      setGoals(prev => [newGoal, ...prev]);

      toast({
        title: "Goal created",
        description: `${goalData.title} has been added to your savings goals.`,
      });
    } catch (error) {
      console.error('Error adding savings goal:', error);
      toast({
        title: "Error",
        description: "Failed to create savings goal",
        variant: "destructive",
      });
    }
  };

  // Update goal progress
  const updateGoalProgress = async (id: string, amount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('savings_goals' as any)
        .update({ current_amount: amount })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.map(goal =>
        goal.id === id ? { ...goal, current_amount: amount } : goal
      ));

      toast({
        title: "Goal updated",
        description: "Progress has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast({
        title: "Error",
        description: "Failed to update goal progress",
        variant: "destructive",
      });
    }
  };

  // Delete a goal
  const deleteGoal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('savings_goals' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== id));

      toast({
        title: "Goal deleted",
        description: "Savings goal has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete savings goal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    refetch: fetchGoals,
  };
};
