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

import * as cheerio from "cheerio";
import { BaseSearchEngine } from "../core/base.ts";
import type { SearchOptions, SearchResult } from "../core/types.ts";

/**
 * Generates a URL-safe Base64 token of a specific byte length.
 * * Yahoo requires random entropy tokens in the URL path (`_ylt`, `_ylu`)
 * to bypass their caching and basic bot-protection mechanisms.
 * * @param byteLength - The number of random bytes to generate before encoding.
 * @returns A Base64-URL encoded string.
 */
function tokenUrlSafe(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  const b64 = btoa(String.fromCharCode(...bytes));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Extracts the real destination URL from Yahoo's tracking wrapper.
 * * Yahoo routes outgoing clicks through a tracking URL. The actual
 * destination is encoded between `/RU=` and `/RK=`.
 * * @param url - The raw Yahoo tracking URL.
 * @returns The decoded destination URL.
 */
function extractYahooUrl(url: string): string {
  try {
    const t = url.split("/RU=")[1];
    const raw = t.split("/RK=")[0].split("/RS=")[0];
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return url;
  }
}

/**
 * Yahoo Search Engine driver.
 * * Yahoo syndicates Bing's search index. This engine acts as a stealthier
 * alternative to scraping Bing directly, as Yahoo's bot protection is less
 * reliant on strict TLS fingerprinting.
 */
export class YahooEngine extends BaseSearchEngine {
  readonly name = "Yahoo";

  /**
   * Performs a standard web search using the Yahoo engine.
   * * @param query - The search string.
   * @param options - Configuration including region, pagination, and time limits.
   * @returns A list of text-based search results.
   * * @throws {Error} If the HTTP request fails or the response is not 200 OK.
   */
  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<SearchResult[]> {
    const { timeLimit, page = 1 } = options;

    // Generate accurate byte-length tokens to mimic legitimate browser requests
    const ylt = tokenUrlSafe(18);
    const ylu = tokenUrlSafe(35);
    const endpoint = `https://search.yahoo.com/search;_ylt=${ylt};_ylu=${ylu}`;

    const params = new URLSearchParams({ p: query });

    if (page > 1) {
      // Yahoo pagination steps by 7
      params.append("b", ((page - 1) * 7 + 1).toString());
    }

    if (timeLimit) {
      params.append("btf", timeLimit);
    }

    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      this.throwError(`HTTP ${response.status} - ${response.statusText}`);
    }

    const htmlText = await response.text();
    const $ = cheerio.load(htmlText);
    const results: SearchResult[] = [];

    // Extract using substring attribute selectors to avoid strict class name breakages
    $("div[class*='relsrch']").each((_, element) => {
      const title = $(element).find("div[class*='Title'] h3").text().trim();
      let href = $(element).find("div[class*='Title'] a").attr("href") || "";
      const body = $(element).find("div[class*='Text']").text().trim();

      // Skip direct ad clicks (often routed back to Bing)
      if (href.startsWith("https://www.bing.com/aclick?")) {
        return;
      }

      // Unwrap the Yahoo tracking link
      if (href.includes("/RU=")) {
        href = extractYahooUrl(href);
      }

      if (title && href) {
        results.push({ type: "text", title, href, body });
      }
    });

    return results;
  }
}
