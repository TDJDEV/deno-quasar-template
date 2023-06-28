// import express from "https://esm.sh/express?target=denonext";
// const app = express();
// const current = Deno.cwd();
// app.use(express.static(current+'/dist'))
// console.log(current);
// app.get("/api", (req, res) => {
//   res.send("Hello from Deno Deploy!");
// });
// // app.use((req,res) => {res.sendFile(current+"dist/index.html")})
// app.listen(8080);

import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";
const app = new Application();

// First we try to serve static files from the _site folder. If that fails, we
// fall through to the router below.
app.use(async (ctx, next) => {
  try {
    await ctx.send({
      root: `${Deno.cwd()}/dist`,
      index: "index.html",
    });
  } catch {
    next();
  }
});

const router = new Router();

// The /api/time endpoint returns the current time in ISO format.
router.get("/:path/:ressource?/:id?", async (ctx) => {
  ctx.params.path === "api"
    ? (ctx.response.body = { time: new Date().toISOString() })
    : await ctx.send(`${Deno.cwd()}/dist/index.html`)
});

// After creating the router, we can add it to the app.
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
