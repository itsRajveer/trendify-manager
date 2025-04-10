import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import StockContext from '@/contexts/StockContext';
import { Stock, Portfolio, Transaction, HistoricalDataResponse } from '@/types/stock';
import axios from 'axios';
import { getHistoricalData, processHistoricalDataForCharts } from '@/service/stockService';

const API_URL = 'http://localhost:5000/api';

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUserBalance } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<Record<string, { date: string; price: number }[]>>({});
  const [stockGainLoss, setStockGainLoss] = useState<Record<string, {
    change: string;
    percentChange: string;
    direction: 'gain' | 'loss' | 'no change';
  }>>({});

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
      const stockData = await formatFirebaseStockData(stocksResponse.data);
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
        const transactionsData = transactionsResponse.data;
        
        if (transactionsData) {
          const transactionsArray = Object.keys(transactionsData).map(key => ({
            ...transactionsData[key],
            firebaseId: key
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
  const formatFirebaseStockData = async (firebaseStocks: any): Promise<Stock[]> => {
    const formattedStocks: Stock[] = [];
    
    for (const symbol in firebaseStocks) {
      const stockData = firebaseStocks[symbol];
      
      if (stockData.latest) {
        const historicalData = stockData.history ? 
          Object.entries(stockData.history).map(([date, price]) => ({
            date,
            price: Number(price)
          })) : [];

        // Fetch predicted price from Flask API
        let prediction = { 
          price: 0, 
          confidence: 0,
          trend: 'neutral' as 'up' | 'down' | 'neutral',
          priceHistory: [] as number[],
          predictionHistory: [] as number[]
        };

        try {
          const predictionResponse = await axios.post('http://127.0.0.1:5000/predict', {
            symbol: symbol,
            future_days: 7
          });
          
          if (predictionResponse.data && predictionResponse.data.predicted_prices) {
            const currentPrice = stockData.latest.price || 0;
            const predictedPrices = predictionResponse.data.predicted_prices;
            const lastPredictedPrice = predictedPrices[predictedPrices.length - 1];
            
            // Calculate trend based on prediction movement
            const priceDiff = lastPredictedPrice - currentPrice;
            const trend = priceDiff > 0 ? 'up' : priceDiff < 0 ? 'down' : 'neutral';
            
            // Calculate confidence based on multiple factors
            const priceChangePercent = Math.abs(priceDiff / currentPrice);
            const predictionStability = calculatePredictionStability(predictedPrices);
            const historicalConsistency = calculateHistoricalConsistency(historicalData, predictedPrices);
            
            // Combine factors for final confidence score
            const confidence = Math.min(
              (priceChangePercent * 0.4 + predictionStability * 0.3 + historicalConsistency * 0.3) * 2,
              1
            );
            
            prediction = {
              price: lastPredictedPrice,
              confidence: confidence,
              trend: trend,
              priceHistory: historicalData.map(d => d.price),
              predictionHistory: predictedPrices
            };
          }
        } catch (error) {
          console.error(`Error fetching prediction for ${symbol}:`, error);
          // Set default prediction values if API call fails
          prediction = {
            price: stockData.latest.price || 0,
            confidence: 0.5,
            trend: 'neutral',
            priceHistory: historicalData.map(d => d.price),
            predictionHistory: []
          };
        }
          
        formattedStocks.push({
          symbol,
          name: stockData.name || symbol,
          price: stockData.latest.price || 0,
          change: stockData.latest.change || 0,
          changePercent: stockData.latest.changePercent || 0,
          marketCap: stockData.marketCap || 0,
          historicalData,
          prediction
        });
      }
    }
    
    return formattedStocks;
  };

  // Helper function to calculate prediction stability
  const calculatePredictionStability = (predictedPrices: number[]): number => {
    if (predictedPrices.length < 2) return 0.5;
    
    // Calculate the standard deviation of price changes
    const changes = [];
    for (let i = 1; i < predictedPrices.length; i++) {
      changes.push(Math.abs(predictedPrices[i] - predictedPrices[i-1]));
    }
    
    const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
    const variance = changes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / changes.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to a 0-1 score (lower stdDev = higher stability)
    return Math.max(0, 1 - (stdDev / mean));
  };

  // Helper function to calculate historical consistency
  const calculateHistoricalConsistency = (
    historicalData: { date: string; price: number }[],
    predictedPrices: number[]
  ): number => {
    if (historicalData.length < 2 || predictedPrices.length < 2) return 0.5;
    
    // Calculate historical volatility
    const historicalChanges = [];
    for (let i = 1; i < historicalData.length; i++) {
      historicalChanges.push(Math.abs(historicalData[i].price - historicalData[i-1].price));
    }
    
    const historicalMean = historicalChanges.reduce((a, b) => a + b, 0) / historicalChanges.length;
    
    // Calculate predicted volatility
    const predictedChanges = [];
    for (let i = 1; i < predictedPrices.length; i++) {
      predictedChanges.push(Math.abs(predictedPrices[i] - predictedPrices[i-1]));
    }
    
    const predictedMean = predictedChanges.reduce((a, b) => a + b, 0) / predictedChanges.length;
    
    // Compare the two volatilities
    const volatilityRatio = Math.min(historicalMean, predictedMean) / Math.max(historicalMean, predictedMean);
    return volatilityRatio;
  };

  const refreshStockData = async () => {
    try {
      const response = await axios.get(`${API_URL}/stocks`);
      const stockData = await formatFirebaseStockData(response.data);
      setStocks(stockData);
      
      if (user && portfolio) {
        const portfolioResponse = await axios.get(`${API_URL}/portfolio/${user.id}`);
        setPortfolio(portfolioResponse.data);
      }
    } catch (error) {
      console.error('Error refreshing stock data:', error);
      toast.error('Failed to refresh stock data');
    }
  };

  const fetchHistoricalData = async (timeRange: string) => {
    try {
      const data = await getHistoricalData(timeRange as any);
      
      if (data.history) {
        const processedData: Record<string, { date: string; price: number }[]> = {};
        
        // Process historical data for each stock
        stocks.forEach(stock => {
          processedData[stock.symbol] = processHistoricalDataForCharts(data, stock.symbol);
        });
        
        setHistoricalData(processedData);
      }
      
      if (data.gainLoss) {
        const gainLossInfo: Record<string, {
          change: string;
          percentChange: string;
          direction: 'gain' | 'loss' | 'no change';
        }> = {};

        Object.entries(data.gainLoss).forEach(([symbol, info]) => {
          gainLossInfo[symbol] = {
            change: info.change,
            percentChange: info.percentChange,
            direction: info.direction
          };
        });

        setStockGainLoss(gainLossInfo);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast.error('Failed to fetch historical data');
    }
  };

  const buyStock = async (symbol: string, shares: number) => {
    if (!user) {
      toast.error('You must be logged in to buy stocks');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get the stock price first
      const stock = stocks.find(s => s.symbol === symbol);
      if (!stock) {
        throw new Error('Stock not found');
      }
      
      const totalCost = stock.price * shares;
      if (user.balance < totalCost) {
        throw new Error('Insufficient funds');
      }
      
      // Call the API to buy stock
      const response = await axios.post(`${API_URL}/buy`, {
        userId: user.id,
        symbol,
        shares
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to buy stock');
      }
      
      // Update the user balance
      const newBalance = user.balance - totalCost;
      updateUserBalance(newBalance);
      
      // Add new transaction to the transactions list
      setTransactions(prev => [...prev, response.data.transaction]);
      
      toast.success(response.data.message || `Successfully purchased ${shares} shares of ${symbol}`);
      
      // Refresh data
      await loadUserData();
    } catch (error) {
      console.error('Error buying stock:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to buy stock');
      throw error; // Re-throw to let the dialog handle the error
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
        historicalData,
        stockGainLoss,
        buyStock,
        sellStock,
        refreshStockData,
        fetchHistoricalData
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export default StockProvider;
