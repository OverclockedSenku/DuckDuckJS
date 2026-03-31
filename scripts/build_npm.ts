// deno-lint-ignore-file
import { build, emptyDir } from "jsr:@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // This adds the 'fetch' shim so your library works in older Node versions
    deno: true,
    undici: true,
  },
  package: {
    // This is the actual package.json that will be generated
    name: "@overclockedsenku/duckduckjs",
    version: "26.1.0",
    description: "A fast, modular search engine scraper for Deno and Node.js.",
    license: "Apache-2.0",
    keywords: [
      "duckduckgo",
      "brave",
      "search",
      "scraper",
      "meta-search",
      "crawler",
      "deno",
      "typescript",
      "api",
      "duckduckjs",
    ],
    repository: {
      type: "git",
      url: "git+https://github.com/overclockedsenku/DuckDuckJS.git",
    },
    bugs: {
      url: "https://github.com/overclockedsenku/DuckDuckJS/issues",
    },
    // Map your dependencies from Deno to NPM
    devDependencies: {
      "@types/node": "^20.0.0",
    },
  },
  // Map your Deno imports to NPM equivalents
  mappings: {
    "npm:cheerio@^1.2.0": {
      name: "cheerio",
      version: "^1.2.0-rc.12",
    },
    // Add any other @std imports you are using here
  },
  postBuild() {
    // Copy the README and LICENSE to the npm folder
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
    Deno.copyFileSync(".npmrc", "npm/.npmrc");
  },
});
