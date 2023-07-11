// Imports
import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { Api } from "./api/index.ts";


// Constants
const
  app = new Application(),
  root = `${Deno.cwd()}/dist`,
  decoder = new TextDecoder("utf-8"),
  data = await Deno.readFile(root+'/index.html');

// Process

// Serve static files.
app.use(async (ctx, next) => {
  try { await ctx.send({ root, index: "index.html"}); }
  catch { next(); }
});

// add routes
const router = new Router();
router.get("/api/export",  async (ctx) => { ctx.response.body = myApi.json });
const myApi = new Api(router, 'api')
router.get("/:path/:resource?/:id?",  async (ctx) => { ctx.response.body = await decoder.decode(data) });

// After creating the router, we can add it to the app.
app.use(router.routes());
app.use(router.allowedMethods());

// run app
await app.listen({ port: 8000 });
