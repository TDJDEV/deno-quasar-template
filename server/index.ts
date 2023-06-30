// Imports
import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";

// Classes
class Collection{
  #__name__
  #__data__
  #__chars__
  #__i__
  constructor(name){
    this.#__name__ = name
    this.#__data__ = new Map
    this.#__chars__ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.#__i__ = 0
  }
  get name() { return this.#__name__ }
  create(){ return this.#createRecord(this.#__data__, this.#__name__, this.#createUID()) }
  read(id:string, filters:any)   { return id ? this.#__data__?.get(id) : this.#filter(this.#toArray(this.#__data__?.values()), filters) }
  update(id:string) { return this.#patchRecord(this.#__data__.get(id)) ? `item id:${id} has been updated`: `error: cannot update item id:${id}`}
  patch(id:string)  { return this.#__data__.get(id) ? `item id:${id} has been patched`: `error: cannot patch item id:${id}` }
  delete(id:string) { return this.#__data__.delete(id) ? `item id:${id} has been removed`: `error: cannot remove item id:${id}`}
  
  #createRecord(table,collection,id){ return table.set(id,{ id, collection, createAt:new Date().toISOString()}) ? `new item has been created with id:${id}`:`error: cannot create new item` }
  #patchRecord(record){ return record && (record.updatedAt = new Date().toISOString()) };
  #createUID(){ return ((char,charLen)=>(new Array(7)).fill().reduce((id)=>log(id+char.charAt(Math.floor(Math.random() * charLen))),this.#__i__++))(this.#__chars__,this.#__chars__.length) }
  #toArray(item){ return item && [...item] };
  #filter(data, filters){ return filters ? ((filters)=>data.filter(record => filters.every(([key,val])=>record[key]==val)))(Object.entries(filters)) : data }
}

// Functions
function log(x){ return console.log(x),x };
function storeAction(name,action,...args){ return ((collection)=>collection&&collection[action](...args))(getCollection(name, action === "create")) };
function getCollection(name, create){ return store[name]||(create ? (store[name]=new Collection(name)): null) };

// Constants
const
  app = new Application(),
  root = `${Deno.cwd()}/dist`,
  decoder = new TextDecoder("utf-8"),
  data = await Deno.readFile(root+'/index.html'),
  store = {},
  api = {
    create(key:string)            { return { msg: storeAction(key,'create')} },
    read(key:string,id:string)    { return        storeAction(key,'read',{id}) || { msg: 'not found'} },
    update(key:string,id:string)  { return { msg: storeAction(key,'update',id)} },
    delete(key:string,id:string)  { return { msg: storeAction(key,'delete',id)} }
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
router.post("/api/:resource",         async (ctx) => { ctx.response.body = await                              api.create(ctx.params.resource) });
router.get("/:path/:resource?/:id?",  async (ctx) => { ctx.response.body = await ctx.params.path === "api" ?  api.read(ctx.params.resource,ctx.params.id) : decoder.decode(data) });
router.put("/api/:resource/:id",      async (ctx) => { ctx.response.body = await                              api.update(ctx.params.resource,ctx.params.id) });
router.delete("/api/:resource/:id",   async (ctx) => { ctx.response.body = await                              api.delete(ctx.params.resource,ctx.params.id) });

// After creating the router, we can add it to the app.
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
