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
import { BaseEngine } from "../core/baseengine.ts";
import type { SearchResult, SearchOptions } from "../core/types.ts";

/**
 * Brave Search Engine.
 * Scrapes the primary web endpoint. Brave relies heavily on cookies
 * for state management (region, safesearch) rather than URL parameters.
 */
export class BraveEngine extends BaseEngine {
  readonly name = "Brave";
  private readonly ENDPOINT = "https://search.brave.com/search";

  // Brave is slightly more aggressive with bot detection, 
  // so we ensure a very standard Accept header alongside the User-Agent.
  private readonly HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };

  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const { region = "us-en", timeLimit, page = 1, safesearch = "moderate" } = options;

    // 1. Build URL Parameters
    const params = new URLSearchParams({
      q: query,
      source: "web",
    });

    if (timeLimit) {
      // Brave uses a specific mapping for time filters
      const timeMap: Record<string, string> = { d: "pd", w: "pw", m: "pm", y: "py" };
      if (timeMap[timeLimit]) {
        params.append("tf", timeMap[timeLimit]);
      }
    }

    if (page > 1) {
      // Brave pagination uses a simple offset (page - 1)
      params.append("offset", (page - 1).toString());
    }

    // 2. Build the Cookie String
    // Brave uses the region prefix (e.g., 'us' from 'us-en') as a cookie key.
    const countryCode = region.split("-")[0].toLowerCase();
    
    const safeSearchMap: Record<string, string> = { on: "strict", moderate: "moderate", off: "off" };
    const mappedSafeSearch = safeSearchMap[safesearch.toLowerCase()] || "moderate";

    const cookieString = `${countryCode}=${countryCode}; useLocation=0; safesearch=${mappedSafeSearch};`;

    // 3. Execute the GET request
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

    // 4. Parse the DOM
    // Brave wraps actual web results in divs with data-type="web"
    $("div[data-type='web']").each((_, element) => {
      // Find the link wrapping the title
      const anchor = $(element).find("a").first();
      const href = anchor.attr("href") || "";
      
      // Brave's title logic can be nested, so we look for standard classes
      const title = $(element).find(".title, .sitename-container").last().text().trim() || anchor.text().trim();
      
      // The snippet body
      const body = $(element).find(".snippet .content").text().trim() || $(element).find(".snippet-content").text().trim();

      if (title && href) {
        results.push({ type: "text", title, href, body });
      }
    });

    return results;
  }
}