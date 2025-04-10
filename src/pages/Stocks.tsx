import { useState, useEffect } from "react";
import { useStock, Stock } from "@/contexts/StockContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart2, Search, Info } from "lucide-react";
import BuyStockDialog from "@/components/BuyStockDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StockHistoryChart from "@/components/StockHistoryChart";
import { DashboardProvider } from "@/contexts/DashboardContext";
import GlobalTimeRangeSelector from "@/components/GlobalTimeRangeSelector";
import { getHistoricalData } from "@/service/stockService";
import { cn } from "@/lib/utils";

const Stocks = () => {
  const { stocks, isLoading, stockGainLoss } = useStock();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Set first stock as selected when stocks load
  useEffect(() => {
    if (stocks.length > 0 && !selectedStock) {
      setSelectedStock(stocks[0]);
    }
  }, [stocks, selectedStock]);

  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock);
  };

  const openBuyDialog = (stock: Stock) => {
    setSelectedStock(stock);
    setBuyDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" />
          Stock Market
        </h1>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Global Time Range Selector */}
      <GlobalTimeRangeSelector />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Stock Listings</CardTitle>
              <CardDescription>
                Select a stock to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
                  <TabsTrigger value="losers">Top Losers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Symbol</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStocks.map((stock) => (
                          <TableRow 
                            key={stock.symbol}
                            className={selectedStock?.symbol === stock.symbol ? "bg-muted cursor-pointer" : "cursor-pointer"}
                            onClick={() => handleSelectStock(stock)}
                          >
                            <TableCell className="font-medium">{stock.symbol}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span>${stock.price.toFixed(2)}</span>
                                <span 
                                  className={`text-xs ${stockGainLoss[stock.symbol]?.direction === 'gain' ? "text-success" : "text-danger"}`}
                                >
                                  {stockGainLoss[stock.symbol] ? 
                                    `${stockGainLoss[stock.symbol].change >= "0" ? "+" : ""}${stockGainLoss[stock.symbol].change} (${stockGainLoss[stock.symbol].percentChange}%)` : 
                                    `${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)} (${stock.changePercent.toFixed(2)}%)`}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="gainers">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Symbol</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...filteredStocks]
                          .sort((a, b) => {
                            const aChange = stockGainLoss[a.symbol]?.percentChange ? 
                              parseFloat(stockGainLoss[a.symbol].percentChange) : a.changePercent;
                            const bChange = stockGainLoss[b.symbol]?.percentChange ? 
                              parseFloat(stockGainLoss[b.symbol].percentChange) : b.changePercent;
                            return bChange - aChange;
                          })
                          .slice(0, 5)
                          .map((stock) => (
                            <TableRow 
                              key={stock.symbol}
                              className={selectedStock?.symbol === stock.symbol ? "bg-muted cursor-pointer" : "cursor-pointer"}
                              onClick={() => handleSelectStock(stock)}
                            >
                              <TableCell className="font-medium">{stock.symbol}</TableCell>
                              <TableCell className="text-right text-success">
                                {stockGainLoss[stock.symbol] ? 
                                  `+${stockGainLoss[stock.symbol].change} (${stockGainLoss[stock.symbol].percentChange}%)` :
                                  `+${stock.changePercent.toFixed(2)}%`}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="losers">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Symbol</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...filteredStocks]
                          .sort((a, b) => {
                            const aChange = stockGainLoss[a.symbol]?.percentChange ? 
                              parseFloat(stockGainLoss[a.symbol].percentChange) : a.changePercent;
                            const bChange = stockGainLoss[b.symbol]?.percentChange ? 
                              parseFloat(stockGainLoss[b.symbol].percentChange) : b.changePercent;
                            return aChange - bChange;
                          })
                          .slice(0, 5)
                          .map((stock) => (
                            <TableRow 
                              key={stock.symbol}
                              className={selectedStock?.symbol === stock.symbol ? "bg-muted cursor-pointer" : "cursor-pointer"}
                              onClick={() => handleSelectStock(stock)}
                            >
                              <TableCell className="font-medium">{stock.symbol}</TableCell>
                              <TableCell className="text-right text-danger">
                                {stockGainLoss[stock.symbol] ? 
                                  `${stockGainLoss[stock.symbol].change} (${stockGainLoss[stock.symbol].percentChange}%)` :
                                  `${stock.changePercent.toFixed(2)}%`}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {selectedStock ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedStock.symbol}</CardTitle>
                    <CardDescription>{selectedStock.name}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${selectedStock.price.toFixed(2)}</div>
                    <div className={stockGainLoss[selectedStock.symbol]?.direction === 'gain' ? "text-success" : "text-danger"}>
                      {stockGainLoss[selectedStock.symbol] ? 
                        `${stockGainLoss[selectedStock.symbol].change >= "0" ? "+" : ""}${stockGainLoss[selectedStock.symbol].change} (${stockGainLoss[selectedStock.symbol].percentChange}%)` : 
                        `${selectedStock.change >= 0 ? "+" : ""}${selectedStock.change.toFixed(2)} (${selectedStock.changePercent.toFixed(2)}%)`}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <StockHistoryChart symbol={selectedStock.symbol} name={selectedStock.name} useGlobalTimeRange={true} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                  <div>
                    {/* <h3 className="text-sm font-medium mb-2">Market Cap</h3>
                    <p>${(selectedStock.marketCap / 1000000000).toFixed(2)}B</p> */}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      Price Prediction (7 Days)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Predicted price based on historical data and market trends using machine learning</p>
                            <p className="text-xs mt-1">Confidence score considers price stability and historical patterns</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold">
                          ${selectedStock.prediction.price.toFixed(2)}
                        </p>
                        <div className={cn(
                          "text-sm px-2 py-1 rounded",
                          selectedStock.prediction.trend === 'up' ? "bg-success/10 text-success" :
                          selectedStock.prediction.trend === 'down' ? "bg-danger/10 text-danger" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {selectedStock.prediction.trend === 'up' ? '↑ Upward' :
                           selectedStock.prediction.trend === 'down' ? '↓ Downward' :
                           '→ Neutral'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className={cn(
                          "text-sm",
                          selectedStock.prediction.price > selectedStock.price ? "text-success" : "text-danger"
                        )}>
                          {selectedStock.prediction.price > selectedStock.price ? "+" : ""}
                          {((selectedStock.prediction.price - selectedStock.price) / selectedStock.price * 100).toFixed(2)}%
                          from current price
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">
                            Confidence: {(selectedStock.prediction.confidence * 100).toFixed(0)}%
                          </div>
                          <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full",
                                selectedStock.prediction.confidence > 0.7 ? "bg-success" :
                                selectedStock.prediction.confidence > 0.4 ? "bg-warning" :
                                "bg-danger"
                              )}
                              style={{ width: `${selectedStock.prediction.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button onClick={() => openBuyDialog(selectedStock)}>
                    Buy {selectedStock.symbol}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Select a stock to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BuyStockDialog
        stock={selectedStock}
        isOpen={buyDialogOpen}
        onClose={() => setBuyDialogOpen(false)}
      />
    </div>
  );
};

const StocksWithProvider = () => (
  <DashboardProvider>
    <Stocks />
  </DashboardProvider>
);

export default StocksWithProvider;
