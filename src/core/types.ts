/**
 * Standardized shape for all search engine results.
 * Engines must map their raw DOM/JSON responses to this format.
 */
export interface SearchResult {
  title: string;
  href: string;
  body: string;
}

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

export interface ImageResult {
  title: string;
  image: string;      // Direct high-res image link
  thumbnail: string;
  url: string;        // The website hosting the image
  height: number;
  width: number;
  source: string;
}

export interface VideoResult {
  title: string;
  description: string;
  content: string;    // Direct link to the video (e.g., YouTube URL)
  duration: string;
  embed_html: string;
  publisher: string;
  statistics: { viewCount?: number };
}

export interface NewsResult {
  date: string;
  title: string;
  body: string;
  url: string;
  image: string;
  source: string;
}