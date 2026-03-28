// deno-lint-ignore-file
import { DuckDuckGoEngine } from "jsr:@overclockedsenku/duckduckjs@26.0.0-beta";

const ddg = new DuckDuckGoEngine();
const results = await ddg.search("Deno 2.0");
console.log(results[0]);
