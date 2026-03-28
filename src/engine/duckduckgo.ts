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
 * DuckDuckGo Engine driver.
 * * This engine uses a hybrid approach:
 * 1. Standard search uses the 'html' fallback endpoint (no JS required).
 * 2. Media searches (images, videos, news) use internal JSON APIs which
 * require a VQD token for authentication.
 */
export class DuckDuckGoEngine extends BaseSearchEngine {
  readonly name = "DuckDuckGo";

  private readonly HTML_ENDPOINT = "https://html.duckduckgo.com/html/";
  private readonly IMAGE_ENDPOINT = "https://duckduckgo.com/i.js";
  private readonly VIDEO_ENDPOINT = "https://duckduckgo.com/v.js";

  private readonly HEADERS = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
  };

  /**
   * Retrieves the Verification Query Definition (VQD) token.
   * This token is mandatory for all DDG internal JSON API requests.
   * * @private
   */
  private async _getVqd(query: string): Promise<string> {
    const response = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      { headers: this.HEADERS },
    );

    if (!response.ok) {
      this.throwError(`VQD Fetch Failed: HTTP ${response.status}`);
    }

    const htmlText = await response.text();
    const match = htmlText.match(/vqd=(["']?)([^"'&]+)\1/);

    if (!match || !match[2]) {
      this.throwError(
        "Could not extract VQD token. DDG defenses may have changed.",
      );
    }

    return match[2];
  }

  /**
   * Executes a web search using the DDG HTML-only endpoint.
   * This method is resilient as it avoids the complex JS-heavy main site.
   */
  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<SearchResult[]> {
    const { region = "us-en", timeLimit, page = 1 } = options;

    const payload = new URLSearchParams();
    payload.append("q", query);
    payload.append("b", "");
    payload.append("l", region);
    if (timeLimit) payload.append("df", timeLimit);
    if (page > 1) payload.append("s", (10 + (page - 2) * 15).toString());

    const response = await fetch(this.HTML_ENDPOINT, {
      method: "POST",
      headers: {
        ...this.HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://html.duckduckgo.com",
        "Referer": "https://html.duckduckgo.com/",
        "Upgrade-Insecure-Requests": "1",
      },
      body: payload.toString(),
    });

    if (!response.ok) this.throwError(`Text Search HTTP ${response.status}`);

    const $ = cheerio.load(await response.text());
    const results: SearchResult[] = [];

    $(".result").each((_, element) => {
      const title = $(element).find(".result__title a").text().trim();
      let href = $(element).find(".result__title a").attr("href") || "";
      const body = $(element).find(".result__snippet").text().trim();

      if (title && href) {
        if (href.startsWith("//")) href = `https:${href}`;
        // Filter out internal tracking/ad links
        if (!href.startsWith("https://duckduckgo.com/y.js?")) {
          results.push({ type: "text", title, href, body });
        }
      }
    });

    return results;
  }

  /**
   * Performs an image search via the internal JSON API.
   */
  override async images(
    query: string,
    options: SearchOptions = {},
  ): Promise<SearchResult[]> {
    const { region = "us-en", safesearch = "moderate", page = 1 } = options;
    const vqd = await this._getVqd(query);

    const safeSearchMap: Record<string, string> = {
      on: "1",
      moderate: "1",
      off: "-1",
    };
    const params = new URLSearchParams({
      o: "json",
      q: query,
      l: region,
      vqd: vqd,
      p: safeSearchMap[safesearch.toLowerCase()] || "1",
      ct: "AT",
    });

    if (page > 1) {
      params.append("s", ((page - 1) * 100).toString());
    }

    const response = await fetch(
      `${this.IMAGE_ENDPOINT}?${params.toString()}`,
      {
        method: "GET",
        headers: this.HEADERS,
      },
    );

    if (!response.ok) this.throwError(`Image Search HTTP ${response.status}`);

    const json = await response.json();
    // @ts-ignore: Accessing results on unknown JSON response
    const rawResults = json.results || [];

    // deno-lint-ignore no-explicit-any
    return rawResults.map((item: any) => ({ ...item, type: "image" }));
  }

  /**
   * Performs a video search via the internal JSON API.
   */
  override async videos(
    query: string,
    options: SearchOptions = {},
  ): Promise<SearchResult[]> {
    const { region = "us-en", safesearch = "moderate", page = 1 } = options;
    const vqd = await this._getVqd(query);

    const safeSearchMap: Record<string, string> = {
      on: "1",
      moderate: "-1",
      off: "-2",
    };
    const params = new URLSearchParams({
      o: "json",
      q: query,
      l: region,
      vqd: vqd,
      p: safeSearchMap[safesearch.toLowerCase()] || "-1",
    });

    if (page > 1) {
      params.append("s", ((page - 1) * 60).toString());
    }

    const response = await fetch(
      `${this.VIDEO_ENDPOINT}?${params.toString()}`,
      {
        method: "GET",
        headers: this.HEADERS,
      },
    );

    if (!response.ok) this.throwError(`Video Search HTTP ${response.status}`);

    const json = await response.json();
    // @ts-ignore: Accessing results on unknown JSON response
    const rawResults = json.results || [];

    // deno-lint-ignore no-explicit-any
    return rawResults.map((item: any) => ({ ...item, type: "video" }));
  }

  /**
   * Performs a news search via the internal JSON API.
   */
  override async news(
    query: string,
    options: SearchOptions = {},
  ): Promise<SearchResult[]> {
    const { region = "us-en", safesearch = "moderate", timeLimit, page = 1 } =
      options;
    const vqd = await this._getVqd(query);

    const safeSearchMap: Record<string, string> = {
      on: "1",
      moderate: "-1",
      off: "-2",
    };
    const params = new URLSearchParams({
      o: "json",
      noamp: "1",
      q: query,
      l: region,
      vqd: vqd,
      p: safeSearchMap[safesearch.toLowerCase()] || "-1",
    });

    if (timeLimit) params.append("df", timeLimit);
    if (page > 1) params.append("s", ((page - 1) * 30).toString());

    const response = await fetch(
      `https://duckduckgo.com/news.js?${params.toString()}`,
      {
        method: "GET",
        headers: this.HEADERS,
      },
    );

    if (!response.ok) this.throwError(`News Search HTTP ${response.status}`);

    const json = await response.json();
    // @ts-ignore: Accessing results on unknown JSON response
    const rawResults = json.results || [];

    // deno-lint-ignore no-explicit-any
    return rawResults.map((item: any) => ({
      type: "news",
      date: item.date || "",
      title: item.title || "",
      body: item.excerpt || "",
      url: item.url || "",
      image: item.image || "",
      source: item.source || "",
    }));
  }
}
