import { Application } from "https://deno.land/x/abc@v1.3.3/mod.ts";

const app = new Application();

console.log("http://localhost:8080/");

app
  .get("/hello", (c) => {
  return "Hello, Abc!";
  })
  .get("/", (c) => {
  return "Hello, Abc!";
  })
  .start({ port: 80 });