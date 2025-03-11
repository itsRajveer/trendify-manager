
import { useState } from "react";
import { useStock, Stock } from "@/contexts/StockContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StockChart from "@/components/StockChart";
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

const Stocks = () => {
  const { stocks } = useStock();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock);
  };

  const openBuyDialog = (stock: Stock) => {
    setSelectedStock(stock);
    setBuyDialogOpen(true);
  };

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
                          <TableHead>Symbol</TableHead>
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
                            <TableCell>{stock.symbol}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end">
                                <span>${stock.price.toFixed(2)}</span>
                                <span 
                                  className={`ml-2 text-xs ${stock.change >= 0 ? "text-success" : "text-danger"}`}
                                >
                                  {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
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
                          <TableHead>Symbol</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...filteredStocks]
                          .sort((a, b) => b.changePercent - a.changePercent)
                          .slice(0, 5)
                          .map((stock) => (
                            <TableRow 
                              key={stock.symbol}
                              className={selectedStock?.symbol === stock.symbol ? "bg-muted cursor-pointer" : "cursor-pointer"}
                              onClick={() => handleSelectStock(stock)}
                            >
                              <TableCell>{stock.symbol}</TableCell>
                              <TableCell className="text-right text-success">
                                +{stock.changePercent.toFixed(2)}%
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
                          <TableHead>Symbol</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...filteredStocks]
                          .sort((a, b) => a.changePercent - b.changePercent)
                          .slice(0, 5)
                          .map((stock) => (
                            <TableRow 
                              key={stock.symbol}
                              className={selectedStock?.symbol === stock.symbol ? "bg-muted cursor-pointer" : "cursor-pointer"}
                              onClick={() => handleSelectStock(stock)}
                            >
                              <TableCell>{stock.symbol}</TableCell>
                              <TableCell className="text-right text-danger">
                                {stock.changePercent.toFixed(2)}%
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
                    <div className={selectedStock.change >= 0 ? "text-success" : "text-danger"}>
                      {selectedStock.change >= 0 ? "+" : ""}
                      {selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 mb-6">
                  <StockChart stock={selectedStock} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Market Cap</h3>
                    <p>${(selectedStock.marketCap / 1000000000).toFixed(2)}B</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      Price Prediction
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>AI-powered prediction based on historical data</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <div className="flex items-center">
                      <span className="font-medium">${selectedStock.prediction.price.toFixed(2)}</span>
                      <span className="text-xs ml-2 text-muted-foreground">
                        {selectedStock.prediction.confidence * 100}% confidence
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button onClick={() => openBuyDialog(selectedStock)}>
                  Buy {selectedStock.symbol}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="py-12 text-center">
                <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">Select a stock</h3>
                <p className="text-muted-foreground">
                  Choose a stock from the list to view details and charts
                </p>
              </CardContent>
            </Card>
          )}
        </div>
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

export default Stocks;
