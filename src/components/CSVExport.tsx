import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useSavings } from "@/hooks/useSavings";
import { useToast } from "@/hooks/use-toast";

export const CSVExport = () => {
  const { expenses, formatCurrency } = useApp();
  const { savings } = useSavings();
  const { toast } = useToast();

  const downloadCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        typeof row[header.toLowerCase().replace(' ', '_')] === 'string' 
          ? `"${row[header.toLowerCase().replace(' ', '_')]}"` 
          : row[header.toLowerCase().replace(' ', '_')] || ''
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: `${filename} downloaded successfully`,
    });
  };

  const exportExpenses = () => {
    const expenseData = expenses.map(expense => ({
      date: expense.date,
      category: expense.category,
      amount: expense.amount,
      note: expense.note || '',
    }));

    downloadCSV(
      expenseData,
      'expenses.csv',
      ['Date', 'Category', 'Amount', 'Note']
    );
  };

  const exportSavings = () => {
    const savingData = savings.map(saving => ({
      date: saving.date,
      category: saving.category,
      amount: saving.amount,
    }));

    downloadCSV(
      savingData,
      'savings.csv',
      ['Date', 'Category', 'Amount']
    );
  };

  const exportAll = () => {
    const allData = [
      ...expenses.map(expense => ({
        date: expense.date,
        type: 'Expense',
        category: expense.category,
        amount: -expense.amount, // Negative for expenses
        note: expense.note || '',
      })),
      ...savings.map(saving => ({
        date: saving.date,
        type: 'Saving',
        category: saving.category,
        amount: saving.amount, // Positive for savings
        note: '',
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    downloadCSV(
      allData,
      'financial_report.csv',
      ['Date', 'Type', 'Category', 'Amount', 'Note']
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button onClick={exportExpenses} variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export Expenses
      </Button>
      <Button onClick={exportSavings} variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export Savings
      </Button>
      <Button onClick={exportAll} variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export All
      </Button>
    </div>
  );
};