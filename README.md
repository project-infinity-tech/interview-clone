# Before the interview

1. Ensure you have [Bun](https://bun.sh) installed:

   ```sh
   curl -fsSL https://bun.sh/install | bash
   ```

2. Ensure you have [Claude Code](https://claude.com/claude-code):

   ```sh
   curl -fsSL https://claude.ai/install.sh | bash
   ```

3. Install the dependencies of this repository

   ```sh
   bun install
   ```

# During the interview

## Run the app

This runs the app and prints out the url it's running on.

```sh
bun dev
```

## Running Claude code with our account

We'll give you an API key on the day. Set it in your terminal, then start Claude from this folder:

```sh
export ANTHROPIC_API_KEY="the-key-we-give-you"
claude
```

- If Claude asks whether to use this API key, choose **Yes**.
- You can run `/status` inside Claude to check it's using the API key, not your own account.
