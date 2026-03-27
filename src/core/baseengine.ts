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

import type { SearchOptions, SearchResult } from "./types.ts";

/**
 * The core blueprint for all DuckDuckJS search engines.
 * Any new engine (Google, Bing, etc.) must extend this class and
 * implement the `search` method.
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
   * Executes the search query and maps the response to standard SearchResults.
   */
  abstract search(
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResult[]>;
}
