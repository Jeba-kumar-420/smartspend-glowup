import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, History, Globe } from "lucide-react";
import { format } from "date-fns";

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
];

export const CurrencySelector = () => {
  const { currency, setCurrency, currencyHistory } = useApp();
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencyChange = () => {
    if (selectedCurrency !== currency) {
      setCurrency(selectedCurrency);
      toast({
        title: "Currency Updated",
        description: `Currency changed to ${selectedCurrency}`,
      });
    }
    setIsOpen(false);
  };

  const currentCurrencyInfo = CURRENCIES.find(c => c.code === currency);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          {currentCurrencyInfo?.symbol} {currency}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Currency */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{currentCurrencyInfo?.symbol}</div>
                <div>
                  <div className="font-medium">{currentCurrencyInfo?.name}</div>
                  <div className="text-sm text-muted-foreground">{currency}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Currency Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select New Currency</label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{curr.symbol}</span>
                      <span>{curr.name}</span>
                      <span className="text-muted-foreground">({curr.code})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency History */}
          {currencyHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Changes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {currencyHistory.slice(0, 5).map((change) => (
                      <div key={change.id} className="text-xs border-l-2 border-primary/20 pl-2">
                        <div className="font-medium">
                          {change.fromCurrency} → {change.toCurrency}
                        </div>
                        <div className="text-muted-foreground">
                          {format(new Date(change.changeDate), 'MMM dd, yyyy')}
                        </div>
                        {change.reason && (
                          <div className="text-muted-foreground italic">
                            {change.reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleCurrencyChange} 
              className="flex-1"
              disabled={selectedCurrency === currency}
            >
              Update Currency
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};