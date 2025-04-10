import { createContext, useContext } from 'react';
import { Stock, Portfolio, Transaction } from '@/types/stock';

export interface StockContextType {
  stocks: Stock[];
  portfolio: Portfolio | null;
  transactions: Transaction[];
  isLoading: boolean;
  historicalData: Record<string, { date: string; price: number }[]>;
  stockGainLoss: Record<string, {
    change: string;
    percentChange: string;
    direction: 'gain' | 'loss' | 'no change';
  }>;
  buyStock: (symbol: string, shares: number) => Promise<void>;
  sellStock: (symbol: string, shares: number) => Promise<void>;
  refreshStockData: () => Promise<void>;
  fetchHistoricalData: (timeRange: string) => Promise<void>;
}

// Create the StockContext with a default value
const StockContext = createContext<StockContextType | undefined>(undefined);

// Export the useStock hook for component access
export const useStock = () => useContext(StockContext);

// Re-export types from types file for backward compatibility
export type { Stock, Portfolio, Transaction };

export default StockContext;
