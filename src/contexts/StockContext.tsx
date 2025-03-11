import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Types
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  historicalData: { date: string; price: number }[];
  prediction: { price: number; confidence: number };
}

export interface Portfolio {
  id: string;
  userId: string;
  stocks: PortfolioStock[];
  totalValue: number;
  profitLoss: number;
}

export interface PortfolioStock {
  symbol: string;
  shares: number;
  avgPrice: number;
  totalCost: number;
  currentValue: number;
  profitLoss: number;
}

export interface Transaction {
  id: string;
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
  date: string;
}

interface StockContextType {
  stocks: Stock[];
  portfolio: Portfolio | null;
  transactions: Transaction[];
  isLoading: boolean;
  buyStock: (symbol: string, shares: number) => Promise<void>;
  sellStock: (symbol: string, shares: number) => Promise<void>;
  refreshStockData: () => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

// Mock data for demo
const mockStocks: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.50,
    change: 2.35,
    changePercent: 1.36,
    marketCap: 2800000000000,
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 160 + Math.random() * 20
    })),
    prediction: { price: 185.20, confidence: 0.75 }
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 360.20,
    change: -1.50,
    changePercent: -0.41,
    marketCap: 2600000000000,
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 350 + Math.random() * 15
    })),
    prediction: { price: 370.80, confidence: 0.65 }
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 145.10,
    change: 0.80,
    changePercent: 0.55,
    marketCap: 1900000000000,
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 140 + Math.random() * 10
    })),
    prediction: { price: 148.30, confidence: 0.60 }
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 132.80,
    change: 1.25,
    changePercent: 0.95,
    marketCap: 1400000000000,
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 125 + Math.random() * 15
    })),
    prediction: { price: 140.50, confidence: 0.72 }
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 248.50,
    change: -3.20,
    changePercent: -1.27,
    marketCap: 780000000000,
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 240 + Math.random() * 20
    })),
    prediction: { price: 260.10, confidence: 0.55 }
  }
];

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
      const updatedStocks = stocks.map(stock => {
        const changeAmount = (Math.random() - 0.45) * 2; // Slightly biased towards positive
        const newPrice = Math.max(stock.price + changeAmount, 0.01);
        return {
          ...stock,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat((newPrice - stock.price + stock.change).toFixed(2)),
          changePercent: parseFloat((((newPrice - stock.price) / stock.price) * 100 + stock.changePercent).toFixed(2))
        };
      });
      
      setStocks(updatedStocks);
      
      // Update portfolio values based on new prices
      if (portfolio) {
        updatePortfolioValues(updatedStocks);
      }
    } catch (error) {
      console.error('Error refreshing stock data:', error);
    }
  };

  const updatePortfolioValues = (currentStocks: Stock[]) => {
    if (!portfolio) return;
    
    const updatedStocks = portfolio.stocks.map(portfolioStock => {
      const stockData = currentStocks.find(s => s.symbol === portfolioStock.symbol);
      if (!stockData) return portfolioStock;
      
      const currentValue = portfolioStock.shares * stockData.price;
      const profitLoss = currentValue - portfolioStock.totalCost;
      
      return {
        ...portfolioStock,
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2))
      };
    });
    
    const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.currentValue, 0);
    const totalCost = updatedStocks.reduce((sum, stock) => sum + stock.totalCost, 0);
    const profitLoss = totalValue - totalCost;
    
    const updatedPortfolio: Portfolio = {
      ...portfolio,
      stocks: updatedStocks,
      totalValue: parseFloat(totalValue.toFixed(2)),
      profitLoss: parseFloat(profitLoss.toFixed(2))
    };
    
    setPortfolio(updatedPortfolio);
    localStorage.setItem(`portfolio_${user?.id}`, JSON.stringify(updatedPortfolio));
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
      
      // Update user balance (in a real app, this would be an API call)
      const updatedUser = {
        ...user,
        balance: parseFloat((user.balance - totalCost).toFixed(2))
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
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
        // Update existing stock
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
        // Add new stock to portfolio
        updatedPortfolioStocks.push({
          symbol,
          shares,
          avgPrice: stock.price,
          totalCost: parseFloat(totalCost.toFixed(2)),
          currentValue: parseFloat(totalCost.toFixed(2)),
          profitLoss: 0
        });
      }
      
      const newTotalValue = updatedPortfolioStocks.reduce(
        (sum, s) => sum + s.currentValue, 0
      );
      const newTotalCost = updatedPortfolioStocks.reduce(
        (sum, s) => sum + s.totalCost, 0
      );
      
      const updatedPortfolio: Portfolio = {
        ...currentPortfolio,
        stocks: updatedPortfolioStocks,
        totalValue: parseFloat(newTotalValue.toFixed(2)),
        profitLoss: parseFloat((newTotalValue - newTotalCost).toFixed(2))
      };
      
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
      
      // Update user balance
      const updatedUser = {
        ...user,
        balance: parseFloat((user.balance + saleValue).toFixed(2))
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
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
      let updatedPortfolioStocks = [...portfolio.stocks];
      const stockIndex = updatedPortfolioStocks.findIndex(s => s.symbol === symbol);
      
      if (portfolioStock.shares === shares) {
        // Remove stock completely
        updatedPortfolioStocks = updatedPortfolioStocks.filter(s => s.symbol !== symbol);
      } else {
        // Update shares count
        const newShares = portfolioStock.shares - shares;
        // Keep the same average price but reduce total cost proportionally
        const newTotalCost = portfolioStock.avgPrice * newShares;
        
        updatedPortfolioStocks[stockIndex] = {
          ...portfolioStock,
          shares: newShares,
          totalCost: parseFloat(newTotalCost.toFixed(2)),
          currentValue: parseFloat((stock.price * newShares).toFixed(2)),
          profitLoss: parseFloat(((stock.price * newShares) - newTotalCost).toFixed(2))
        };
      }
      
      const newTotalValue = updatedPortfolioStocks.reduce(
        (sum, s) => sum + s.currentValue, 0
      );
      const newTotalCost = updatedPortfolioStocks.reduce(
        (sum, s) => sum + s.totalCost, 0
      );
      
      const updatedPortfolio: Portfolio = {
        ...portfolio,
        stocks: updatedPortfolioStocks,
        totalValue: parseFloat(newTotalValue.toFixed(2)),
        profitLoss: parseFloat((newTotalValue - newTotalCost).toFixed(2))
      };
      
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

export const useStock = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
