#!/usr/bin/env bun
/**
 * Finnhub MCP Server
 * 
 * An MCP server that wraps the Finnhub API for accessing financial data
 * including earnings calendars, stock quotes, and more.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { FinnhubClient } from "./finnhub-client.js";
import {
  EarningsCalendarArgsSchema,
  type EarningsCalendarArgs,
  QuoteArgsSchema,
  type QuoteArgs,
  NewsArgsSchema,
  type NewsArgs,
  StockProfileArgsSchema,
  type StockProfileArgs,
  OptionsChainArgsSchema,
  type OptionsChainArgs,
} from "./types.js";

interface ServerConfig {
  apiKey: string;
}

function parseArgs(): ServerConfig {
  const args = process.argv.slice(2);
  let apiKey: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--api-key" && i + 1 < args.length) {
      apiKey = args[i + 1];
      i++;
    }
  }

  // Environment variable fallback
  if (!apiKey) {
    apiKey = process.env.FINNHUB_API_KEY;
  }

  if (!apiKey) {
    console.error(
      "Error: Finnhub API key is required. Provide it via --api-key argument or FINNHUB_API_KEY environment variable."
    );
    process.exit(1);
  }

  return { apiKey };
}

function createServer(config: ServerConfig): Server {
  const finnhubClient = new FinnhubClient(config.apiKey);

  const server = new Server(
    {
      name: "finnhub-mcp",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const tools: Tool[] = [
    {
      name: "finnhub.calendar.earnings",
      description:
        "Get earnings calendar for a specific date range. Returns earnings announcements with EPS estimates, actuals, and company details.",
      inputSchema: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description:
              "Start date in YYYY-MM-DD format (defaults to today if not provided)",
          },
          to: {
            type: "string",
            description:
              "End date in YYYY-MM-DD format (defaults to 7 days from start if not provided)",
          },
          symbol: {
            type: "string",
            description:
              "Optional: Filter by specific stock symbol (e.g., 'AAPL')",
          },
        },
      },
    },
    {
      name: "finnhub.quote",
      description:
        "Get real-time quote data for multiple stock symbols. Returns current price, daily change, volume, and other quote data.",
      inputSchema: {
        type: "object",
        properties: {
          symbols: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Array of stock symbols (e.g., ['AAPL', 'GOOGL', 'MSFT'])",
            minItems: 1,
            maxItems: 50,
          },
        },
        required: ["symbols"],
      },
    },
    {
      name: "finnhub.news",
      description:
        "Get company news for a specific stock symbol within a date range. Returns news articles with headlines, summaries, and URLs.",
      inputSchema: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Stock symbol (e.g., 'AAPL')",
          },
          from: {
            type: "string",
            description: "Start date in YYYY-MM-DD format",
          },
          to: {
            type: "string",
            description: "End date in YYYY-MM-DD format",
          },
        },
        required: ["symbol", "from", "to"],
      },
    },
    {
      name: "finnhub.stock.profile",
      description:
        "Get company profile and fundamentals for a stock symbol. Returns company details including name, industry, weburl, logo, market cap, and description.",
      inputSchema: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Stock symbol (e.g., 'AAPL')",
          },
        },
        required: ["symbol"],
      },
    },
    {
      name: "finnhub.options.chain",
      description:
        "Get options chain for a stock symbol. If expirationDate is provided, returns full option contracts (strikes, bid/ask, Greeks) for that date. If expirationDate is omitted, returns the list of all available expiration dates with summary metadata (volume, open interest, contract counts). Use without expirationDate first to discover available dates, then call again with a specific date.",
      inputSchema: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Stock symbol (e.g., 'AAPL')",
          },
          expirationDate: {
            type: "string",
            description: "Expiration date in YYYY-MM-DD format. If omitted, returns available expiration dates instead of contracts.",
          },
        },
        required: ["symbol"],
      },
    },
  ];

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === "finnhub.calendar.earnings") {
        const parsed = EarningsCalendarArgsSchema.safeParse(args);
        if (!parsed.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    error: "INVALID_ARGUMENT",
                    message: parsed.error.message,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const result = await finnhubClient.getEarningsCalendar(parsed.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      if (name === "finnhub.quote") {
        const parsed = QuoteArgsSchema.safeParse(args);
        if (!parsed.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { error: "INVALID_ARGUMENT", message: parsed.error.message },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const result = await finnhubClient.getQuotes(parsed.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      if (name === "finnhub.news") {
        const parsed = NewsArgsSchema.safeParse(args);
        if (!parsed.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { error: "INVALID_ARGUMENT", message: parsed.error.message },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const result = await finnhubClient.getNews(parsed.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      if (name === "finnhub.stock.profile") {
        const parsed = StockProfileArgsSchema.safeParse(args);
        if (!parsed.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { error: "INVALID_ARGUMENT", message: parsed.error.message },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const result = await finnhubClient.getStockProfile(parsed.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      if (name === "finnhub.options.chain") {
        const parsed = OptionsChainArgsSchema.safeParse(args);
        if (!parsed.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { error: "INVALID_ARGUMENT", message: parsed.error.message },
                  null,
                  2
                ),
              },
            ],
          };
        }

        if (parsed.data.expirationDate) {
          // Specific date requested: return full option contracts
          const result = await finnhubClient.getOptionsChain({
            symbol: parsed.data.symbol,
            expirationDate: parsed.data.expirationDate,
          });
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } else {
          // No date specified: return available expiration dates only
          const result = await finnhubClient.getAvailableExpirations(parsed.data.symbol);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: `Unknown tool: ${name}` }, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: "FINNHUB_API_ERROR",
                message: errorMessage,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  });

  return server;
}

async function main() {
  const config = parseArgs();
  const server = createServer(config);
  const transport = new StdioServerTransport();

  console.error("Finnhub MCP Server running on stdio");
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
