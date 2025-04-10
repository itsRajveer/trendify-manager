import { Stock, Portfolio, PortfolioStock } from "../types/stock";

export const updatePortfolioValues = (portfolio: Portfolio, currentStocks: Stock[]): Portfolio => {
  if (!portfolio) return portfolio;
  
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

export const calculateUpdatedPortfolioWithNewStock = (
  currentPortfolio: Portfolio | null,
  symbol: string,
  shares: number,
  price: number,
  userId: string
): Portfolio => {
  // If no portfolio exists, create a new one
  if (!currentPortfolio) {
    currentPortfolio = {
      id: '1',
      userId,
      stocks: [],
      totalValue: 0,
      profitLoss: 0
    };
  }
  
  const totalCost = price * shares;
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
      currentValue: parseFloat((price * newTotalShares).toFixed(2)),
      profitLoss: parseFloat(((price * newTotalShares) - newTotalCost).toFixed(2))
    };
  } else {
    // Add new stock to portfolio
    updatedPortfolioStocks.push({
      symbol,
      shares,
      price: price,
      avgPrice: price,
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
  
  return {
    ...currentPortfolio,
    stocks: updatedPortfolioStocks,
    totalValue: parseFloat(newTotalValue.toFixed(2)),
    profitLoss: parseFloat((newTotalValue - newTotalCost).toFixed(2))
  };
};

export const calculateUpdatedPortfolioAfterSell = (
  portfolio: Portfolio,
  symbol: string,
  shares: number,
  price: number
): Portfolio => {
  if (!portfolio) return portfolio;
  
  const portfolioStock = portfolio.stocks.find(s => s.symbol === symbol);
  if (!portfolioStock) return portfolio;
  
  let updatedPortfolioStocks = [...portfolio.stocks];
  
  if (portfolioStock.shares === shares) {
    // Remove stock completely
    updatedPortfolioStocks = updatedPortfolioStocks.filter(s => s.symbol !== symbol);
  } else {
    // Update shares count
    const newShares = portfolioStock.shares - shares;
    // Keep the same average price but reduce total cost proportionally
    const newTotalCost = portfolioStock.avgPrice * newShares;
    const stockIndex = updatedPortfolioStocks.findIndex(s => s.symbol === symbol);
    
    updatedPortfolioStocks[stockIndex] = {
      ...portfolioStock,
      shares: newShares,
      totalCost: parseFloat(newTotalCost.toFixed(2)),
      currentValue: parseFloat((price * newShares).toFixed(2)),
      profitLoss: parseFloat(((price * newShares) - newTotalCost).toFixed(2))
    };
  }
  
  const newTotalValue = updatedPortfolioStocks.reduce(
    (sum, s) => sum + s.currentValue, 0
  );
  const newTotalCost = updatedPortfolioStocks.reduce(
    (sum, s) => sum + s.totalCost, 0
  );
  
  return {
    ...portfolio,
    stocks: updatedPortfolioStocks,
    totalValue: parseFloat(newTotalValue.toFixed(2)),
    profitLoss: parseFloat((newTotalValue - newTotalCost).toFixed(2))
  };
};

export const updateStockPrices = (stocks: Stock[]): Stock[] => {
  return stocks.map(stock => {
    const changeAmount = (Math.random() - 0.45) * 2; // Slightly biased towards positive
    const newPrice = Math.max(stock.price + changeAmount, 0.01);
    return {
      ...stock,
      price: parseFloat(newPrice.toFixed(2)),
      change: parseFloat((newPrice - stock.price + stock.change).toFixed(2)),
      changePercent: parseFloat((((newPrice - stock.price) / stock.price) * 100 + stock.changePercent).toFixed(2))
    };
  });
};
