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

/**
 * A union of all possible result types. Use the `type` property
 * to narrow down the specific result shape in your logic.
 */
export type SearchResult = TextResult | ImageResult | VideoResult | NewsResult;

/**
 * Global filters used to tune search results across different engines.
 * Note that individual engines might ignore certain options if their
 * upstream backend doesn't support them.
 */
export interface SearchOptions {
  /** * Regional locale (e.g., 'us-en', 'uk-en').
   * If not provided, engines typically default to 'us-en'.
   */
  region?: string;

  /** * Filter results by time.
   * 'd' (day), 'w' (week), 'm' (month), 'y' (year).
   */
  timeLimit?: "d" | "w" | "m" | "y";

  /** * The page offset.
   * Since engines calculate pagination differently (some by items, some by index),
   * this is abstracted to a simple page number.
   */
  page?: number;

  /**
   * Filter explicit content.
   * Defaults to 'moderate' for most drivers.
   */
  safesearch?: "on" | "moderate" | "off";
}

/**
 * Standard web search result containing a title, link, and snippet.
 */
export interface TextResult {
  type: "text";
  title: string;
  href: string;
  body: string;
}

/**
 * Result shape for image searches.
 * Includes both the high-res source and a smaller thumbnail.
 */
export interface ImageResult {
  type: "image";
  title: string;
  image: string;
  thumbnail: string;
  url: string;
  height: number;
  width: number;
  source: string;
}

/**
 * Result shape for video searches.
 * Usually includes metadata like duration and embeddable HTML.
 */
export interface VideoResult {
  type: "video";
  title: string;
  description: string;
  content: string;
  duration: string;
  embed_html: string;
  publisher: string;
  statistics: { viewCount?: number };
}

/**
 * Result shape for news articles.
 * Includes publication date and the original news source name.
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
