import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";
// import { Application, Router } from "https://deno.land/x/abc@v1.3.3/mod.ts";
function api(resource, target){ return {time: new Date().toISOString()} };
const
  app = new Application(),
  root = `${Deno.cwd()}/dist`;

// First we try to serve static files from the _site folder. If that fails, we
// fall through to the router below.
app.use(async (ctx, next) => {
  try {
    await ctx.send({
      root,
      index: "index.html",
    });
  } catch {
    next();
  }
});

const router = new Router();

// The /api/time endpoint returns the current time in ISO format.
router.get("/:path/:ressource?/:id?", async (ctx) => {
  ctx.params.path === "api" ? (ctx.response.body = await  api()) : ctx.send({
      root,
      index: "index.html",
      path: '/index.html'
  })
  console.log(ctx.response.body)
});

// After creating the router, we can add it to the app.
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
// await app.start({ port: 8000 });
