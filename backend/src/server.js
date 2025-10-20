import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();
connectDB();

app.get("/", (req, res) => {
  console.log("HELLO FROM SERVER");
});

app.listen(ENV.PORT, () =>
  console.log(`app is running on http://localhost:${ENV.PORT}`)
);
