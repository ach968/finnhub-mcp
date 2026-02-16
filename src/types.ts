import { z } from "zod";

/**
 * Input arguments for the earnings calendar tool
 */
export const EarningsCalendarArgsSchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .describe("Start date in YYYY-MM-DD format"),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .describe("End date in YYYY-MM-DD format"),
  symbol: z
    .string()
    .min(1)
    .max(10)
    .optional()
    .describe("Stock symbol to filter by (e.g., 'AAPL')"),
});

export type EarningsCalendarArgs = z.infer<typeof EarningsCalendarArgsSchema>;

/**
 * Input arguments for the quote tool
 */
export const QuoteArgsSchema = z.object({
  symbols: z
    .array(z.string().min(1).max(10))
    .min(1)
    .max(50)
    .describe("Array of stock symbols to get quotes for (e.g., ['AAPL', 'GOOGL'])"),
});

export type QuoteArgs = z.infer<typeof QuoteArgsSchema>;

/**
 * Input arguments for the quote history tool
 */
export const QuoteHistoryArgsSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .max(10)
    .describe("Stock symbol (e.g., 'AAPL')"),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .describe("Start date in YYYY-MM-DD format"),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .describe("End date in YYYY-MM-DD format"),
  resolution: z
    .enum(["1", "5", "15", "30", "60", "D", "W", "M"])
    .default("D")
    .describe("Candle resolution: 1, 5, 15, 30, 60 (minutes), D (daily), W (weekly), M (monthly)"),
});

export type QuoteHistoryArgs = z.infer<typeof QuoteHistoryArgsSchema>;

/**
 * Input arguments for the news tool
 */
export const NewsArgsSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .max(10)
    .describe("Stock symbol (e.g., 'AAPL')"),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .describe("Start date in YYYY-MM-DD format"),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .describe("End date in YYYY-MM-DD format"),
});

export type NewsArgs = z.infer<typeof NewsArgsSchema>;

/**
 * Input arguments for the stock profile tool
 */
export const StockProfileArgsSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .max(10)
    .describe("Stock symbol (e.g., 'AAPL')"),
});

export type StockProfileArgs = z.infer<typeof StockProfileArgsSchema>;

/**
 * Input arguments for the options chain tool
 */
export const OptionsChainArgsSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .max(10)
    .describe("Stock symbol (e.g., 'AAPL')"),
  expirationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .describe("Expiration date in YYYY-MM-DD format (optional)"),
});

export type OptionsChainArgs = z.infer<typeof OptionsChainArgsSchema>;

/**
 * Single earnings announcement from Finnhub API
 */
export interface EarningsAnnouncement {
  date: string;
  symbol: string;
  epsActual: number | null;
  epsEstimate: number | null;
  hour: string;
  quarter: number;
  revenueActual: number | null;
  revenueEstimate: number | null;
  year: number;
}

/**
 * Response from Finnhub earnings calendar API
 */
export interface EarningsCalendarResponse {
  earningsCalendar: EarningsAnnouncement[];
}

/**
 * Normalized earnings data for MCP response
 */
export interface NormalizedEarnings {
  date: string;
  symbol: string;
  quarter: string;
  fiscalYear: number;
  time: string;
  eps: {
    estimate: number | null;
    actual: number | null;
    surprise: number | null;
    surprisePercent: number | null;
  };
  revenue: {
    estimate: number | null;
    actual: number | null;
    surprise: number | null;
    surprisePercent: number | null;
  };
}

/**
 * Raw quote response from Finnhub API
 */
export interface FinnhubQuote {
  c: number;
  d: number | null;
  dp: number | null;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

/**
 * Normalized quote data
 */
export interface NormalizedQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

/**
 * Raw candles response from Finnhub API
 */
export interface FinnhubCandles {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: string;
  t: number[];
  v: number[];
}

/**
 * Normalized candle data
 */
export interface NormalizedCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * News article from Finnhub API
 */
export interface FinnhubNews {
  category: string;
  datetime: number;
  headine: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

/**
 * Normalized news article
 */
export interface NormalizedNews {
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  image: string;
  related: string;
  category: string;
}

/**
 * Stock profile from Finnhub API
 */
export interface FinnhubProfile {
  address: string;
  city: string;
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo_url?: string;
  industry?: string;
  description?: string;
  employees?: number;
  sector?: string;
  phoneNumber?: string;
  state?: string;
  countryCode?: string;
  ipoDate?: string;
  finnhubIndustry?: string;
}

/**
 * Normalized stock profile
 */
export interface NormalizedProfile {
  name: string;
  ticker: string;
  exchange: string;
  industry: string;
  weburl: string;
  logo: string;
  description: string;
  marketCap: number;
  sharesOutstanding: number;
  ipoDate: string;
  currency: string;
  country: string;
  phone: string;
}

/**
 * Option contract from Finnhub API
 */
export interface FinnhubOption {
  contractID: number;
  exerciseStyle: string;
  expirationDate: number;
  mnyBtm: string;
  optionType: string;
  strike: number;
  bids: number[];
  asks: number[];
  last: number;
  openInterest: number;
  volume: number;
  iv: number;
  delta: number;
  gamma: number;
  theta: number;
  rho: number;
  vega: number;
}

/**
 * Normalized option contract
 */
export interface NormalizedOption {
  contractId: number;
  strike: number;
  expirationDate: number;
  type: string;
  bid: number | null;
  ask: number | null;
  last: number | null;
  openInterest: number;
  volume: number;
  impliedVolatility: number;
  greeks: {
    delta: number | null;
    gamma: number | null;
    theta: number | null;
    rho: number | null;
    vega: number | null;
  };
}

/**
 * Finnhub options chain response
 */
export interface FinnhubOptionsChain {
  data: FinnhubOption[];
  expirationDate: string[];
}

/**
 * Normalized options chain
 */
export interface NormalizedOptionsChain {
  options: NormalizedOption[];
  availableExpirationDates: string[];
}
