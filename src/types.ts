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
 * Option contract from Finnhub API (inside options.CALL or options.PUT)
 */
export interface FinnhubOptionContract {
  contractName: string;
  contractSize: number;
  contractPeriod: string;
  currency: string;
  type: string;
  inTheMoney: boolean;
  lastTradeDateTime: string;
  expirationDate: string;
  strike: number;
  lastPrice: number;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  theoretical: number;
  intrinsicValue: number;
  timeValue: number;
  updatedAt: string;
  daysBeforeExpiration: number;
}

/**
 * Normalized option contract
 */
export interface NormalizedOption {
  contractName: string;
  strike: number;
  expirationDate: string;
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
export interface FinnhubOptionsChainDataItem {
  expirationDate: string;
  impliedVolatility: number;
  putVolume: number;
  callVolume: number;
  putCallVolumeRatio: number;
  putOpenInterest: number;
  callOpenInterest: number;
  putCallOpenInterestRatio: number;
  optionsCount: number;
  options: {
    CALL: FinnhubOptionContract[];
    PUT: FinnhubOptionContract[];
  };
}

export interface FinnhubOptionsChain {
  code: string;
  exchange: string;
  lastTradeDate: string;
  lastTradePrice: number;
  data: FinnhubOptionsChainDataItem[];
}

/**
 * Expiration date summary (returned when no specific date is requested)
 */
export interface ExpirationDateSummary {
  expirationDate: string;
  optionsCount: number;
  putVolume: number;
  callVolume: number;
  putOpenInterest: number;
  callOpenInterest: number;
  impliedVolatility: number;
}

/**
 * Normalized options chain (returned when a specific expiration date is requested)
 */
export interface NormalizedOptionsChain {
  options: NormalizedOption[];
  expirationDate: string;
}

/**
 * Available expirations response (returned when no specific date is requested)
 */
export interface AvailableExpirationsResponse {
  availableExpirationDates: ExpirationDateSummary[];
  totalExpirations: number;
}
