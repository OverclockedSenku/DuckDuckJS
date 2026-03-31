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
 * Mojeek Search Engine driver.
 * * Mojeek is an independent, privacy-focused search engine with its own web crawler.
 * It does not syndicate from Google or Bing, making it an excellent fallback for
 * unbiased or alternative results. It handles localization strictly via cookies.
 */
export class MojeekEngine extends BaseSearchEngine {
  readonly name = "Mojeek";
  private readonly ENDPOINT = "https://www.mojeek.com/search";

  /**
   * Performs a standard web search using the Mojeek engine.
   * * @param query - The search string.
   * @param options - Configuration including region, pagination, and safesearch.
   * @returns A list of text-based search results.
   * * @throws {Error} If the HTTP request fails or the response is not 200 OK.
   */
  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<SearchResult[]> {
    const { region = "us-en", page = 1, safesearch = "moderate" } = options;

    const [country, lang] = region.toLowerCase().split("-");

    const params = new URLSearchParams({ q: query });

    if (safesearch.toLowerCase() === "on") {
      params.append("safe", "1");
    }

    if (page > 1) {
      // Mojeek pagination steps by 10
      params.append("s", ((page - 1) * 10 + 1).toString());
    }

    const response = await fetch(`${this.ENDPOINT}?${params.toString()}`, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        // Mojeek applies localization via arc (country) and lb (language) cookies
        "Cookie": `arc=${country}; lb=${lang}`,
      },
    });

    if (!response.ok) {
      this.throwError(`HTTP ${response.status} - ${response.statusText}`);
    }

    const htmlText = await response.text();
    const $ = cheerio.load(htmlText);
    const results: SearchResult[] = [];

    // Mojeek utilizes a very clean, semantic HTML unordered list structure
    $("ul[class*='results'] > li").each((_, element) => {
      const title = $(element).find("h2").text().trim();
      const href = $(element).find("h2 a").attr("href") || "";
      const body = $(element).find("p.s").text().trim();

      if (title && href) {
        results.push({ type: "text", title, href, body });
      }
    });

    return results;
  }
}
