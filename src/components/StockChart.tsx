
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ChartDataPoint {
  date: string;
  price: number;
}

interface StockChartProps {
  data: ChartDataPoint[];
  height?: number;
  showAxis?: boolean;
  color?: string;
}

const StockChart = ({ 
  data, 
  height = 300, 
  showAxis = true,
  color = "#8B5CF6" 
}: StockChartProps) => {
  // Determine if the stock is trending up or down
  const positiveChange = data.length >= 2 ? 
    data[data.length - 1].price >= data[0].price : true;
  
  const lineColor = color || (positiveChange ? "#10B981" : "#EF4444");

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 5,
          left: showAxis ? 20 : 0,
          bottom: showAxis ? 20 : 0,
        }}
      >
        {showAxis && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
        {showAxis && <XAxis dataKey="date" tick={{ fontSize: 12 }} />}
        {showAxis && (
          <YAxis
            tick={{ fontSize: 12 }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
        )}
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{ 
            backgroundColor: 'hsl(240 10% 16%)', 
            borderColor: 'hsl(240 3.7% 15.9%)',
            color: '#fff' 
          }}
        />
        {showAxis && <Legend />}
        <Line
          type="monotone"
          dataKey="price"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StockChart;
