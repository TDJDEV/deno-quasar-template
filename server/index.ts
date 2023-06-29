// Imports
import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";

// Functions
// function api(resource, target){ return {time: new Date().toISOString()} };

// Constants
const
  app = new Application(),
  root = `${Deno.cwd()}/dist`,
  decoder = new TextDecoder("utf-8"),
  data = await Deno.readFile(root+'/index.html'),
  store = {},
  api = {
    create(key:string){ return (store[key] || (store[key]=new Map)).set(`${key}-${store[key].lenght}`, { id:`${key}-${store[key].lenght}`, collection:key, time:new Date().toISOString()}) },
    read(key:string,id:string){ return id ? store[key]?.get(id) : store[key]?.values() },
    update(key:string,id:string){ return store[key]?.set(id,{ id, collection:key, time:new Date().toISOString()})},
    delete(key:string,id:string){ return {msg: store[key]?.delete(id) ? `item id:${id} has been removed`: `error: cannot remove item id:${id}`} }
  };

// Process

// First we try to serve static files from the _site folder. If that fails, we
// fall through to the router below.
app.use(async (ctx, next) => {
  try { await ctx.send({ root, index: "index.html"}); }
  catch { next(); }
});

const router = new Router();

router.get("/api/resources",          async (ctx) => { ctx.response.body = await                              Object.keys(store)});
router.post("/api/:resource/",        async (ctx) => { ctx.response.body = await                              api.create(ctx.params.ressource) });
router.get("/:path/:resource?/:id?",  async (ctx) => { ctx.response.body = await ctx.params.path === "api" ?  api.read(ctx.params.ressource,ctx.params.id) : decoder.decode(data) });
router.put("/api/:resource/:id",      async (ctx) => { ctx.response.body = await                              api.update(ctx.params.ressource,ctx.params.id) });
router.delete("/api/:resource/:id",   async (ctx) => { ctx.response.body = await                              api.delete(ctx.params.ressource,ctx.params.id) });

// After creating the router, we can add it to the app.
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
