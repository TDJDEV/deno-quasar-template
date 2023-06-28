import express from "https://esm.sh/express?target=denonext";
const app = express();
const current = Deno.cwd();
function api(resource, target){ return { time: new Date().toISOString() } }
app.use(express.static(current+'/dist'))
console.log(current);
// app.get("/:path/:ressource?/:id?", (req, res) => {
//   req.params.path === "api" ? res.send(api()) : res.sendFile(current+'/dist/index.html');
// });
app.listen(8080);

// import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";
// const
//   app = new Application(),
//   routeBool = {
//     true(resource, target){ return {body: { time: new Date().toISOString() }}  },
//     async false(){ return {body: await Deno.readTextFile(`${Deno.cwd()}/dist/index.html`), type: "text/html"}  }
//   };

// // First we try to serve static files from the _site folder. If that fails, we
// // fall through to the router below.
// app.use(async (ctx, next) => {
//   try {
//     await ctx.send({
//       root: `${Deno.cwd()}/dist`,
//       index: "index.html",
//     });
//   } catch {
//     next();
//   }
// });

// const router = new Router();

// // The /api/time endpoint returns the current time in ISO format.
// router.get("/:path/:ressource?/:id?", async (ctx) => {
//   const res = await routeBool[ctx.params.path === "api"]()
//   console.log(res)
//   Object.entries(res).forEach(async([key,val])=>{
//     ctx.response[key] = val
//     console.log(key, ' => ',ctx.response[key])
//   });
// });

// // After creating the router, we can add it to the app.
// app.use(router.routes());
// app.use(router.allowedMethods());

// await app.listen({ port: 8000 });
