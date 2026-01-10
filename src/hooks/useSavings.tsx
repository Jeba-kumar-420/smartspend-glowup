import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Saving {
  id: string;
  amount: number;
  category: string;
  date: string;
  userId: string;
}

interface SavingRow {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}

export const useSavings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavings();
    } else {
      setSavings([]);
      setLoading(false);
    }
  }, [user]);

  const fetchSavings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('savings' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedSavings = ((data || []) as unknown as SavingRow[]).map(saving => ({
        id: saving.id,
        amount: Number(saving.amount),
        category: saving.category,
        date: saving.date,
        userId: saving.user_id,
      }));
      
      setSavings(formattedSavings);
    } catch (error) {
      console.error('Error fetching savings:', error);
      toast({
        title: "Error",
        description: "Failed to load savings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSaving = async (savingData: Omit<Saving, 'id' | 'userId'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('savings' as any)
        .insert({
          user_id: user.id,
          amount: savingData.amount,
          category: savingData.category,
          date: savingData.date,
        })
        .select()
        .single();

      if (error) throw error;

      const savingRow = data as unknown as SavingRow;
      const newSaving: Saving = {
        id: savingRow.id,
        amount: Number(savingRow.amount),
        category: savingRow.category,
        date: savingRow.date,
        userId: savingRow.user_id,
      };

      setSavings(prev => [newSaving, ...prev]);
      toast({
        title: "Success",
        description: "Saving added successfully",
      });
    } catch (error) {
      console.error('Error adding saving:', error);
      toast({
        title: "Error",
        description: "Failed to add saving",
        variant: "destructive",
      });
    }
  };

  const updateSaving = async (id: string, savingData: Partial<Saving>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('savings' as any)
        .update({
          amount: savingData.amount,
          category: savingData.category,
          date: savingData.date,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      const newSavings = savings.map(saving => 
        saving.id === id ? { ...saving, ...savingData } : saving
      );
      setSavings(newSavings);
      
      toast({
        title: "Success",
        description: "Saving updated successfully",
      });
    } catch (error) {
      console.error('Error updating saving:', error);
      toast({
        title: "Error",
        description: "Failed to update saving",
        variant: "destructive",
      });
    }
  };

  const deleteSaving = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('savings' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      const newSavings = savings.filter(saving => saving.id !== id);
      setSavings(newSavings);
      
      toast({
        title: "Success",
        description: "Saving deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting saving:', error);
      toast({
        title: "Error",
        description: "Failed to delete saving",
        variant: "destructive",
      });
    }
  };

  return {
    savings,
    loading,
    addSaving,
    updateSaving,
    deleteSaving,
    refetch: fetchSavings
  };
};
