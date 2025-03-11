
import { Portfolio, PortfolioStock, Stock } from '@/types/stock';

export const calculateUpdatedPortfolioValues = (
  portfolio: Portfolio,
  currentStocks: Stock[]
): Portfolio => {
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
  
  return {
    ...portfolio,
    stocks: updatedStocks,
    totalValue: parseFloat(totalValue.toFixed(2)),
    profitLoss: parseFloat(profitLoss.toFixed(2))
  };
};

export const updateStockPrices = (stocks: Stock[]): Stock[] => {
  return stocks.map(stock => {
    const changeAmount = (Math.random() - 0.45) * 2;
    const newPrice = Math.max(stock.price + changeAmount, 0.01);
    return {
      ...stock,
      price: parseFloat(newPrice.toFixed(2)),
      change: parseFloat((newPrice - stock.price + stock.change).toFixed(2)),
      changePercent: parseFloat((((newPrice - stock.price) / stock.price) * 100 + stock.changePercent).toFixed(2))
    };
  });
};
