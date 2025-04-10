import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStock } from "@/contexts/StockContext";
import { PortfolioStock } from "@/types/stock";
import { cn } from "@/lib/utils";
import SellStockDialog from "./SellStockDialog";

interface PortfolioStockCardProps {
  stock: PortfolioStock;
  currentPrice: number;
}

const PortfolioStockCard = ({ stock, currentPrice }: PortfolioStockCardProps) => {
  const { stocks, stockGainLoss } = useStock();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Calculate profit/loss
  const totalCost = stock.avgPrice * stock.shares;
  const currentValue = currentPrice * stock.shares;
  const profitLoss = currentValue - totalCost;
  const profitLossPercent = (profitLoss / totalCost) * 100;
  const isProfit = profitLoss >= 0;

  // Find the full stock details from the stocks list
  const fullStock = stocks.find(s => s.symbol === stock.symbol);

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{stock.symbol}</h3>
            <p className="text-sm text-muted-foreground">
              {stock.shares} shares at avg. ${stock.avgPrice.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">${currentValue.toFixed(2)}</div>
            <div className={cn(
              "text-sm",
              isProfit ? "text-success" : "text-danger"
            )}>
              {stockGainLoss[stock.symbol] ? (
                <>
                  {stockGainLoss[stock.symbol].change >= "0" ? "+" : ""}
                  {stockGainLoss[stock.symbol].change} (
                  {stockGainLoss[stock.symbol].percentChange}%)
                </>
              ) : (
                <>
                  {isProfit ? "+" : ""}
                  {profitLoss.toFixed(2)} ({profitLossPercent.toFixed(2)}%)
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current: ${currentPrice.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Avg. Cost: ${stock.avgPrice.toFixed(2)}</p>
          </div>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
          >
            Sell
          </Button>
        </div>
      </CardContent>

      <SellStockDialog
        stock={{
          symbol: stock.symbol,
          name: fullStock?.name || stock.symbol,
          price: currentPrice,
          prediction: fullStock?.prediction || {
            price: currentPrice,
            confidence: 0.5
          }
        }}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        ownedShares={stock.shares}
      />
    </Card>
  );
};

export default PortfolioStockCard;
