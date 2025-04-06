
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import StockContext from '@/contexts/StockContext';
import { Stock, Portfolio, Transaction } from '@/types/stock';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUserBalance } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setPortfolio(null);
      setTransactions([]);
    }
  }, [user]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Fetch stocks
      const stocksResponse = await axios.get(`${API_URL}/stocks`);
      
      // Format stock data from Firebase to match our frontend Stock type
      const stockData = formatFirebaseStockData(stocksResponse.data);
      setStocks(stockData);
      
      if (user) {
        // Fetch portfolio
        const portfolioResponse = await axios.get(`${API_URL}/portfolio/${user.id}`);
        setPortfolio(portfolioResponse.data || {
          id: '1',
          userId: user.id,
          stocks: [],
          totalValue: 0,
          profitLoss: 0
        });
        
        // Fetch transactions
        const transactionsResponse = await axios.get(`${API_URL}/transactions/${user.id}`);
        // Firebase returns an object with transaction IDs as keys
        const transactionsData = transactionsResponse.data;
        
        if (transactionsData) {
          // Convert Firebase object format to array
          const transactionsArray = Object.keys(transactionsData).map(key => ({
            ...transactionsData[key],
            firebaseId: key // Store the Firebase key
          }));
          setTransactions(transactionsArray);
        } else {
          setTransactions([]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Format Firebase stock data to match our frontend Stock type
  const formatFirebaseStockData = (firebaseStocks: any): Stock[] => {
    const formattedStocks: Stock[] = [];
    
    for (const symbol in firebaseStocks) {
      const stockData = firebaseStocks[symbol];
      
      if (stockData.latest) {
        const historicalData = stockData.history ? 
          Object.entries(stockData.history).map(([date, price]) => ({
            date,
            price: Number(price)
          })) : [];
          
        formattedStocks.push({
          symbol,
          name: stockData.name || symbol,
          price: stockData.latest.price || 0,
          change: stockData.latest.change || 0,
          changePercent: stockData.latest.changePercent || 0,
          marketCap: stockData.marketCap || 0,
          historicalData,
          prediction: stockData.prediction || { price: 0, confidence: 0 }
        });
      }
    }
    
    return formattedStocks;
  };

  const refreshStockData = async () => {
    try {
      const response = await axios.get(`${API_URL}/stocks`);
      const stockData = formatFirebaseStockData(response.data);
      setStocks(stockData);
      
      // If we have a portfolio, refresh portfolio data too
      if (user && portfolio) {
        const portfolioResponse = await axios.get(`${API_URL}/portfolio/${user.id}`);
        setPortfolio(portfolioResponse.data);
      }
    } catch (error) {
      console.error('Error refreshing stock data:', error);
      toast.error('Failed to refresh stock data');
    }
  };

  const buyStock = async (symbol: string, shares: number) => {
    if (!user) {
      toast.error('You must be logged in to buy stocks');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the API to buy stock
      const response = await axios.post(`${API_URL}/buy`, {
        userId: user.id,
        symbol,
        shares
      });
      
      // Update the user balance
      updateUserBalance(response.data.newBalance);
      
      // Update portfolio and transactions
      setPortfolio(response.data.updatedPortfolio);
      
      // Add new transaction to the transactions list
      setTransactions(prev => [...prev, response.data.updatedTransactions]);
      
      toast.success(`Successfully purchased ${shares} shares of ${symbol}`);
      
      // Refresh data
      await loadUserData();
    } catch (error) {
      console.error('Error buying stock:', error);
      toast.error(error.response?.data?.error || 'Failed to buy stock');
    } finally {
      setIsLoading(false);
    }
  };

  const sellStock = async (symbol: string, shares: number) => {
    if (!user || !portfolio) {
      toast.error('You must be logged in with a portfolio to sell stocks');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the API to sell stock
      const response = await axios.post(`${API_URL}/sell`, {
        userId: user.id,
        symbol,
        shares
      });
      
      // Update the user balance
      updateUserBalance(response.data.newBalance);
      
      // Update portfolio and transactions
      setPortfolio(response.data.updatedPortfolio);
      
      // Add new transaction to the transactions list
      setTransactions(prev => [...prev, response.data.updatedTransactions]);
      
      toast.success(`Successfully sold ${shares} shares of ${symbol}`);
      
      // Refresh data
      await loadUserData();
    } catch (error) {
      console.error('Error selling stock:', error);
      toast.error(error.response?.data?.error || 'Failed to sell stock');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StockContext.Provider
      value={{
        stocks,
        portfolio,
        transactions,
        isLoading,
        buyStock,
        sellStock,
        refreshStockData
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export default StockProvider;
