import express from "https://esm.sh/express?target=denonext";
const app = express();
app.use(express.static('/dist'))
app.use(express.static('/public'))

app.get("/api", (req, res) => {
  res.send("Hello from Deno Deploy!");
});
app.get("*", (req, res) => {
  res.sendFile("../dist/index.html");
});
app.listen(8080);
