/**
 * DuckDuckJS - A modular meta-search engine library.
 * This is the main entry point for the library.
 */

// Export the Base class for people building new engines
export { BaseSearchEngine } from "./src/core/base.ts";

// Export the specific Engines
export { DuckDuckGoEngine } from "./src/engine/duckduckgo.ts";
export { BraveEngine } from "./src/engine/brave.ts";

// Export Types so users get full IntelliSense
export type {
  ImageResult,
  NewsResult,
  SearchOptions,
  SearchResult,
  TextResult,
  VideoResult,
} from "./src/core/types.ts";
