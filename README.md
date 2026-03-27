# DuckDuckJS

> This version of duckduckjs is evolving very fast, so expect some breaking
> changes.

A fast, dependency-light, Deno-first TypeScript metasearch library and CLI tool
that aggregates results from diverse web search services.

Bypasses aggressive bot-protection and JS-heavy frontends by utilizing raw HTML
fallbacks and internal JSON APIs.

## Credits & Transparency

- **Inspiration:** This project is heavily inspired by and architecturally
  modeled after the excellent Python library
  [ddgs by deedy5](https://github.com/deedy5/ddgs).
- **Author:** Built by [@overclockedsenku](https://github.com/overclockedsenku).
- **AI Disclosure:** The core mechanics, reverse-engineering flow, and
  architectural decisions were entirely human-written. AI was used strictly as a
  pair-programmer to enhance code structure, write professional JSDoc comments,
  and format the repository.

---

## Current Features

- **DuckDuckGo Engine:** Resilient scraping using HTML fallbacks and VQD token
  extraction.
- **Media Types:** Full support for Text, Images, Videos, and News searches.
- **Built-in CLI:** A fast, heavily typed command-line interface with
  pretty-printing and JSON output support.
- **Deno-Native:** Zero configuration, strict TypeScript, and easily compilable
  to a standalone binary.

---

## CLI Usage

> Currently it requires deno to run, but in future there will be compiled
> binary.

You can run DuckDuckJS directly from your terminal using Deno.

### Basic Search

```bash
deno run --allow-net src/cli.ts "TypeScript vs Rust"
```

### Media Types (Images, Videos, News)

Use the `-T` or `--type` flag to search specific endpoints.

```bash
deno run --allow-net src/cli.ts "Cyberpunk wallpapers" -T image
deno run --allow-net src/cli.ts "SpaceX launch" -T video
deno run --allow-net src/cli.ts "AI regulations" -T news
```

### Advanced Options

```bash
# Search for results from the past week (-t w) on page 2 (-p 2)
deno run --allow-net src/cli.ts "latest tech news" -t w -p 2

# Output raw JSON for piping to other tools like jq
deno run --allow-net src/cli.ts "best arch linux tiling wm" --json > output.json
```

---

## Library Usage

> After a stable release the library will be pubished to JSR and NPM.
>
> NOTE: LIBRARY API WILL CHANGE SOON.

DuckDuckJS is designed with a strict Object-Oriented interface, making it easy
to drop into your own Deno or Node (via JSR) projects.

```typescript
import { DuckDuckGoEngine } from "@overclockedsenku/duckduckjs";

const engine = new DuckDuckGoEngine();

// 1. Standard Text Search
const textResults = await engine.search("How to build an LLM", {
  timeLimit: "m", // Past month
  page: 1,
});
console.log(textResults);

// 2. Image Search
const imageResults = await engine.images("Thousand Sunny One Piece");
console.log(imageResults[0].image); // Direct high-res URL

// 3. News Search
const newsResults = await engine.news("Global markets");
console.log(newsResults[0].title);
```

### The `SearchOptions` Interface

All engine methods accept an optional `SearchOptions` object:

```typescript
interface SearchOptions {
  region?: string; // e.g., "us-en"
  timeLimit?: "d" | "w" | "m" | "y";
  page?: number; // Pagination offset
  safesearch?: "on" | "moderate" | "off";
}
```

---

## Roadmap & Development

This library is actively under development. We are transitioning from a
single-engine scraper to a modular Meta-Search infrastructure tool.

### Currently Implemented

- [x] Base SearchEngine Architecture & Interfaces
- [x] DuckDuckGo Core Engine (Text, Images, Videos, News)
- [x] Command Line Interface (CLI)

### In Development (Coming Soon)

- [ ] **Additional Search Engines:** Plug-and-play modules for Bing, Google,
      Brave, and Mojeek.
- [ ] **DuckDuckGo AI Chat:** Implementing the `duckchat` wrapper to interact
      with Llama/Claude endpoints without requiring API keys.
- [ ] **HTTP/REST Server:** A fast API wrapper built with Hono to serve search
      results over local HTTP.
- [ ] **MCP (Model Context Protocol) Server:** Turn DuckDuckJS into a native
      tool for AI agents (Claude Desktop, etc.) to query the web in real-time.

---

## ⚠️ Disclaimer

This library is for educational purposes only. Web scraping relies on
undocumented, internal APIs that can change at any time. Please respect the rate
limits of the search engines you are querying.
