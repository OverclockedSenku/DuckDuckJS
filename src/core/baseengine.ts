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
 * The core blueprint for all DuckDuckJS search engines.
 * Any new engine (Google, Bing, etc.) must extend this class and
 * implement the `search` method at a minimum.
 */
export abstract class BaseEngine {
  /** * The unique identifier for the engine (e.g., "DuckDuckGo").
   * Useful for logging and routing in multi-engine setups.
   */
  abstract readonly name: string;

  /**
   * Standardized error thrower.
   * Prefixes errors with the engine name so parallel scraping failures
   * are easy to trace in the console.
   */
  protected throwError(message: string): never {
    throw new Error(`[${this.name}] ${message}`);
  }

  /**
   * Executes the standard text search query.
   * REQUIRED for all engines.
   */
  abstract search(
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResult[]>;

  /**
   * Optional: Executes an image search.
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
   * Optional: Executes a video search.
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
   * Optional: Executes a news search.
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
