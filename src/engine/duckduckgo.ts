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
import type {
  ImageResult,
  NewsResult,
  SearchOptions,
  SearchResult,
  VideoResult,
} from "../core/types.ts";

export class DuckDuckGoEngine extends BaseEngine {
  readonly name = "DuckDuckGo";

  // Base endpoints
  private readonly HTML_ENDPOINT = "https://html.duckduckgo.com/html/";
  private readonly IMAGE_ENDPOINT = "https://duckduckgo.com/i.js";
  private readonly VIDEO_ENDPOINT = "https://duckduckgo.com/v.js";

  // Standardize the headers so DDG thinks we are a normal Chrome user
  private readonly HEADERS = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  };

  /**
   * THE SECRET SAUCE.
   * DDG's JSON endpoints (images, videos, news, chat) require a Verification Query Definition (VQD) token.
   * We get this by simulating a normal search on their homepage and parsing it out of the raw HTML bytes.
   */
  private async _getVqd(query: string): Promise<string> {
    const response = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      {
        headers: this.HEADERS,
      },
    );

    if (!response.ok) {
      this.throwError(`VQD Fetch Failed: HTTP ${response.status}`);
    }

    const htmlText = await response.text();

    // DDG dynamically injects the VQD in a few formats (vqd="...", vqd='...', or vqd=...).
    // This regex catches all three variants safely.
    const match = htmlText.match(/vqd=(["']?)([^"'&]+)\1/);
    if (!match || !match[2]) {
      this.throwError(
        "Could not extract VQD token. DDG might have updated their bot defenses.",
      );
    }

    return match[2];
  }

  // ==========================================================================
  // 1. Text Search (HTML Fallback)
  // ==========================================================================
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
        results.push({ title, href, body });
      }
    });

    return results.filter((res) =>
      !res.href.startsWith("https://duckduckgo.com/y.js?")
    );
  }

  // ==========================================================================
  // 2. Image Search (JSON API)
  // ==========================================================================
  async images(
    query: string,
    options: SearchOptions = {},
  ): Promise<ImageResult[]> {
    const { region = "us-en", safesearch = "moderate", page = 1 } = options;

    // Step 1: Steal the token
    const vqd = await this._getVqd(query);

    // Step 2: Build the GET payload
    const safeSearchMap: Record<string, string> = {
      on: "1",
      moderate: "1",
      off: "-1",
    };

    const params = new URLSearchParams({
      o: "json", // Request JSON response
      q: query, // The query
      l: region, // Locale
      vqd: vqd, // The verification token
      p: safeSearchMap[safesearch.toLowerCase()] || "1",
      ct: "AT", // Client type (expected by API)
    });

    // Image API pagination offset
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

    // Step 3: Parse and map the JSON directly
    const json = await response.json();
    const results: ImageResult[] = json.results || [];

    return results;
  }

  // ==========================================================================
  // 3. Video Search (JSON API)
  // ==========================================================================
  async videos(
    query: string,
    options: SearchOptions = {},
  ): Promise<VideoResult[]> {
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
    return json.results || [];
  }

  // ==========================================================================
  // 4. News Search (JSON API)
  // ==========================================================================
  async news(
    query: string,
    options: SearchOptions = {},
  ): Promise<NewsResult[]> {
    const { region = "us-en", safesearch = "moderate", timeLimit, page = 1 } =
      options;

    // Step 1: Grab the bouncer's wristband (VQD token)
    const vqd = await this._getVqd(query);

    // Notice the different mapping here compared to the Image API
    const safeSearchMap: Record<string, string> = {
      on: "1",
      moderate: "-1",
      off: "-2",
    };

    const params = new URLSearchParams({
      o: "json",
      noamp: "1", // Tell DDG we don't want Google AMP garbage links
      q: query,
      l: region,
      vqd: vqd,
      p: safeSearchMap[safesearch.toLowerCase()] || "-1",
    });

    if (timeLimit) {
      params.append("df", timeLimit);
    }

    if (page > 1) {
      // News pagination jumps by 30
      params.append("s", ((page - 1) * 30).toString());
    }

    const response = await fetch(
      `https://duckduckgo.com/news.js?${params.toString()}`,
      {
        method: "GET",
        headers: this.HEADERS,
      },
    );

    if (!response.ok) this.throwError(`News Search HTTP ${response.status}`);

    const json = await response.json();
    const rawResults = json.results || [];

    // Step 3: Map the response to our strict interface
    // TODO Fix usage of any
    return rawResults.map((item: any) => ({
      date: item.date || "",
      title: item.title || "",
      body: item.excerpt || "", // Map 'excerpt' to 'body' for CLI consistency
      url: item.url || "",
      image: item.image || "",
      source: item.source || "",
    }));
  }
}
