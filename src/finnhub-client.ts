import type {
  EarningsCalendarArgs,
  EarningsCalendarResponse,
  EarningsAnnouncement,
  NormalizedEarnings,
} from "./types.js";

/**
 * Client for interacting with the Finnhub API
 */
export class FinnhubClient {
  private apiKey: string;
  private baseUrl = "https://finnhub.io/api/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Make a request to the Finnhub API
   */
  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add API key to all requests
    url.searchParams.append("token", this.apiKey);
    
    // Add additional params
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
      }
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Finnhub API error: ${response.status} ${response.statusText}${
          errorText ? ` - ${errorText}` : ""
        }`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get earnings calendar for a date range
   */
  async getEarningsCalendar(args: EarningsCalendarArgs): Promise<{
    data: NormalizedEarnings[];
    count: number;
    dateRange: { from: string; to: string };
  }> {
    // Set default dates if not provided
    const from = args.from || this.formatDate(new Date());
    const to =
      args.to || this.formatDate(this.addDays(new Date(from), 7));

    const params: Record<string, string> = {
      from,
      to,
    };

    if (args.symbol) {
      params.symbol = args.symbol.toUpperCase();
    }

    const response = await this.request<EarningsCalendarResponse>(
      "/calendar/earnings",
      params
    );

    const normalized = (response.earningsCalendar || []).map((item) =>
      this.normalizeEarnings(item)
    );

    return {
      data: normalized,
      count: normalized.length,
      dateRange: { from, to },
    };
  }

  /**
   * Normalize a single earnings announcement
   */
  private normalizeEarnings(item: EarningsAnnouncement): NormalizedEarnings {
    const epsSurprise =
      item.epsActual !== null && item.epsEstimate !== null
        ? item.epsActual - item.epsEstimate
        : null;

    const epsSurprisePercent =
      epsSurprise !== null && item.epsEstimate !== null && item.epsEstimate !== 0
        ? (epsSurprise / item.epsEstimate) * 100
        : null;

    const revenueSurprise =
      item.revenueActual !== null && item.revenueEstimate !== null
        ? item.revenueActual - item.revenueEstimate
        : null;

    const revenueSurprisePercent =
      revenueSurprise !== null &&
      item.revenueEstimate !== null &&
      item.revenueEstimate !== 0
        ? (revenueSurprise / item.revenueEstimate) * 100
        : null;

    return {
      date: item.date,
      symbol: item.symbol,
      quarter: `Q${item.quarter}`,
      fiscalYear: item.year,
      time: item.hour || "unknown",
      eps: {
        estimate: item.epsEstimate,
        actual: item.epsActual,
        surprise: epsSurprise,
        surprisePercent: epsSurprisePercent,
      },
      revenue: {
        estimate: item.revenueEstimate,
        actual: item.revenueActual,
        surprise: revenueSurprise,
        surprisePercent: revenueSurprisePercent,
      },
    };
  }

  /**
   * Format a date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  /**
   * Add days to a date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
