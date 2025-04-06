
import axios from "axios";
import { HistoricalDataResponse, TimeRange } from "@/types/stock";

const API_URL = 'http://localhost:5000/api';

export const getHistoricalData = async (range: TimeRange): Promise<HistoricalDataResponse> => {
  const { from, to } = getDateRangeForQuery(range);
  const response = await axios.get(
    `${API_URL}/stocks/history?from=${from}&to=${to}`
  );
  return response.data;
};

const getDateRangeForQuery = (range: TimeRange): { from: string; to: string } => {
  const to = new Date();
  const from = new Date();

  switch (range) {
    case "7d":
      from.setDate(to.getDate() - 7);
      break;
    case "14d":
      from.setDate(to.getDate() - 14);
      break;
    case "1m":
      from.setMonth(to.getMonth() - 1);
      break;
    case "2m":
      from.setMonth(to.getMonth() - 2);
      break;
    case "3m":
      from.setMonth(to.getMonth() - 3);
      break;
    default:
      from.setDate(to.getDate() - 7);
  }

  return {
    from: formatDateForAPI(from),
    to: formatDateForAPI(to),
  };
};

const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const processHistoricalDataForCharts = (
  data: HistoricalDataResponse,
  symbol: string
): { date: string; price: number }[] => {
  if (!data || !data[symbol]) return [];

  const symbolData = data[symbol];
  return Object.entries(symbolData)
    .map(([date, values]) => ({
      date,
      price: values.close,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
