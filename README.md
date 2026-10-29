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

3. Install [Claude Code](https://claude.com/claude-code):

   ```sh
   curl -fsSL https://claude.ai/install.sh | bash
   ```

## Running the app

```sh
bun dev              # starts the app and prints its URL
bun run test         # runs the tests
bun run typecheck    # checks the types
```

## Running Claude with our account

We'll give you an API key on the day. Set it in your terminal, then start Claude from this folder:

```sh
export ANTHROPIC_API_KEY="the-key-we-give-you"
claude
```

- If Claude asks whether to use this API key, choose **Yes**.
- Run `/status` inside Claude to check it's using the API key, not your own account.

## What it does

- **Save** adds a savepoint named after the current time.
- **Restore** saves a "Before restoring" point, then rolls back to the savepoint you picked. Everything in between is shadowed (shown striped). Restoring to a shadowed savepoint brings it back.
- Your changes are saved in the browser, so they are still there after a refresh. To go back to the example data, run `localStorage.removeItem('history-pane')` in the browser console and refresh.
