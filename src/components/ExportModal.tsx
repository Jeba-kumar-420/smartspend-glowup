import React, { useState } from 'react';
import { Download, Calendar, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportModalProps {
  trigger: React.ReactNode;
  dataType: 'expenses' | 'savings';
}

export const ExportModal: React.FC<ExportModalProps> = ({ trigger, dataType }) => {
  const { expenses, formatCurrency, getSpendingByCategory } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState<'this_month' | 'last_month' | 'all'>('this_month');

  const getFilteredData = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (dateRange) {
      case 'this_month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      default:
        startDate = new Date(0);
        endDate = now;
    }

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  const exportCSV = () => {
    const filteredExpenses = getFilteredData();
    
    if (filteredExpenses.length === 0) {
      toast({
        title: "No Data",
        description: "No expenses found for the selected date range.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Date', 'Amount', 'Category', 'Notes', 'Source'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        expense.date,
        expense.amount,
        expense.category,
        `"${(expense.note || '').replace(/"/g, '""')}"`,
        expense.source || 'manual'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fileName = `smartspend_${dataType}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.download = fileName;
    link.click();

    toast({
      title: "Export Successful",
      description: `${filteredExpenses.length} records exported to CSV.`,
    });
  };

  const exportPDF = () => {
    const filteredExpenses = getFilteredData();
    
    if (filteredExpenses.length === 0) {
      toast({
        title: "No Data",
        description: "No expenses found for the selected date range.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('SmartSpend Expense Report', 20, 20);
    
    // Date range
    doc.setFontSize(12);
    const dateText = dateRange === 'all' ? 'All Time' : 
                    dateRange === 'this_month' ? 'This Month' : 'Last Month';
    doc.text(`Period: ${dateText}`, 20, 35);
    const generatedDate = format(new Date(), 'PPP');
    doc.text(`Generated: ${generatedDate}`, 20, 45);
    
    // Summary
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryTotals = getSpendingByCategory();
    
    doc.setFontSize(14);
    doc.text('Summary', 20, 60);
    doc.setFontSize(12);
    doc.text(`Total Expenses: ${formatCurrency(totalAmount)}`, 20, 75);
    doc.text(`Number of Transactions: ${filteredExpenses.length}`, 20, 85);
    
    // Category breakdown
    let yPos = 100;
    doc.text('Category Breakdown:', 20, yPos);
    yPos += 10;
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      doc.text(`${category}: ${formatCurrency(amount)}`, 30, yPos);
      yPos += 8;
    });
    
    // Expenses table
    yPos += 10;
    const tableData = filteredExpenses.map(expense => [
      format(new Date(expense.date), 'MMM dd, yyyy'),
      formatCurrency(expense.amount),
      expense.category,
      expense.note || '',
      expense.source || 'manual'
    ]);
    
    (doc as any).autoTable({
      startY: yPos,
      head: [['Date', 'Amount', 'Category', 'Notes', 'Source']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] },
    });
    
    const pdfFileName = `smartspend_${dataType}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(pdfFileName);
    
    toast({
      title: "Export Successful",
      description: `${filteredExpenses.length} records exported to PDF.`,
    });
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportCSV();
    } else {
      exportPDF();
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export {dataType === 'expenses' ? 'Expenses' : 'Savings'}
          </DialogTitle>
          <DialogDescription>
            Choose your export format and date range to download your data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV (Excel compatible)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    PDF (Formatted report)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateRange">Date Range</Label>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};