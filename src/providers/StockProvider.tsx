
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import StockContext from '@/contexts/StockContext';
import { mockStocks } from '@/data/mockStocks';
import { Stock, Portfolio, Transaction } from '@/types/stock';
import { 
  updatePortfolioValues, 
  updateStockPrices,
  calculateUpdatedPortfolioWithNewStock,
  calculateUpdatedPortfolioAfterSell
} from '@/utils/stockUtils';

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUserBalance } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>(mockStocks);
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
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load from localStorage if available (for demo)
      const savedPortfolio = localStorage.getItem(`portfolio_${user?.id}`);
      const savedTransactions = localStorage.getItem(`transactions_${user?.id}`);
      
      if (savedPortfolio) {
        setPortfolio(JSON.parse(savedPortfolio));
      } else {
        // Create empty portfolio
        setPortfolio({
          id: '1',
          userId: user?.id || '',
          stocks: [],
          totalValue: 0,
          profitLoss: 0
        });
      }
      
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else {
        setTransactions([]);
      }
      
      // Refresh stock data
      refreshStockData();
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStockData = async () => {
    try {
      // Simulate API call for updated stock prices
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update with slight variations to simulate real-time changes
      const updatedStocks = updateStockPrices(stocks);
      setStocks(updatedStocks);
      
      // Update portfolio values based on new prices
      if (portfolio) {
        const updatedPortfolio = updatePortfolioValues(portfolio, updatedStocks);
        setPortfolio(updatedPortfolio);
        localStorage.setItem(`portfolio_${user?.id}`, JSON.stringify(updatedPortfolio));
      }
    } catch (error) {
      console.error('Error refreshing stock data:', error);
    }
  };

  const buyStock = async (symbol: string, shares: number) => {
    if (!user) {
      toast.error('You must be logged in to buy stocks');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const stock = stocks.find(s => s.symbol === symbol);
      if (!stock) {
        throw new Error('Stock not found');
      }
      
      const totalCost = stock.price * shares;
      
      // Check if user has enough balance
      if (user.balance < totalCost) {
        throw new Error('Insufficient funds');
      }
      
      // Update user balance
      const newBalance = user.balance - totalCost;
      updateUserBalance(newBalance);
      
      // Create transaction
      const transaction: Transaction = {
        id: Date.now().toString(),
        userId: user.id,
        symbol,
        type: 'buy',
        shares,
        price: stock.price,
        total: parseFloat(totalCost.toFixed(2)),
        date: new Date().toISOString()
      };
      
      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
      
      // Update portfolio
      const updatedPortfolio = calculateUpdatedPortfolioWithNewStock(
        portfolio,
        symbol,
        shares,
        stock.price,
        user.id
      );
      
      setPortfolio(updatedPortfolio);
      localStorage.setItem(`portfolio_${user.id}`, JSON.stringify(updatedPortfolio));
      
      toast.success(`Successfully purchased ${shares} shares of ${symbol}`);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to buy stock');
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
      
      const stock = stocks.find(s => s.symbol === symbol);
      if (!stock) {
        throw new Error('Stock not found');
      }
      
      const portfolioStock = portfolio.stocks.find(s => s.symbol === symbol);
      if (!portfolioStock) {
        throw new Error('You don\'t own this stock');
      }
      
      if (portfolioStock.shares < shares) {
        throw new Error('You don\'t have enough shares to sell');
      }
      
      const saleValue = stock.price * shares;
      
      // Update user balance immediately in UI
      const newBalance = user.balance + saleValue;
      updateUserBalance(newBalance);
      
      // Create transaction
      const transaction: Transaction = {
        id: Date.now().toString(),
        userId: user.id,
        symbol,
        type: 'sell',
        shares,
        price: stock.price,
        total: parseFloat(saleValue.toFixed(2)),
        date: new Date().toISOString()
      };
      
      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
      
      // Update portfolio
      const updatedPortfolio = calculateUpdatedPortfolioAfterSell(
        portfolio,
        symbol,
        shares,
        stock.price
      );
      
      setPortfolio(updatedPortfolio);
      localStorage.setItem(`portfolio_${user.id}`, JSON.stringify(updatedPortfolio));
      
      toast.success(`Successfully sold ${shares} shares of ${symbol}`);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to sell stock');
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
