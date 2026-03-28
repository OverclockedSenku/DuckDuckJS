# DuckDuckJS

DuckDuckJS is a performance-oriented, Deno-first meta-search engine library and
command-line tool. It provides a unified TypeScript interface to aggregate
search results from multiple providers by utilizing efficient HTML fallbacks and
internal JSON APIs, bypassing the need for heavy browser automation or complex
frontend execution.

The project is currently in a fast-moving beta state. Architectural changes may
occur as we expand engine support and server capabilities.

---

## Features

- Modular Engine Architecture: A plug-and-play system for adding or swapping
  search providers.
- Multi-Media Support: Native handling for Text, Image, Video, and News search
  results.
- Resilient Scrape Logic: Uses optimized endpoints to minimize rate-limiting and
  maximize speed.
- Zero-Config CLI: Highly typed interface with support for pretty-printed
  terminal output or raw JSON for piping.
- Standalone Binaries: Cross-compiled executables for Linux, macOS, and Windows.

---

## Quickstart

<details>
<summary>Command Line Interface (CLI)</summary>

### Running with Deno

For immediate use without installation, use the Deno runtime:

```bash
# Basic text search
deno run --allow-net src/cli.ts "search query"

# Search for images in a specific region
deno run --allow-net src/cli.ts "concept art" -T image -r us-en

# Search news from the past week
deno run --allow-net src/cli.ts "tech headlines" -T news -t w
```

### Using Compiled Binaries

If you have downloaded a release binary, you can run it directly:

```bash
./duckduckjs "search query" --json
```

### Options

- \-T, --type: text (default), image, video, news
- \-p, --page: pagination offset
- \-t, --time: time filter (d, w, m, y)
- \-r, --region: region code (default: us-en)
- \-j, --json: output raw JSON

</details>

<details> <summary>Library Integration (Developer Guide)</summary>

DuckDuckJS uses a strict Object-Oriented approach. All engines extend a base
class, ensuring a consistent contract for your applications.

### Setup

Import the specific engine you need from the library:

```typescript
import { DuckDuckGoEngine } from "./src/engines/duckduckgo.ts";
import { BraveEngine } from "./src/engines/brave.ts";

const ddg = new DuckDuckGoEngine();

// Execute a standard search
const results = await ddg.search("Deno development", {
  timeLimit: "w",
  page: 1,
});

// Access media-specific endpoints
const images = await ddg.images("mountain landscapes");
```

### Interfaces

The library provides standardized result shapes for all engines:

- TextResult: { type: "text", title, href, body }
- ImageResult: { type: "image", title, image, thumbnail, url, width, height,
  source }
- VideoResult: { type: "video", title, description, content, duration, publisher
  }
- NewsResult: { type: "news", date, title, body, url, image, source }

</details>

---

## Roadmap

This project is evolving from a simple scraper into a comprehensive search
infrastructure tool.

- [x] Base SearchEngine Architecture and Interfaces
- [x] DuckDuckGo Core Implementation (Text, Images, Videos, News)
- [x] Brave Search Engine Implementation
- [x] Multi-platform CLI Tool
- [ ] DuckDuckGo AI Chat (Accessing Llama/Claude endpoints)
- [ ] Integration of Bing, Google, and Mojeek engines
- [ ] Hono-based HTTP/REST Server wrapper
- [ ] MCP (Model Context Protocol) Server for AI Agent tooling

---

## Development and Branching

Development occurs on the main branch. Stable releases are branched using a
Year.Patch format (e.g., 26.0.0, 26.1.0).

To contribute, ensure your code passes the built-in quality checks:

```bash
deno fmt
deno lint
deno task test:integration
```

---

## Credits and Transparency

- Inspiration: Architecturally modeled after the Python library ddgs by deedy5.
- Author: Developed and maintained by @overclockedsenku (Raj Dave).
- AI Disclosure: The core logic, reverse-engineering of endpoints, and
  architectural flow are human-authored. AI was utilized as a pair-programmer
  for code enhancement, documentation formatting, and JSDoc generation.

---

## License

Licensed under the Apache License, Version 2.0. Attribution to the original
author is required for any redistributed or modified versions of the software.

---

## Disclaimer

DuckDuckJS is intended for educational and developmental purposes. Web scraping
utilizes undocumented internal APIs which are subject to change without notice.
Users are responsible for adhering to the terms of service and rate limits of
the respective search providers.
