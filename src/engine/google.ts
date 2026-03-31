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
 * Generates a randomized Android Google App User-Agent.
 * * Google heavily obfuscates and blocks standard desktop scrapers.
 * By spoofing a specific Android Google App client, Google serves a much
 * cleaner, lightweight, and easier-to-parse HTML structure.
 * * @returns A randomized mobile User-Agent string.
 */
function getGoogleUA(): string {
  const devices = [
    { ver: "5.0", dev: "SM-G900P Build/LRX21T", min: 39, max: 60 },
    { ver: "6.0", dev: "Nexus 5 Build/MRA58N", min: 39, max: 60 },
    { ver: "8.0", dev: "Pixel 2 Build/OPD3.170816.012", min: 39, max: 60 },
  ];

  const device = devices[Math.floor(Math.random() * devices.length)];
  const chromeMajor =
    Math.floor(Math.random() * (device.max - device.min + 1)) + device.min;
  const chromeBuild = Math.floor(Math.random() * 9000) + 1000;
  const chromePatch = Math.floor(Math.random() * 1000) + 1000;

  const ua =
    `Mozilla/5.0 (Linux; Android ${device.ver}; ${device.dev}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeMajor}.0.${chromeBuild}.${chromePatch} Mobile Safari/537.36`;
  return `${ua} GoogleApp/${Math.floor(Math.random() * 10)}`;
}

/**
 * Google Search Engine driver.
 * * This engine scrapes Google by forcing the mobile layout via User-Agent spoofing.
 * It bypasses heavy JS-rendered desktop layouts and extracts clean links.
 */
export class GoogleEngine extends BaseSearchEngine {
  readonly name = "Google";
  private readonly ENDPOINT = "https://www.google.com/search";

  /**
   * Performs a standard web search using the Google engine.
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

    const [country, lang] = region.toLowerCase().split("-");
    const safeSearchMap: Record<string, string> = {
      on: "2",
      moderate: "1",
      off: "0",
    };

    const params = new URLSearchParams({
      q: query,
      filter: safeSearchMap[safesearch.toLowerCase()] || "1",
      start: ((page - 1) * 10).toString(),
      hl: `${lang}-${country.toUpperCase()}`,
      lr: `lang_${lang}`,
      cr: `country${country.toUpperCase()}`,
    });

    if (timeLimit) {
      params.append("tbs", `qdr:${timeLimit}`);
    }

    const response = await fetch(`${this.ENDPOINT}?${params.toString()}`, {
      method: "GET",
      headers: {
        "User-Agent": getGoogleUA(),
        "Cookie": "CONSENT=YES+",
      },
    });

    if (!response.ok) {
      this.throwError(`HTTP ${response.status} - ${response.statusText}`);
    }

    const htmlText = await response.text();
    const $ = cheerio.load(htmlText);
    const results: SearchResult[] = [];

    // Target the specific mobile DOM layout provided to the Google App UA
    $("div[data-hveid]:has(h3)").each((_, element) => {
      const title = $(element).find("h3").first().text().trim();
      let href = $(element).find("a:has(h3)").first().attr("href") || "";

      // The snippet body is often nested deep in the last div child of the block
      const body = $(element).children("div").children("div").last().text()
        .trim();

      // Clean up Google's redirect wrapper (/url?q=...)
      if (href.startsWith("/url?q=")) {
        href = href.split("?q=")[1].split("&")[0];
        href = decodeURIComponent(href);
      }

      if (title && href && href.startsWith("http")) {
        results.push({ type: "text", title, href, body });
      }
    });

    return results;
  }
}
