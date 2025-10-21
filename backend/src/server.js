import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(clerkMiddleware());

app.get("/", (req, res) => {
  console.log("HELLO FROM SERVER");
});

app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes)

app.use((err, req, res) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () =>
      console.log(`app is running on http://localhost:${ENV.PORT}`)
    );
  } catch (error) {
    console.log("there is an error");
    process.exit(1);
  }
};

startServer();
