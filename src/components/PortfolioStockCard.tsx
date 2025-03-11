
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortfolioStock } from "@/contexts/StockContext";
import { useStock } from "@/contexts/StockContext";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PortfolioStockCardProps {
  stock: PortfolioStock;
  currentPrice: number;
}

const PortfolioStockCard = ({ stock, currentPrice }: PortfolioStockCardProps) => {
  const { sellStock } = useStock();
  const [sharesToSell, setSharesToSell] = useState<number>(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const isProfit = stock.profitLoss >= 0;
  const profitLossPercent = (stock.profitLoss / stock.totalCost) * 100;

  const handleSell = async () => {
    await sellStock(stock.symbol, sharesToSell);
    setIsDialogOpen(false);
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{stock.symbol}</h3>
            <p className="text-sm text-muted-foreground">
              {stock.shares} shares at avg. ${stock.avgPrice.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">${stock.currentValue.toFixed(2)}</div>
            <div className={cn(
              "text-sm",
              isProfit ? "text-success" : "text-danger"
            )}>
              {isProfit ? '+' : ''}{stock.profitLoss.toFixed(2)} ({profitLossPercent.toFixed(2)}%)
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Current: ${currentPrice.toFixed(2)}</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">Sell</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sell {stock.symbol} Stock</DialogTitle>
                <DialogDescription>
                  Current price: ${currentPrice.toFixed(2)} per share
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="shares">Number of shares to sell</Label>
                  <Input
                    id="shares"
                    type="number"
                    min="1"
                    max={stock.shares}
                    value={sharesToSell}
                    onChange={(e) => setSharesToSell(parseInt(e.target.value))}
                  />
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    Total value: ${(sharesToSell * currentPrice).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSell}>
                  Confirm Sale
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioStockCard;
