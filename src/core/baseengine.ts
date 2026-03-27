import type { SearchResult, SearchOptions } from "./types.ts";

/**
 * The core blueprint for all DuckDuckJS search engines.
 * Any new engine (Google, Bing, etc.) must extend this class and 
 * implement the `search` method.
 */
export abstract class BaseSearchEngine {
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
    options?: SearchOptions
  ): Promise<SearchResult[]>;
}