import index from './index.html';

const server = Bun.serve({
  // 0 means: use any free port.
  port: 0,
  routes: {
    '/': index,
    // A pretend analytics server. It accepts anything and says OK.
    '/analytics': { POST: () => new Response(null, { status: 200 }) },
  },
  development: { hmr: true },
});

console.log(`Running at ${server.url}`);
