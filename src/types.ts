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
