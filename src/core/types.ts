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

export type SearchResult = TextResult | ImageResult | VideoResult | NewsResult;

/**
 * Common configuration options available across all engines.
 */
export interface SearchOptions {
  /** * Regional locale string (e.g., 'us-en', 'uk-en').
   * Defaults generally fall back to 'us-en'.
   */
  region?: string;

  /** Timeframe filter for recent results */
  timeLimit?: "d" | "w" | "m" | "y";

  /** * Pagination offset.
   * Note: Different engines handle pagination math differently internally.
   */
  page?: number;

  /**
   * SafeSearch filter for explicit content.
   * 'on': Strict filtering (default for most engines).
   * 'moderate': Filter most explicit content.
   * 'off': No filtering.
   */
  safesearch?: "on" | "moderate" | "off";
}

/**
 * Standardized shape for all text based search results.
 */
export interface TextResult {
  type: "text";
  title: string;
  href: string;
  body: string;
}

/**
 * Standardized shape for all image based search results.
 */
export interface ImageResult {
  type: "image";
  title: string;
  image: string; // Direct high-res image link
  thumbnail: string;
  url: string; // The website hosting the image
  height: number;
  width: number;
  source: string;
}

/**
 * Standardized shape far all video based search results.
 */
export interface VideoResult {
  type: "video";
  title: string;
  description: string;
  content: string; // Direct link to the video (e.g., YouTube URL)
  duration: string;
  embed_html: string;
  publisher: string;
  statistics: { viewCount?: number };
}

/**
 * Standardized shape far all news based search results.
 */
export interface NewsResult {
  type: "news";
  date: string;
  title: string;
  body: string;
  url: string;
  image: string;
  source: string;
}
