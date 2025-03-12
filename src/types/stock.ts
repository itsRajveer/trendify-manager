
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

export interface StockContextType {
  stocks: Stock[];
  portfolio: Portfolio | null;
  transactions: Transaction[];
  isLoading: boolean;
  buyStock: (symbol: string, shares: number) => Promise<void>;
  sellStock: (symbol: string, shares: number) => Promise<void>;
  refreshStockData: () => Promise<void>;
}
