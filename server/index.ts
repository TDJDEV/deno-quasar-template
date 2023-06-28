import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";
// import { Application, Router } from "https://deno.land/x/abc@v1.3.3/mod.ts";
const
  app = new Application(),
  root = `${Deno.cwd()}/dist`
  routeBool = {
    true(resource, target){ return {body: { time: new Date().toISOString() }}  },
    async false(ctx){ return {body: await ctx.send({ path: root+'/index.html`}), type: "text/html"}  }
  };

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
  const res = await routeBool[ctx.params.path === "api"](ctx)
  console.log(res)
  Object.entries(res).forEach(async([key,val])=>{
    ctx.response[key] = val
    console.log(key, ' => ',ctx.response[key])
  });
});

// After creating the router, we can add it to the app.
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
