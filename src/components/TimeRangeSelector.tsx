import { Button } from "@/components/ui/button";
import { TimeRange } from "@/types/stock";

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const TimeRangeSelector = ({ selectedRange, onRangeChange }: TimeRangeSelectorProps) => {
  const ranges: { label: string; value: TimeRange }[] = [
    { label: "7D", value: "7d" },
    { label: "14D", value: "14d" },
    { label: "1M", value: "1m" },
    { label: "2M", value: "2m" },
    { label: "3M", value: "3m" },
  ];

  return (
    <div className="flex space-x-2 mb-4">
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={selectedRange === range.value ? "default" : "outline"}
          size="sm"
          onClick={() => onRangeChange(range.value)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;
