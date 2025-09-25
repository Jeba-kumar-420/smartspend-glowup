import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, DollarSign, ArrowUpDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Receipt, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export const HistorySection = () => {
  const { expenses, currencyHistory, formatCurrency } = useApp();

  const sortedExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  const sortedCurrencyHistory = currencyHistory
    .sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime())
    .slice(0, 10);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: "bg-orange-100 text-orange-800 border-orange-200",
      transport: "bg-blue-100 text-blue-800 border-blue-200",
      entertainment: "bg-purple-100 text-purple-800 border-purple-200",
      shopping: "bg-pink-100 text-pink-800 border-pink-200",
      utilities: "bg-green-100 text-green-800 border-green-200",
      education: "bg-indigo-100 text-indigo-800 border-indigo-200",
      health: "bg-red-100 text-red-800 border-red-200",
      other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Activity History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
            <TabsTrigger value="expenses" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="currency" className="gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Currency Changes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses" className="p-4 pt-2">
            <ScrollArea className="h-80">
              {sortedExpenses.length > 0 ? (
                <div className="space-y-3">
                   {sortedExpenses.map((expense, index) => (
                     <motion.div
                       key={expense.id}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.3, delay: index * 0.05 }}
                       className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors gap-2"
                     >
                       <div className="flex-1">
                         <div className="flex flex-wrap items-center gap-2 mb-1">
                           <Badge variant="outline" className={`${getCategoryColor(expense.category)} text-xs`}>
                             {expense.category}
                           </Badge>
                           {expense.recurringInterval && expense.recurringInterval !== 'none' && (
                             <Badge variant="outline" className="text-xs">
                               <RotateCcw className="h-3 w-3 mr-1" />
                               {expense.recurringInterval}
                             </Badge>
                           )}
                           {expense.source === 'receipt' && (
                             <Badge variant="secondary" className="text-xs">
                               <Receipt className="h-3 w-3 mr-1" />
                               Scanned
                             </Badge>
                           )}
                           <span className="text-sm text-muted-foreground">
                             {format(new Date(expense.date), 'MMM dd, yyyy')}
                           </span>
                         </div>
                         {expense.notes && (
                           <p className="text-sm text-muted-foreground">
                             {expense.notes}
                           </p>
                         )}
                       </div>
                       <div className="text-left sm:text-right">
                         <div className="font-semibold text-destructive">
                           -{formatCurrency(expense.amount)}
                         </div>
                       </div>
                     </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No expenses recorded yet</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="currency" className="p-4 pt-2">
            <ScrollArea className="h-80">
              {sortedCurrencyHistory.length > 0 ? (
                <div className="space-y-3">
                  {sortedCurrencyHistory.map((change) => (
                    <div
                      key={change.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors gap-2"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{change.fromCurrency}</span>
                            <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium text-sm">{change.toCurrency}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {format(new Date(change.changeDate), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        {change.reason && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {change.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ArrowUpDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No currency changes recorded</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};