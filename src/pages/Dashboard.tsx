
import { useAuth } from "@/contexts/AuthContext";
import { useStock, Stock } from "@/contexts/StockContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StockChart from "@/components/StockChart";
import StockCard from "@/components/StockCard";
import BuyStockDialog from "@/components/BuyStockDialog";
import { BarChart2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user } = useAuth();
  const { stocks, portfolio, refreshStockData } = useStock();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);

  useEffect(() => {
    // Refresh stock data when dashboard loads
    refreshStockData();
    
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(() => {
      refreshStockData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshStockData]);

  const openBuyDialog = (stock: Stock) => {
    setSelectedStock(stock);
    setBuyDialogOpen(true);
  };

  // Find best and worst performing stocks
  const bestStock = stocks.length > 0 ? 
    [...stocks].sort((a, b) => b.changePercent - a.changePercent)[0] : null;
  const worstStock = stocks.length > 0 ? 
    [...stocks].sort((a, b) => a.changePercent - b.changePercent)[0] : null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </div>
        <Button variant="outline" onClick={() => refreshStockData()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Balance</CardDescription>
            <CardTitle className="text-2xl">
              ${user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Portfolio Value</CardDescription>
            <CardTitle className="text-2xl">
              ${portfolio?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Profit/Loss</CardDescription>
            <CardTitle className={`text-2xl ${portfolio?.profitLoss && portfolio.profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
              {portfolio?.profitLoss 
                ? `${portfolio.profitLoss >= 0 ? '+' : ''}$${portfolio.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "$0.00"
              }
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Market Overview */}
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <BarChart2 className="h-5 w-5 mr-2" />
        Market Overview
      </h2>
      
      {/* Best and Worst Performing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {bestStock && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-success" />
                <div>
                  <CardDescription>Best Performer</CardDescription>
                  <CardTitle>{bestStock.symbol} · {bestStock.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold">${bestStock.price.toFixed(2)}</div>
                <div className="text-success">
                  +{bestStock.change.toFixed(2)} ({bestStock.changePercent.toFixed(2)}%)
                </div>
              </div>
              <div className="h-40">
                <StockChart stock={bestStock} height={160} />
              </div>
            </CardContent>
          </Card>
        )}
        
        {worstStock && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-danger" />
                <div>
                  <CardDescription>Worst Performer</CardDescription>
                  <CardTitle>{worstStock.symbol} · {worstStock.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold">${worstStock.price.toFixed(2)}</div>
                <div className="text-danger">
                  {worstStock.change.toFixed(2)} ({worstStock.changePercent.toFixed(2)}%)
                </div>
              </div>
              <div className="h-40">
                <StockChart stock={worstStock} height={160} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stock Listings */}
      <h2 className="text-xl font-semibold mb-4">Trending Stocks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((stock) => (
          <StockCard 
            key={stock.symbol} 
            stock={stock} 
            onClick={() => openBuyDialog(stock)}
          />
        ))}
      </div>

      {/* Buy Stock Dialog */}
      <BuyStockDialog
        stock={selectedStock}
        isOpen={buyDialogOpen}
        onClose={() => setBuyDialogOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
