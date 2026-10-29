# History pane

A small copy of the editor's History pane. The data lives in a Zustand store (`src/store/historyStore.ts`), and it resets every time the page loads.

```sh
bun install
bun dev        # http://localhost:3000
bun run test
bun run typecheck
```

- **Save** adds a savepoint named after the current time.
- **Restore** saves a "Before restoring" point, then rolls back to the savepoint you picked. Everything in between is shadowed (shown striped). Restoring to a shadowed savepoint brings it back.
- The collapse and close buttons in the header do nothing.
