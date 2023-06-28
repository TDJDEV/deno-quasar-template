// Imports
import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";

// Functions
function api(resource, target){ return {time: new Date().toISOString()} };

// Constants
const
  app = new Application(),
  root = `${Deno.cwd()}/dist`,
  decoder = new TextDecoder("utf-8"),
  data = await Deno.readFile(root+'/index.html');

// Process

// First we try to serve static files from the _site folder. If that fails, we
// fall through to the router below.
app.use(async (ctx, next) => {
  try { await ctx.send({ root, index: "index.html"}); }
  catch { next(); }
});

const router = new Router();

router.get("/:path/:ressource?/:id?", async (ctx) => { ctx.response.body = await ctx.params.path === "api" ?  api() : decoder.decode(data) });

// After creating the router, we can add it to the app.
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
