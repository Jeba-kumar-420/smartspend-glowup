import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ExchangeRates {
  [key: string]: number;
}

const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

export const useCurrency = () => {
  const { toast } = useToast();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchExchangeRates = async (baseCurrency: string = 'USD') => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      const data = await response.json();
      
      if (data.rates) {
        setExchangeRates(data.rates);
        setLastUpdated(new Date());
        localStorage.setItem('exchangeRates', JSON.stringify({
          rates: data.rates,
          baseCurrency,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch current exchange rates. Using cached rates if available.",
        variant: "destructive",
      });
      
      // Try to use cached rates
      const cached = localStorage.getItem('exchangeRates');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        // Use cached rates if less than 1 hour old
        if (Date.now() - parsedCache.timestamp < 3600000) {
          setExchangeRates(parsedCache.rates);
          setLastUpdated(new Date(parsedCache.timestamp));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      console.warn(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
      return amount;
    }
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / exchangeRates[fromCurrency];
    const convertedAmount = usdAmount * exchangeRates[toCurrency];
    
    return convertedAmount;
  };

  const formatCurrency = (amount: number, currencyCode: string): string => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    
    return `${symbol}${amount.toFixed(2)}`;
  };

  const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return 1;
    
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      return 1;
    }
    
    return exchangeRates[toCurrency] / exchangeRates[fromCurrency];
  };

  useEffect(() => {
    // Load cached rates on mount
    const cached = localStorage.getItem('exchangeRates');
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp < 3600000) {
        setExchangeRates(parsedCache.rates);
        setLastUpdated(new Date(parsedCache.timestamp));
      } else {
        fetchExchangeRates();
      }
    } else {
      fetchExchangeRates();
    }
  }, []);

  return {
    exchangeRates,
    loading,
    lastUpdated,
    fetchExchangeRates,
    convertCurrency,
    formatCurrency,
    getExchangeRate,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  };
};