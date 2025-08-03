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
        .from('savings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedSavings = data.map(saving => ({
        id: saving.id.toString(),
        amount: parseFloat(saving.amount.toString()),
        category: saving.category,
        date: saving.date,
        userId: saving.user_id || user.id,
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
        .from('savings')
        .insert({
          user_id: user.id,
          amount: savingData.amount,
          category: savingData.category,
          date: savingData.date,
        })
        .select()
        .single();

      if (error) throw error;

      const newSaving: Saving = {
        id: data.id.toString(),
        amount: parseFloat(data.amount.toString()),
        category: data.category,
        date: data.date,
        userId: data.user_id || user.id,
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
        .from('savings')
        .update({
          amount: savingData.amount,
          category: savingData.category,
          date: savingData.date,
        })
        .eq('id', parseInt(id))
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
        .from('savings')
        .delete()
        .eq('id', parseInt(id))
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