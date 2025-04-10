import { useState } from "react";
import { useStock } from "@/contexts/StockContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import PortfolioStockCard from "@/components/PortfolioStockCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardProvider } from "@/contexts/DashboardContext";
import GlobalTimeRangeSelector from "@/components/GlobalTimeRangeSelector";

const COLORS = ['#8B5CF6', '#10B981', '#EF4444', '#F97316', '#0EA5E9', '#D946EF'];

const Portfolio = () => {
  const { portfolio, stocks, isLoading } = useStock();

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          Loading Portfolio...
        </h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  // No stocks in portfolio
  if (!portfolio || !portfolio.stocks || portfolio.stocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          Your Portfolio
        </h1>
        
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-medium">Your portfolio is empty</h3>
              <p className="text-muted-foreground">
                Browse stocks and make your first investment to build your portfolio.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format portfolio data for pie chart
  const pieData = portfolio.stocks.map((item, index) => ({
    name: item.symbol,
    value: item.currentValue || (item.shares * (stocks.find(s => s.symbol === item.symbol)?.price || 0)),
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Briefcase className="h-5 w-5 mr-2" />
        Your Portfolio
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Value</CardDescription>
            <CardTitle className="text-2xl">
              ${portfolio.totalValue.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Profit/Loss</CardDescription>
            <div className="flex items-center">
              <CardTitle className={`text-2xl ${portfolio.profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                {portfolio.profitLoss >= 0 ? '+' : ''}${Math.abs(portfolio.profitLoss).toLocaleString()}
              </CardTitle>
              {portfolio.profitLoss >= 0 ? (
                <TrendingUp className="h-5 w-5 ml-2 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 ml-2 text-danger" />
              )}
            </div>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stocks Owned</CardDescription>
            <CardTitle className="text-2xl">
              {portfolio.stocks.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Global Time Range Selector */}
      <GlobalTimeRangeSelector />

      <Tabs defaultValue="list" className="mt-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="chart">Chart View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Stocks</CardTitle>
              <CardDescription>
                Manage your stock holdings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <div className="grid gap-4">
                  {portfolio.stocks.map((portfolioStock) => {
                    const stockData = stocks.find(s => s.symbol === portfolioStock.symbol);
                    return (
                      <PortfolioStockCard
                        key={portfolioStock.symbol}
                        stock={{
                          symbol: portfolioStock.symbol,
                          shares: portfolioStock.shares || 0,
                          price: portfolioStock.price || 0,
                          avgPrice: portfolioStock.avgPrice || portfolioStock.price || 0,
                          totalCost: (portfolioStock.price || 0) * (portfolioStock.shares || 0),
                          currentValue: (stockData?.price || 0) * (portfolioStock.shares || 0),
                          profitLoss: ((stockData?.price || 0) - (portfolioStock.price || 0)) * (portfolioStock.shares || 0)
                        }}
                        currentPrice={stockData?.price || 0}
                      />
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chart" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Distribution</CardTitle>
              <CardDescription>
                Breakdown of your investments by value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[60vh] flex items-center justify-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(240 10% 16%)', 
                          borderColor: 'hsl(240 3.7% 15.9%)',
                          color: '#fff' 
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No data available for chart view
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const PortfolioWithProvider = () => (
  <DashboardProvider>
    <Portfolio />
  </DashboardProvider>
);

export default PortfolioWithProvider;
