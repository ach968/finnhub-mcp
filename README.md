# Finnhub MCP Server

A Model Context Protocol (MCP) server wrapping the [Finnhub API](https://finnhub.io/docs/api) for financial market data. 

## Features

- **Earnings Calendar**: Get upcoming and historical earnings announcements with EPS estimates, actuals, and revenue data
- **API Key Authentication**: Simple API key-based authentication via CLI or environment variables
- **Type-safe**: Full TypeScript support with Zod validation
- **Bun-native**: Optimized for Bun runtime

## Installation

### Using npx with GitHub (recommended)

Run directly from GitHub without cloning or installing:

```bash
npx github:ach968/finnhub-mcp --api-key YOUR_FINNHUB_API_KEY
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/ach968/finnhub-mcp.git
cd finnhub-mcp

# Install dependencies
bun install

# Run in development mode
bun run dev -- --api-key YOUR_FINNHUB_API_KEY
```

## OpenCode Configuration

Add to your OpenCode config (`~/.config/opencode/opencode.json`):

### Using npx with GitHub

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "finnhub": {
      "type": "local",
      "command": [
        "npx",
        "github:ach968/finnhub-mcp",
        "--api-key",
        "YOUR_FINNHUB_API_KEY"
      ],
      "enabled": true
    }
  }
}
```

### Using Environment Variables

```json
{
  "mcp": {
    "finnhub": {
      "type": "local",
      "command": [
        "npx",
        "github:ach968/finnhub-mcp"
      ],
      "environment": {
        "FINNHUB_API_KEY": "YOUR_API_KEY"
      },
      "enabled": true
    }
  }
}
```

## Available Tools

### `finnhub.calendar.earnings`

Get earnings calendar for a date range.

**Parameters:**
- `from` (optional): Start date in `YYYY-MM-DD` format (defaults to today)
- `to` (optional): End date in `YYYY-MM-DD` format (defaults to 7 days from start)
- `symbol` (optional): Filter by stock symbol (e.g., "AAPL")

**Example Response:**
```json
{
  "data": [
    {
      "date": "2024-01-25",
      "symbol": "AAPL",
      "quarter": "Q1",
      "fiscalYear": 2024,
      "time": "amc",
      "eps": {
        "estimate": 2.11,
        "actual": 2.18,
        "surprise": 0.07,
        "surprisePercent": 3.32
      },
      "revenue": {
        "estimate": 117900000000,
        "actual": 119580000000,
        "surprise": 1680000000,
        "surprisePercent": 1.42
      }
    }
  ],
  "count": 1,
  "dateRange": {
    "from": "2024-01-25",
    "to": "2024-01-25"
  }
}
```

**Time Values:**
- `bmo`: Before Market Open
- `amc`: After Market Close
- `dmh`: During Market Hours

## CLI Arguments

| Argument | Environment Variable | Description |
|----------|---------------------|-------------|
| `--api-key` | `FINNHUB_API_KEY` | Finnhub API key (required) |

CLI arguments take priority over environment variables.

## Development

### Scripts

```bash
# Development with hot reload
bun run dev

# Build for production
bun run build

# Type checking
bun run typecheck

# Run the built version
bun run start -- --api-key YOUR_KEY
```

### Project Structure

```
src/
├── index.ts           # Main MCP server entry point
├── finnhub-client.ts  # Finnhub API client
└── types.ts           # TypeScript types and Zod schemas
```

## API Key

Get your free API key from [Finnhub](https://finnhub.io/register).

## License

MIT

## Disclaimer

This project uses the [Finnhub API](https://finnhub.io/) but is not affiliated with, endorsed by, or connected to Finnhub in any way. Use this software at your own risk.
