import { useMemo } from 'react';
import { useExpenses } from './useExpenses';
import { useIncome } from './useIncome';
import { useBudgets } from './useBudgets';

export interface CategorySummary {
  category: string;
  spent: number;
  budgetLimit: number | null;
  remaining: number | null;
  percentUsed: number | null;
}

export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  categoryBreakdown: CategorySummary[];
}

export const useFinanceSummary = () => {
  const { expenses, loading: expensesLoading } = useExpenses();
  const { incomes, loading: incomesLoading, getTotalIncome } = useIncome();
  const { budgets, loading: budgetsLoading, getBudgetForCategory, getTotalBudgetLimit } = useBudgets();

  const loading = expensesLoading || incomesLoading || budgetsLoading;

  const getCurrentMonthSummary = useMemo((): MonthlySummary => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Filter expenses for current month
    const monthExpenses = expenses.filter((expense) => {
      const date = new Date(expense.date);
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    });

    // Calculate total expenses
    const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate total income for current month
    const totalIncome = getTotalIncome(currentMonth, currentYear);

    // Group expenses by category
    const categorySpending: Record<string, number> = {};
    monthExpenses.forEach((expense) => {
      categorySpending[expense.category] = (categorySpending[expense.category] || 0) + expense.amount;
    });

    // Build category breakdown with budget info
    const categories = new Set([
      ...Object.keys(categorySpending),
      ...budgets
        .filter((b) => b.month === currentMonth && b.year === currentYear)
        .map((b) => b.category),
    ]);

    const categoryBreakdown: CategorySummary[] = Array.from(categories).map((category) => {
      const spent = categorySpending[category] || 0;
      const budget = getBudgetForCategory(category, currentMonth, currentYear);
      const budgetLimit = budget?.limitAmount ?? null;
      const remaining = budgetLimit !== null ? budgetLimit - spent : null;
      const percentUsed = budgetLimit !== null && budgetLimit > 0 
        ? Math.round((spent / budgetLimit) * 100) 
        : null;

      return {
        category,
        spent,
        budgetLimit,
        remaining,
        percentUsed,
      };
    });

    return {
      month: currentMonth,
      year: currentYear,
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      categoryBreakdown,
    };
  }, [expenses, incomes, budgets, getTotalIncome, getBudgetForCategory]);

  const getOverBudgetCategories = () => {
    return getCurrentMonthSummary.categoryBreakdown.filter(
      (cat) => cat.remaining !== null && cat.remaining < 0
    );
  };

  const getBudgetUtilization = () => {
    const totalBudget = getTotalBudgetLimit();
    if (totalBudget === 0) return null;
    return Math.round((getCurrentMonthSummary.totalExpenses / totalBudget) * 100);
  };

  return {
    loading,
    currentMonthSummary: getCurrentMonthSummary,
    getOverBudgetCategories,
    getBudgetUtilization,
    expenses,
    incomes,
    budgets,
  };
};
