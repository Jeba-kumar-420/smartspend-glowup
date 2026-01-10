import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'default_0', name: "food", color: "#ef4444", icon: "🍕" },
  { id: 'default_1', name: "transport", color: "#3b82f6", icon: "🚗" },
  { id: 'default_2', name: "entertainment", color: "#8b5cf6", icon: "🎬" },
  { id: 'default_3', name: "shopping", color: "#ec4899", icon: "🛍️" },
  { id: 'default_4', name: "bills", color: "#f59e0b", icon: "💡" },
  { id: 'default_5', name: "health", color: "#10b981", icon: "🏥" },
  { id: 'default_6', name: "education", color: "#6366f1", icon: "📚" },
  { id: 'default_7', name: "travel", color: "#06b6d4", icon: "✈️" },
  { id: 'default_8', name: "other", color: "#6b7280", icon: "📝" },
];

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load categories from localStorage
  const fetchCategories = async () => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(`smartspend_categories_${user.id}`);
      if (stored) {
        setCategories(JSON.parse(stored));
      } else {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(DEFAULT_CATEGORIES));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  // Add a new category
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    if (!user) return;

    const newCategory: Category = {
      ...categoryData,
      id: `custom_${Date.now()}`,
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(updatedCategories));

    toast({
      title: "Category added",
      description: `${categoryData.name} has been added to your categories.`,
    });
  };

  // Update a category
  const updateCategory = async (id: string, categoryData: Partial<Omit<Category, 'id'>>) => {
    if (!user) return;

    const updatedCategories = categories.map(cat =>
      cat.id === id ? { ...cat, ...categoryData } : cat
    );
    setCategories(updatedCategories);
    localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(updatedCategories));

    toast({
      title: "Category updated",
      description: "Category has been updated successfully.",
    });
  };

  // Delete a category
  const deleteCategory = async (id: string) => {
    if (!user) return;

    const updatedCategories = categories.filter(cat => cat.id !== id);
    setCategories(updatedCategories);
    localStorage.setItem(`smartspend_categories_${user.id}`, JSON.stringify(updatedCategories));

    toast({
      title: "Category deleted",
      description: "Category has been removed successfully.",
    });
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
