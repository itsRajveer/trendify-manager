
import { useState, useEffect } from "react";
import { getHistoricalData, processHistoricalDataForCharts } from "@/services/stockService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StockChart from "@/components/StockChart";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import { TimeRange } from "@/types/stock";

interface StockHistoryChartProps {
  symbol: string;
  name: string;
}

const StockHistoryChart = ({ symbol, name }: StockHistoryChartProps) => {
  const [historicalData, setHistoricalData] = useState<{ date: string; price: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getHistoricalData(timeRange);
        const processedData = processHistoricalDataForCharts(data, symbol);
        setHistoricalData(processedData);
      } catch (err) {
        console.error("Failed to fetch historical data", err);
        setError("Failed to load historical data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol, timeRange]);

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{symbol}</CardTitle>
            <CardDescription>{name}</CardDescription>
          </div>
          <TimeRangeSelector
            selectedRange={timeRange}
            onRangeChange={handleTimeRangeChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : historicalData.length > 0 ? (
          <StockChart data={historicalData} height={350} />
        ) : (
          <div className="flex justify-center items-center h-64 text-muted-foreground">
            No historical data available for this stock
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockHistoryChart;
