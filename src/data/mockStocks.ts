
import { Stock } from "../types/stock";

export const mockStocks: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.50,
    change: 2.35,
    changePercent: 1.36,
    marketCap: 2800000000000,
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 160 + Math.random() * 20
    })),
    prediction: { price: 185.20, confidence: 0.75 }
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 360.20,
    change: -1.50,
    changePercent: -0.41,
    marketCap: 2600000000000,
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 350 + Math.random() * 15
    })),
    prediction: { price: 370.80, confidence: 0.65 }
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 145.10,
    change: 0.80,
    changePercent: 0.55,
    marketCap: 1900000000000,
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 140 + Math.random() * 10
    })),
    prediction: { price: 148.30, confidence: 0.60 }
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 132.80,
    change: 1.25,
    changePercent: 0.95,
    marketCap: 1400000000000,
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 125 + Math.random() * 15
    })),
    prediction: { price: 140.50, confidence: 0.72 }
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 248.50,
    change: -3.20,
    changePercent: -1.27,
    marketCap: 780000000000,
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 240 + Math.random() * 20
    })),
    prediction: { price: 260.10, confidence: 0.55 }
  }
];
