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

// deno-lint-ignore-file require-await

import type { SearchOptions, SearchResult } from "./types.ts";

/**
 * The foundation for all search engine drivers.
 * Extending this class ensures your engine integrates correctly with the
 * CLI and system wrappers.
 */
export abstract class BaseSearchEngine {
  /** * The display name of the engine (e.g., "Brave").
   * This is used for labeling results and prefixing errors.
   */
  abstract readonly name: string;

  /**
   * Internal helper to throw standardized errors.
   * Helps users identify which specific engine failed during parallel searches.
   * * @example throwError("Rate limit exceeded") // throws "[EngineName] Rate limit exceeded"
   * @throws {Error} Prefixed with the engine name.
   */
  protected throwError(message: string): never {
    throw new Error(`[${this.name}] ${message}`);
  }

  /**
   * The primary text search method. Every engine must implement this.
   * * @param query The search term.
   * @param options Optional filters like region or time limit.
   * @returns An array of TextResult objects.
   */
  abstract search(
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResult[]>;

  /**
   * Fetches image results.
   * If not overridden, it returns a "System" result stating it's not supported.
   * * @returns An array of ImageResult objects.
   */
  async images(
    _query: string,
    _options?: SearchOptions,
  ): Promise<SearchResult[]> {
    return [
      {
        type: "image",
        title: `Images not supported by ${this.name}`,
        image: "No image link",
        thumbnail: "No thumbnail",
        url: "N/A",
        height: 0,
        width: 0,
        source: "DuckDuckJS System",
      },
    ];
  }

  /**
   * Fetches video results.
   * If not overridden, it returns a "System" result stating it's not supported.
   * * @returns An array of VideoResult objects.
   */
  async videos(
    _query: string,
    _options?: SearchOptions,
  ): Promise<SearchResult[]> {
    return [
      {
        type: "video",
        title: `Videos not supported by ${this.name}`,
        description: "This engine does not implement video search.",
        content: "N/A",
        duration: "0:00",
        embed_html: "",
        publisher: "DuckDuckJS System",
        statistics: {},
      },
    ];
  }

  /**
   * Fetches news articles.
   * If not overridden, it returns a "System" result stating it's not supported.
   * * @returns An array of NewsResult objects.
   */
  async news(
    _query: string,
    _options?: SearchOptions,
  ): Promise<SearchResult[]> {
    return [
      {
        type: "news",
        date: new Date().toISOString().split("T")[0],
        title: `News not supported by ${this.name}`,
        body: "This engine does not implement news search.",
        url: "N/A",
        image: "",
        source: "DuckDuckJS System",
      },
    ];
  }
}
