import express, { json } from "express";
import { scrapper } from "./controller/scrapper.controller";

const app = express();
app.use(json());
app.get("/api/scrape", scrapper);

app.listen(8000, () => {
  console.log("App is running on PORT 8000");
});
