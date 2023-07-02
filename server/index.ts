// Imports
import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { Api } from "./api.ts";

// Classes


// Functions
function log(x){ return console.log(x),x };
// function storeAction(name,action,...args){ return ((collection)=>collection&&collection[action](...args))(getCollection(name, action === "create")) };
// function getCollection(name, create){ return store[name]||(create ? (store[name]=new Collection(name)): null) };

// Constants
const
  app = new Application(),
  root = `${Deno.cwd()}/dist`,
  decoder = new TextDecoder("utf-8"),
  data = await Deno.readFile(root+'/index.html'),
  store = new Store,
  api = {
    create(key:string)            { return { msg: store.action(key,'create')} },
    read(key:string,id:string)    { return        store.action(key,'read',{id}) || { msg: 'not found'} },
    update(key:string,id:string)  { return { msg: store.action(key,'update',id)} },
    delete(key:string,id:string)  { return { msg: store.action(key,'delete',id)} }
  };

// Process

// First we try to serve static files from the _site folder. If that fails, we
// fall through to the router below.
app.use(async (ctx, next) => {
  try { await ctx.send({ root, index: "index.html"}); }
  catch { next(); }
});

const router = new Router();

// router.get("/api/resources",          async (ctx) => { ctx.response.body = await                              store.collections});
// router.post("/api/:resource",         async (ctx) => { ctx.response.body = await                              api.create(ctx.params.resource) });
// router.get("/:path/:resource?/:id?",  async (ctx) => { ctx.response.body = await ctx.params.path === "api" ?  api.read(ctx.params.resource,ctx.params.id) : decoder.decode(data) });
// router.put("/api/:resource/:id",      async (ctx) => { ctx.response.body = await                              api.update(ctx.params.resource,ctx.params.id) });
// router.delete("/api/:resource/:id",   async (ctx) => { ctx.response.body = await                              api.delete(ctx.params.resource,ctx.params.id) });

router.get("/api/export",  async (ctx) => { ctx.response.body = myApi.json });
const myApi = new Api({router, path: 'api'})
router.get("/:path/:resource?/:id?",  async (ctx) => { ctx.response.body = await decoder.decode(data) });

// After creating the router, we can add it to the app.
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
