
import { useAuth } from "@/contexts/AuthContext";
import { useStock, Stock } from "@/contexts/StockContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StockChart from "@/components/StockChart";
import StockCard from "@/components/StockCard";
import BuyStockDialog from "@/components/BuyStockDialog";
import { BarChart2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardProvider } from "@/contexts/DashboardContext";
import GlobalTimeRangeSelector from "@/components/GlobalTimeRangeSelector";
import { useDashboard } from "@/contexts/DashboardContext";
import { getHistoricalData } from "@/services/stockService";

const Dashboard = () => {
  const { user } = useAuth();
  const { stocks, portfolio, refreshStockData } = useStock();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [stockGainLoss, setStockGainLoss] = useState<Record<string, {
    change: string;
    percentChange: string;
    direction: 'gain' | 'loss' | 'no change';
  }>>({});
  
  const { globalTimeRange } = useDashboard();

  useEffect(() => {
    // Refresh stock data when dashboard loads
    refreshStockData();
    
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(() => {
      refreshStockData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshStockData]);

  useEffect(() => {
    const fetchGainLossData = async () => {
      try {
        const data = await getHistoricalData(globalTimeRange);
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
        console.error("Failed to fetch gain/loss data:", error);
      }
    };

    fetchGainLossData();
  }, [globalTimeRange]);

  const openBuyDialog = (stock: Stock) => {
    setSelectedStock(stock);
    setBuyDialogOpen(true);
  };

  // Find best and worst performing stocks based on gainLoss data when available
  const findBestAndWorstStocks = () => {
    // Use gainLoss data if available
    if (Object.keys(stockGainLoss).length > 0 && stocks.length > 0) {
      const stocksWithGainLoss = stocks.filter(stock => stockGainLoss[stock.symbol]);
      
      if (stocksWithGainLoss.length === 0) return { bestStock: null, worstStock: null };
      
      const sortedStocks = [...stocksWithGainLoss].sort((a, b) => {
        const aPercent = parseFloat(stockGainLoss[a.symbol]?.percentChange || "0");
        const bPercent = parseFloat(stockGainLoss[b.symbol]?.percentChange || "0");
        return bPercent - aPercent;
      });
      
      return {
        bestStock: sortedStocks[0],
        worstStock: sortedStocks[sortedStocks.length - 1]
      };
    }
    
    // Fallback to stock.changePercent
    if (stocks.length === 0) {
      return { bestStock: null, worstStock: null };
    }
    
    const sortedByPerformance = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    return {
      bestStock: sortedByPerformance[0],
      worstStock: sortedByPerformance[sortedByPerformance.length - 1]
    };
  };
  
  const { bestStock, worstStock } = findBestAndWorstStocks();

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

      {/* Global Time Range Selector */}
      <GlobalTimeRangeSelector />

      {/* Market Overview */}
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <BarChart2 className="h-5 w-5 mr-2" />
        Market Overview
      </h2>
      
      {/* Best and Worst Performing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {bestStock && bestStock !== worstStock && (
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
                  {stockGainLoss[bestStock.symbol] ? 
                    `${stockGainLoss[bestStock.symbol].change >= "0" ? "+" : ""}${stockGainLoss[bestStock.symbol].change} (${stockGainLoss[bestStock.symbol].percentChange}%)` : 
                    `+${bestStock.change.toFixed(2)} (${bestStock.changePercent.toFixed(2)}%)`}
                </div>
              </div>
              <div className="h-40">
                <StockChart 
                  stock={bestStock} 
                  height={160} 
                  gainLossInfo={stockGainLoss[bestStock.symbol]}
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {worstStock && bestStock !== worstStock && (
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
                  {stockGainLoss[worstStock.symbol] ?
                    `${stockGainLoss[worstStock.symbol].change} (${stockGainLoss[worstStock.symbol].percentChange}%)` :
                    `${worstStock.change.toFixed(2)} (${worstStock.changePercent.toFixed(2)}%)`}
                </div>
              </div>
              <div className="h-40">
                <StockChart 
                  stock={worstStock} 
                  height={160} 
                  gainLossInfo={stockGainLoss[worstStock.symbol]}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {bestStock && bestStock === worstStock && (
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" />
                <div>
                  <CardDescription>Stock Performance</CardDescription>
                  <CardTitle>{bestStock.symbol} · {bestStock.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold">${bestStock.price.toFixed(2)}</div>
                <div className={bestStock.change >= 0 ? "text-success" : "text-danger"}>
                  {stockGainLoss[bestStock.symbol] ? 
                    `${stockGainLoss[bestStock.symbol].change >= "0" ? "+" : ""}${stockGainLoss[bestStock.symbol].change} (${stockGainLoss[bestStock.symbol].percentChange}%)` : 
                    `${bestStock.change >= 0 ? "+" : ""}${bestStock.change.toFixed(2)} (${bestStock.changePercent.toFixed(2)}%)`}
                </div>
              </div>
              <div className="h-40">
                <StockChart 
                  stock={bestStock} 
                  height={160} 
                  gainLossInfo={stockGainLoss[bestStock.symbol]}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {!bestStock && !worstStock && (
          <Card className="md:col-span-2">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No stock performance data available</p>
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
            gainLossInfo={stockGainLoss[stock.symbol]}
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

const DashboardWithProvider = () => (
  <DashboardProvider>
    <Dashboard />
  </DashboardProvider>
);

export default DashboardWithProvider;
