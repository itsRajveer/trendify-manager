import { Button } from "@/components/ui/button";
import { TimeRange } from "@/types/stock";
import { useDashboard } from "@/contexts/DashboardContext";

const GlobalTimeRangeSelector = () => {
  const { globalTimeRange, setGlobalTimeRange } = useDashboard();

  const ranges: { label: string; value: TimeRange }[] = [
    { label: "7 Days", value: "7d" },
    { label: "14 Days", value: "14d" },
    { label: "1 Month", value: "1m" },
    { label: "2 Months", value: "2m" },
    { label: "3 Months", value: "3m" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <span className="text-sm font-medium self-center mr-2">Time Range:</span>
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={globalTimeRange === range.value ? "default" : "outline"}
          size="sm"
          onClick={() => setGlobalTimeRange(range.value)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
};

export default GlobalTimeRangeSelector;
