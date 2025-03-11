
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { StockContext } from '@/contexts/StockContext';
import { mockStocks } from '@/data/mockStocks';
import { calculateUpdatedPortfolioValues, updateStockPrices } from '@/utils/stockUtils';
import type { Stock, Portfolio, Transaction } from '@/types/stock';

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const savedPortfolio = localStorage.getItem(`portfolio_${user?.id}`);
      const savedTransactions = localStorage.getItem(`transactions_${user?.id}`);
      
      if (savedPortfolio) {
        setPortfolio(JSON.parse(savedPortfolio));
      } else {
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
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedStocks = updateStockPrices(stocks);
      setStocks(updatedStocks);
      
      if (portfolio) {
        const updatedPortfolio = calculateUpdatedPortfolioValues(portfolio, updatedStocks);
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
      
      if (user.balance < totalCost) {
        throw new Error('Insufficient funds');
      }
      
      const updatedUser = {
        ...user,
        balance: parseFloat((user.balance - totalCost).toFixed(2))
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
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
      
      const currentPortfolio = portfolio || {
        id: '1',
        userId: user.id,
        stocks: [],
        totalValue: 0,
        profitLoss: 0
      };
      
      let updatedPortfolioStocks = [...currentPortfolio.stocks];
      const existingStockIndex = updatedPortfolioStocks.findIndex(s => s.symbol === symbol);
      
      if (existingStockIndex >= 0) {
        const existingStock = updatedPortfolioStocks[existingStockIndex];
        const newTotalShares = existingStock.shares + shares;
        const newTotalCost = existingStock.totalCost + totalCost;
        const newAvgPrice = newTotalCost / newTotalShares;
        
        updatedPortfolioStocks[existingStockIndex] = {
          ...existingStock,
          shares: newTotalShares,
          avgPrice: parseFloat(newAvgPrice.toFixed(2)),
          totalCost: parseFloat(newTotalCost.toFixed(2)),
          currentValue: parseFloat((stock.price * newTotalShares).toFixed(2)),
          profitLoss: parseFloat(((stock.price * newTotalShares) - newTotalCost).toFixed(2))
        };
      } else {
        updatedPortfolioStocks.push({
          symbol,
          shares,
          avgPrice: stock.price,
          totalCost: parseFloat(totalCost.toFixed(2)),
          currentValue: parseFloat(totalCost.toFixed(2)),
          profitLoss: 0
        });
      }
      
      const updatedPortfolio = calculateUpdatedPortfolioValues(
        { ...currentPortfolio, stocks: updatedPortfolioStocks },
        stocks
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
      
      const updatedUser = {
        ...user,
        balance: parseFloat((user.balance + saleValue).toFixed(2))
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
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
      
      let updatedPortfolioStocks = [...portfolio.stocks];
      
      if (portfolioStock.shares === shares) {
        updatedPortfolioStocks = updatedPortfolioStocks.filter(s => s.symbol !== symbol);
      } else {
        const stockIndex = updatedPortfolioStocks.findIndex(s => s.symbol === symbol);
        const newShares = portfolioStock.shares - shares;
        const newTotalCost = portfolioStock.avgPrice * newShares;
        
        updatedPortfolioStocks[stockIndex] = {
          ...portfolioStock,
          shares: newShares,
          totalCost: parseFloat(newTotalCost.toFixed(2)),
          currentValue: parseFloat((stock.price * newShares).toFixed(2)),
          profitLoss: parseFloat(((stock.price * newShares) - newTotalCost).toFixed(2))
        };
      }
      
      const updatedPortfolio = calculateUpdatedPortfolioValues(
        { ...portfolio, stocks: updatedPortfolioStocks },
        stocks
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
