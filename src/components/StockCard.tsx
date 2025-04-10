import { Card, CardContent } from "@/components/ui/card";
import { Stock } from "@/contexts/StockContext";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import StockChart from "./StockChart";

interface StockCardProps {
  stock: Stock;
  onClick?: () => void;
  gainLossInfo?: {
    change: string;
    percentChange: string;
    direction: 'gain' | 'loss' | 'no change';
  };
  historicalData?: { date: string; price: number }[];
}

const StockCard = ({ stock, onClick, gainLossInfo, historicalData }: StockCardProps) => {
  const isPositive = gainLossInfo
    ? gainLossInfo.direction === 'gain'
    : stock.change >= 0;

  console.log("StockCard - stock:", stock);
  console.log("StockCard - historicalData:", historicalData);

  // Make sure we have valid data before displaying
  const changeValue = gainLossInfo 
    ? gainLossInfo.change 
    : stock.change.toFixed(2);
    
  const percentChangeValue = gainLossInfo 
    ? gainLossInfo.percentChange
    : stock.changePercent.toFixed(2);

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        "border-l-4",
        isPositive ? "border-l-success" : "border-l-danger"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{stock.symbol}</h3>
            <p className="text-sm text-muted-foreground">{stock.name}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">${stock.price.toFixed(2)}</div>
            <div className={cn(
              "flex items-center text-sm",
              isPositive ? "text-success" : "text-danger"
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              <span>
                {`${isPositive && !changeValue.startsWith("-") && !changeValue.startsWith("+") ? "+" : ""}${changeValue} (${percentChangeValue}%)`}
              </span>
            </div>
          </div>
        </div>
        <div className="h-24">
          <StockChart 
            data={historicalData}
            height={100} 
            showAxis={false} 
            color={isPositive ? "#10B981" : "#EF4444"}
            gainLossInfo={gainLossInfo}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StockCard;
