import express from "https://esm.sh/express?target=denonext";
const app = express();
app.use(express.static('/dist'))
app.get("/api", (req, res) => {
  res.send("Hello from Deno Deploy!");
});
app.get("*", (req, res) => {
  res.send("/dist/");
});
app.listen(8080);
