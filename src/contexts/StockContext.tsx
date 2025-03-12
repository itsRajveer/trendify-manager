
import { createContext, useContext } from 'react';
import { Stock, Portfolio, Transaction, StockContextType } from '@/types/stock';

// Create the StockContext with a default value
const StockContext = createContext<StockContextType>({
  stocks: [],
  portfolio: null,
  transactions: [],
  isLoading: false,
  buyStock: async () => {},
  sellStock: async () => {},
  refreshStockData: async () => {},
});

// Export the useStock hook for component access
export const useStock = () => useContext(StockContext);

// Re-export types from types file for backward compatibility
export type { Stock, Portfolio, Transaction, StockContextType };

export default StockContext;
