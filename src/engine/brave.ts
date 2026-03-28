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
 * Brave Search Engine driver.
 * * This engine scrapes the primary Brave Search web endpoint. Note that Brave
 * prefers stateful cookies over URL parameters for settings like SafeSearch
 * and localization.
 */
export class BraveEngine extends BaseSearchEngine {
  readonly name = "Brave";
  private readonly ENDPOINT = "https://search.brave.com/search";

  private readonly HEADERS = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };

  /**
   * Performs a standard web search using the Brave Search engine.
   * * @param query - The search string.
   * @param options - Configuration including region, pagination, and safesearch.
   * @returns A list of text-based search results.
   * * @throws {Error} If the HTTP request fails or the response is not 200 OK.
   */
  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<SearchResult[]> {
    const { region = "us-en", timeLimit, page = 1, safesearch = "moderate" } =
      options;

    // Build standard query parameters
    const params = new URLSearchParams({
      q: query,
      source: "web",
    });

    if (timeLimit) {
      const timeMap: Record<string, string> = {
        d: "pd",
        w: "pw",
        m: "pm",
        y: "py",
      };
      if (timeMap[timeLimit]) {
        params.append("tf", timeMap[timeLimit]);
      }
    }

    if (page > 1) {
      params.append("offset", (page - 1).toString());
    }

    // Brave handles region and safesearch via cookies.
    // Without these, the 'region' parameter is often ignored by their backend.
    const countryCode = region.split("-")[0].toLowerCase();
    const safeSearchMap: Record<string, string> = {
      on: "strict",
      moderate: "moderate",
      off: "off",
    };
    const mappedSafeSearch = safeSearchMap[safesearch.toLowerCase()] ||
      "moderate";

    const cookieString =
      `${countryCode}=${countryCode}; useLocation=0; safesearch=${mappedSafeSearch};`;

    const response = await fetch(`${this.ENDPOINT}?${params.toString()}`, {
      method: "GET",
      headers: {
        ...this.HEADERS,
        "Cookie": cookieString,
      },
    });

    if (!response.ok) {
      this.throwError(`HTTP ${response.status} - ${response.statusText}`);
    }

    const htmlText = await response.text();
    const $ = cheerio.load(htmlText);
    const results: SearchResult[] = [];

    // Brave marks web results with a data-type attribute.
    $("div[data-type='web']").each((_, element) => {
      const anchor = $(element).find("a").first();
      const href = anchor.attr("href") || "";

      // Title and Snippet extraction with fallbacks for different DOM layouts
      const title =
        $(element).find(".title, .sitename-container").last().text().trim() ||
        anchor.text().trim();

      const body = $(element).find(".snippet .content").text().trim() ||
        $(element).find(".snippet-content").text().trim();

      if (title && href) {
        results.push({ type: "text", title, href, body });
      }
    });

    return results;
  }
}
