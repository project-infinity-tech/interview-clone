# History pane

A small copy of the editor's History pane. The data lives in a Zustand store (`src/store/historyStore.ts`), and it resets every time the page loads.

## Prerequisites

1. Install [Bun](https://bun.sh):

   ```sh
   curl -fsSL https://bun.sh/install | bash
   ```

2. Install the dependencies:

   ```sh
   bun install
   ```

3. Install [Claude Code](https://claude.com/claude-code). We'll give you an API key to use on the day.

   ```sh
   curl -fsSL https://claude.ai/install.sh | bash
   ```

## Running

```sh
bun dev              # starts the app at http://localhost:3000
bun run test         # runs the tests
bun run typecheck    # checks the types
```

## What it does

- **Save** adds a savepoint named after the current time.
- **Restore** saves a "Before restoring" point, then rolls back to the savepoint you picked. Everything in between is shadowed (shown striped). Restoring to a shadowed savepoint brings it back.
- The collapse and close buttons in the header do nothing.
