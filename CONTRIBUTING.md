# Contributing to DuckDuckJS

First of all, thanks for checking out the project. DuckDuckJS is built to be a
fast, modular, and resilient meta-search infrastructure. Whether you're fixing a
regex in a scraper or adding a whole new search engine, your help is
appreciated.

## Development Setup

Since this is a **Deno-first** project, setup is nearly zero.

1. **Install Deno:** Ensure you have the latest version of Deno installed.
2. **Fork & Clone:**
   ```bash
   git clone https://github.com/overclockedsenku/DuckDuckJS.git
   cd DuckDuckJS
   ```
3. **No Install Step:** There is no `npm install`. Deno handles dependencies
   automatically when you run the code.

---

## Project Architecture

To keep the codebase clean, we follow a strict separation of concerns:

- **`src/core/`**: Shared interfaces and the `BaseEngine` abstract class. Do not
  put engine-specific logic here.
- **`src/engine/`**: The "Drivers." Each file should export a single class
  extending `BaseEngine`.
- **`src/cli.ts`**: The entry point. It handles argument parsing and
  pretty-printing.

---

## Roadmap Contributions

We are currently looking for help with the following roadmap items:

- **New Engines:** Implementation for Bing, Google, Brave, etc.
- **Wrappers:** Building out the **MCP (Model Context Protocol)** server and the
  **Hono-based HTTP server**.
- **AI Chat:** Porting the `duckchat` logic for no-key LLM interaction.

If you want to tackle one of these, open an issue first so we can sync on the
implementation details.

---

## Branching & Release Strategy

We use a "Live Dev" branching model:

- **`main`**: This is the primary development branch. All Pull Requests should
  be targeted here.
- **Releases**: When a version is ready, a new branch will be created following
  the `Year.Patch` format (e.g., `26.0`, `26.1`). These branches represent
  stable snapshots of the library for that period.

---

## Code Style & Quality

We use Deno's built-in tooling to keep the style clean and readable.

- **Formatting:** Run `deno fmt` before committing.
- **Linting:** Run `deno lint` to catch common mistakes.
- **Type Safety:** We use strict TypeScript. Avoid `any` unless you are dealing
  with raw, unpredictable JSON from a scraper (and even then, try to map it to
  an interface immediately).

### Commit Messages

We prefer **Conventional Commits**:

- `feat: add Bing search engine`
- `fix: update DDG regex for VQD token`
- `docs: update roadmap in README`

---

## Testing

For now, we rely on **manual CLI verification**. Before submitting a PR, ensure
your changes work as expected by running the CLI against live endpoints:

```bash
# Test your new engine or feature via the CLI
deno run -A src/cli.ts "Your Query" --engine your-new-engine
```

---

## Licensing & Attribution

By contributing to DuckDuckJS, you agree that your contributions will be
licensed under the **Apache License 2.0**.

- **Attribution:** Ensure you include the standard Apache header at the top of
  any new `.ts` files.
- **Respect Original Authors:** This project is a reboot of the Python `ddgs`
  library by **deedy5**. Keep the attribution in the comments when porting
  logic.

---

## Questions?

If you're unsure about an architectural change, open a **GitHub Discussion** or
an **Issue**. Let's talk it out on the whiteboard first.

**Stay bold. Happy hacking.**
