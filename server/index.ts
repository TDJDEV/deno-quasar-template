import express from "https://esm.sh/express?target=denonext";
const app = express();
const current = Deno.cwd();
app.use(express.static(current+'/dist'))
console.log(current);
app.get("/api", (req, res) => {
  res.send("Hello from Deno Deploy!");
});
app.use(function(req,res) {res.sendFile(current+"dist/index.html")}
app.listen(8080);
