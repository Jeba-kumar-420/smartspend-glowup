import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: "food", color: "#ef4444", icon: "🍕" },
  { name: "transport", color: "#3b82f6", icon: "🚗" },
  { name: "entertainment", color: "#8b5cf6", icon: "🎬" },
  { name: "shopping", color: "#ec4899", icon: "🛍️" },
  { name: "bills", color: "#f59e0b", icon: "💡" },
  { name: "health", color: "#10b981", icon: "🏥" },
  { name: "education", color: "#6366f1", icon: "📚" },
  { name: "travel", color: "#06b6d4", icon: "✈️" },
  { name: "other", color: "#6b7280", icon: "📝" },
];

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load categories from database or localStorage fallback
  const fetchCategories = async () => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        // Fallback to localStorage
        const stored = localStorage.getItem(`smartspend_categories_${user.id}`);
        if (stored) {
          setCategories(JSON.parse(stored));
        } else {
          // Use default categories
          const defaultCats = DEFAULT_CATEGORIES.map((cat, index) => ({
            ...cat,
            id: `default_${index}`,
          }));
          setCategories(defaultCats);
          localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(defaultCats));
        }
        throw error;
      }

      // If no custom categories, initialize with defaults
      if (!data || data.length === 0) {
        const defaultCats = DEFAULT_CATEGORIES.map((cat, index) => ({
          ...cat,
          id: `default_${index}`,
        }));
        setCategories(defaultCats);
        localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(defaultCats));
      } else {
        const formatted = data.map(cat => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
        }));
        setCategories(formatted);
        localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(formatted));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new category
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    if (!user) return;

    const newCategory = {
      ...categoryData,
      id: `temp_${Date.now()}`,
    };

    try {
      const { data, error } = await supabase
        .from('user_categories')
        .insert({
          user_id: user.id,
          name: categoryData.name,
          color: categoryData.color,
          icon: categoryData.icon,
        })
        .select()
        .single();

      if (error) {
        // Fallback to localStorage
        const updatedCategories = [...categories, newCategory];
        setCategories(updatedCategories);
        localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(updatedCategories));
        throw error;
      }

      const dbCategory = {
        id: data.id,
        name: data.name,
        color: data.color,
        icon: data.icon,
      };

      const updatedCategories = [...categories, dbCategory];
      setCategories(updatedCategories);
      localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(updatedCategories));

      toast({
        title: "Category added",
        description: `${categoryData.name} has been added to your categories.`,
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Category added locally",
        description: `${categoryData.name} saved locally (will sync when online).`,
      });
    }
  };

  // Update a category
  const updateCategory = async (id: string, categoryData: Partial<Omit<Category, 'id'>>) => {
    if (!user) return;

    try {
      if (!id.startsWith('temp_') && !id.startsWith('default_')) {
        const { error } = await supabase
          .from('user_categories')
          .update({
            name: categoryData.name,
            color: categoryData.color,
            icon: categoryData.icon,
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      const updatedCategories = categories.map(cat =>
        cat.id === id ? { ...cat, ...categoryData } : cat
      );
      setCategories(updatedCategories);
      localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(updatedCategories));

      toast({
        title: "Category updated",
        description: "Category has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating category:', error);
      // Still update locally
      const updatedCategories = categories.map(cat =>
        cat.id === id ? { ...cat, ...categoryData } : cat
      );
      setCategories(updatedCategories);
      localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(updatedCategories));

      toast({
        title: "Category updated locally",
        description: "Changes saved locally (will sync when online).",
      });
    }
  };

  // Delete a category
  const deleteCategory = async (id: string) => {
    if (!user) return;

    try {
      if (!id.startsWith('temp_') && !id.startsWith('default_')) {
        const { error } = await supabase
          .from('user_categories')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      const updatedCategories = categories.filter(cat => cat.id !== id);
      setCategories(updatedCategories);
      localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(updatedCategories));

      toast({
        title: "Category deleted",
        description: "Category has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      // Still delete locally
      const updatedCategories = categories.filter(cat => cat.id !== id);
      setCategories(updatedCategories);
      localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(updatedCategories));

      toast({
        title: "Category deleted locally",
        description: "Changes saved locally (will sync when online).",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
};