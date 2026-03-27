/**
 * DuckDuckJS
 * Copyright 2026 Raj Dave (@overclockedsenku)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { parseArgs } from "@std/cli/parse-args";
import { DuckDuckGoEngine } from "./engine/duckduckgo.ts";

async function main() {
  // Parse the raw command line arguments
  const flags = parseArgs(Deno.args, {
    string: ["region", "time", "engine", "type"],
    boolean: ["json", "help"],
    default: {
      region: "us-en",
      json: false,
      engine: "ddg",
      type: "text", // Default to text search
    },
    alias: {
      h: "help",
      p: "page",
      t: "time",
      r: "region",
      j: "json",
      T: "type", // Easy alias: duckduckjs "cats" -T image
    },
  });

  const query = flags._.join(" ").trim();

  // Handle the "Help" flag or empty queries
  if (flags.help || !query) {
    console.log(`
󰇥 DuckDuckJS CLI

Usage:
  duckduckjs [query] [options]

Options:
  -h, --help      Show this help message
  -p, --page      Page number to fetch (e.g., --page 2)
  -t, --time      Time limit filter (d = day, w = week, m = month, y = year)
  -r, --region    Region string (default: us-en)
  -j, --json      Output raw JSON instead of pretty-printing
  -T, --type      Search type: text, image, video, news (default: text)

Examples:
  duckduckjs "Kotlin vs Java"
  duckduckjs "latest tech news" -t w -p 2
  duckduckjs "cyberpunk wallpapers" -T image
  duckduckjs "best arch linux tiling wm" --json
    `);
    Deno.exit(query ? 0 : 1);
  }

  // Select and Create the requested engine.
  let engine;
  switch (flags.engine) {
    case "ddg":
      engine = new DuckDuckGoEngine();
      break;
    default:
      console.error(`❌ Unknown engine: ${flags.engine}`);
      Deno.exit(1);
  }

  if (!flags.json) {
    console.log(
      `\n🔍 Searching ${engine.name} (${flags.type}) for: "${query}"...\n`,
    );
  }

  // Execute the search function based on the requested type.
  try {
    const searchOptions = {
      page: Number(flags.page) || 1,
      region: flags.region,
      timeLimit: flags.time as "d" | "w" | "m" | "y" | undefined,
    };

    // Any is used here to catch the generic shape of the results array 
    // since images, videos, and text return slightly different interfaces.
    // TODO fix usage of any
    let results: any[];

    switch (flags.type.toLowerCase()) {
      case "image":
      case "images":
        results = await engine.images(query, searchOptions);
        break;
      case "video":
      case "videos":
        results = await engine.videos(query, searchOptions);
        break;
      case "news":
        results = await engine.news(query, searchOptions);
        break;
      case "text":
      default:
        results = await engine.search(query, searchOptions);
        break;
    }

    if (!results || results.length === 0) {
      if (flags.json) console.log("[]");
      else {console.log(
          `No results found. ${engine.name} might be having a bad day.`,
        );}
      Deno.exit(0);
    }

    // Output the results
    if (flags.json) {
      // Spit out pure JSON for piping into other tools (like jq)
      console.log(JSON.stringify(results, null, 2));
    } else {
      // Pretty-print for humans
      results.forEach((res, i) => {
        const index = String(i + 1).padStart(2, "0");
        console.log(`\x1b[32m[${index}]\x1b[0m \x1b[1m${res.title}\x1b[0m`);
        
        // Dynamically grab the main URL. 
        // Text uses 'href', Images use 'image', Videos use 'content', News uses 'url'.
        const link = res.href || res.image || res.content || res.url ||
          "No link available";
        console.log(`     \x1b[34m→ ${link}\x1b[0m`);
        
        // Dynamically grab the description/source.
        const desc = res.body || res.description || res.source || "";
        if (desc) {
          console.log(`     → \x1b[90m${desc}\x1b[0m\n`);
        } else {
          console.log("\n"); // Just pad with an empty line if there's no snippet
        }
      });
    }
  } catch (error: unknown) {
    // Graceful exit so we don't dump a massive, ugly stack trace on the user.
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Engine Failure: ${msg}`);
    Deno.exit(1);
  }
}

// Execute the script
if (import.meta.main) {
  main();
}
