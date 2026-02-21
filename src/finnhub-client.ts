import type {
  EarningsCalendarArgs,
  EarningsCalendarResponse,
  EarningsAnnouncement,
  NormalizedEarnings,
  QuoteArgs,
  FinnhubQuote,
  NormalizedQuote,
  NewsArgs,
  FinnhubNews,
  NormalizedNews,
  StockProfileArgs,
  FinnhubProfile,
  NormalizedProfile,
  FinnhubOptionsChain,
  FinnhubOptionContract,
  NormalizedOption,
  NormalizedOptionsChain,
  ExpirationDateSummary,
  AvailableExpirationsResponse,
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
   * Get real-time quotes for multiple symbols
   */
  async getQuotes(args: QuoteArgs): Promise<{
    quotes: NormalizedQuote[];
  }> {
    const quotes: NormalizedQuote[] = [];

    for (const symbol of args.symbols) {
      const upperSymbol = symbol.toUpperCase();
      const response = await this.request<FinnhubQuote>(
        "/quote",
        { symbol: upperSymbol }
      );

      if (response.pc !== 0 || response.c !== 0) {
        quotes.push(this.normalizeQuote(upperSymbol, response));
      }
    }

    return { quotes };
  }

  /**
   * Get company news
   */
  async getNews(args: NewsArgs): Promise<{
    news: NormalizedNews[];
    count: number;
  }> {
    const response = await this.request<FinnhubNews[]>(
      "/company-news",
      {
        symbol: args.symbol.toUpperCase(),
        from: args.from,
        to: args.to,
      }
    );

    const news = response.map((item) => this.normalizeNews(item));

    return {
      news,
      count: news.length,
    };
  }

  /**
   * Get company profile/fundamentals
   */
  async getStockProfile(args: StockProfileArgs): Promise<{
    profile: NormalizedProfile | null;
  }> {
    const response = await this.request<FinnhubProfile>(
      "/stock/profile2",
      { symbol: args.symbol.toUpperCase() }
    );

    if (!response.ticker) {
      return { profile: null };
    }

    return {
      profile: this.normalizeProfile(response),
    };
  }

  /**
   * Get options chain for a specific expiration date
   */
  async getOptionsChain(args: { symbol: string; expirationDate: string }): Promise<{
    chain: NormalizedOptionsChain;
  }> {
    const params: Record<string, string> = {
      symbol: args.symbol.toUpperCase(),
      expirationDate: args.expirationDate,
    };

    const response = await this.request<FinnhubOptionsChain>("/stock/option-chain", params);

    const allOptions: NormalizedOption[] = [];

    for (const item of response.data || []) {
      for (const opt of item.options.CALL || []) {
        allOptions.push(this.normalizeOptionContract(opt, "call"));
      }
      for (const opt of item.options.PUT || []) {
        allOptions.push(this.normalizeOptionContract(opt, "put"));
      }
    }

    return {
      chain: {
        options: allOptions,
        expirationDate: args.expirationDate,
      },
    };
  }

  /**
   * Get available expiration dates for a symbol's options chain
   */
  async getAvailableExpirations(symbol: string): Promise<AvailableExpirationsResponse> {
    const params: Record<string, string> = {
      symbol: symbol.toUpperCase(),
    };

    const response = await this.request<FinnhubOptionsChain>("/stock/option-chain", params);

    const expirations: ExpirationDateSummary[] = (response.data || []).map((item) => ({
      expirationDate: item.expirationDate,
      optionsCount: item.optionsCount || (item.options.CALL?.length || 0) + (item.options.PUT?.length || 0),
      putVolume: item.putVolume || 0,
      callVolume: item.callVolume || 0,
      putOpenInterest: item.putOpenInterest || 0,
      callOpenInterest: item.callOpenInterest || 0,
      impliedVolatility: item.impliedVolatility || 0,
    }));

    return {
      availableExpirationDates: expirations,
      totalExpirations: expirations.length,
    };
  }

  /**
   * Normalize an option contract from Finnhub API
   */
  private normalizeOptionContract(
    opt: FinnhubOptionContract,
    type: "call" | "put"
  ): NormalizedOption {
    return {
      contractName: opt.contractName,
      strike: opt.strike,
      expirationDate: opt.expirationDate,
      type: type,
      bid: opt.bid || null,
      ask: opt.ask || null,
      last: opt.lastPrice || null,
      openInterest: opt.openInterest,
      volume: opt.volume,
      impliedVolatility: opt.impliedVolatility,
      greeks: {
        delta: opt.delta ?? null,
        gamma: opt.gamma ?? null,
        theta: opt.theta ?? null,
        rho: opt.rho ?? null,
        vega: opt.vega ?? null,
      },
    };
  }

  /**
   * Normalize a single quote
   */
  private normalizeQuote(symbol: string, quote: FinnhubQuote): NormalizedQuote {
    return {
      symbol,
      currentPrice: quote.c,
      change: quote.d ?? 0,
      percentChange: quote.dp ?? 0,
      high: quote.h,
      low: quote.l,
      open: quote.o,
      previousClose: quote.pc,
      timestamp: quote.t,
    };
  }

  /**
   * Normalize a news article
   */
  private normalizeNews(news: FinnhubNews): NormalizedNews {
    return {
      headline: news.headine,
      summary: news.summary,
      source: news.source,
      url: news.url,
      datetime: news.datetime,
      image: news.image,
      related: news.related,
      category: news.category,
    };
  }

  /**
   * Normalize a stock profile
   */
  private normalizeProfile(profile: FinnhubProfile): NormalizedProfile {
    return {
      name: profile.name || "",
      ticker: profile.ticker || "",
      exchange: profile.exchange || "",
      industry: profile.finnhubIndustry || profile.industry || "",
      weburl: profile.weburl || "",
      logo: profile.logo || profile.logo_url || "",
      description: profile.description || "",
      marketCap: profile.marketCapitalization || 0,
      sharesOutstanding: profile.shareOutstanding || 0,
      ipoDate: profile.ipo || profile.ipoDate || "",
      currency: profile.currency || "",
      country: profile.country || "",
      phone: profile.phone || profile.phoneNumber || "",
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
