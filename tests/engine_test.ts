/**
 * DuckDuckJS - Integration Test Suite
 * Copyright 2026 Raj Dave (@overclockedsenku)
 * * This suite verifies engine health with a 3-try retry strategy.
 * Returns Exit Code 1 if any engine fails all retries.
 */
// deno-lint-ignore-file

import { DuckDuckGoEngine } from "../src/engine/duckduckgo.ts";
import { BraveEngine } from "../src/engine/brave.ts";
import { GoogleEngine } from "../src/engine/google.ts";
import { MojeekEngine } from "../src/engine/mojeek.ts";
import { YahooEngine } from "../src/engine/yahoo.ts";
import {
  blue,
  bold,
  cyan,
  gray,
  green,
  magenta,
  red,
  yellow,
} from "jsr:@std/fmt/colors";

// --- Types for Reporting ---

interface TestAttempt {
  attempt: number;
  timeTaken: number;
  error?: string;
  timestamp: string;
}

interface TestResult {
  engine: string;
  feature: string;
  status: "PASSED" | "FAILED" | "FLAKY";
  attempts: TestAttempt[];
  finalTry: number;
}

// --- Configuration ---

const RETRY_LIMIT = 3;
const TEST_QUERY = "OpenSource Software";
const COOL_DOWN_MS = 1500; // Wait between retries to avoid IP flagging

const engines = [
  new DuckDuckGoEngine(),
  new BraveEngine(),
  new GoogleEngine(),
  new MojeekEngine(),
  new YahooEngine(),
];

const reports: TestResult[] = [];

// --- Helper: Cooldown ---
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The core test runner with retry logic.
 */
async function runTest(engine: any, feature: string, method: string) {
  const attempts: TestAttempt[] = [];
  let status: "PASSED" | "FAILED" | "FLAKY" = "FAILED";
  let success = false;

  console.log(bold(blue(`\n[STARTING] ${engine.name} -> ${feature}`)));

  for (let i = 1; i <= RETRY_LIMIT; i++) {
    const start = performance.now();
    const timestamp = new Date().toLocaleTimeString();

    try {
      // Execute the dynamic method (e.g., engine.images("query"))
      const results = await engine[method](TEST_QUERY);

      const end = performance.now();
      const duration = Math.round(end - start);

      if (!results || results.length === 0) {
        throw new Error("Received empty results array");
      }

      attempts.push({ attempt: i, timeTaken: duration, timestamp });
      console.log(green(`  ✓ Attempt ${i}: Success (${duration}ms)`));

      success = true;
      status = i === 1 ? "PASSED" : "FLAKY";
      break;
    } catch (err: any) {
      const end = performance.now();
      const duration = Math.round(end - start);

      attempts.push({
        attempt: i,
        timeTaken: duration,
        error: err.message,
        timestamp,
      });

      console.log(
        red(`  ✕ Attempt ${i}: Failed - ${err.message} (${duration}ms)`),
      );

      if (i < RETRY_LIMIT) {
        console.log(gray(`      Retrying in ${COOL_DOWN_MS}ms...`));
        await sleep(COOL_DOWN_MS);
      }
    }
  }

  reports.push({
    engine: engine.name,
    feature,
    status,
    attempts,
    finalTry: attempts.length,
  });
}

// --- Main Execution ---

async function main() {
  console.log(bold(magenta("===============================================")));
  console.log(bold(magenta("       DuckDuckJS BETA TEST RUNNER             ")));
  console.log(bold(magenta("===============================================")));

  for (const engine of engines) {
    // 1. Always test standard Text Search
    await runTest(engine, "Text Search", "search");

    // 2. Test Media features if the engine supports them
    // We check if the method is overridden and doesn't just return the "Not Supported" fallback
    if (engine.name === "DuckDuckGo") {
      await runTest(engine, "Image Search", "images");
      await runTest(engine, "Video Search", "videos");
      await runTest(engine, "News Search", "news");
    }
  }

  // --- Final Report Generation ---

  console.log(
    bold(cyan("\n\n===============================================")),
  );
  console.log(bold(cyan("             FINAL QUALITY REPORT              ")));
  console.log(bold(cyan("===============================================")));

  let overallFailure = false;

  reports.forEach((r) => {
    const icon = r.status === "PASSED"
      ? green("●")
      : r.status === "FLAKY"
      ? yellow("●")
      : red("●");
    console.log(
      `${icon} ${bold(r.engine.padEnd(12))} | ${r.feature.padEnd(15)} | ${
        bold(r.status)
      }`,
    );

    r.attempts.forEach((at) => {
      const time = gray(`${at.timeTaken}ms`);
      if (at.error) {
        console.log(
          gray(
            `   └─ Try ${at.attempt}: [${at.timestamp}] ERROR: ${at.error} (${time})`,
          ),
        );
      } else {
        console.log(
          gray(`   └─ Try ${at.attempt}: [${at.timestamp}] SUCCESS (${time})`),
        );
      }
    });

    if (r.status === "FAILED") overallFailure = true;
  });

  console.log(bold(cyan("===============================================")));

  if (overallFailure) {
    console.log(
      red(bold("\n🚨 CI/CD STATUS: FAILED (Critical Engine Failure)")),
    );
    Deno.exit(1);
  } else {
    console.log(green(bold("\n✅ CI/CD STATUS: PASSED")));
    Deno.exit(0);
  }
}

main();
