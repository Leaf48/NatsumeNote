import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { prisma } from "./repository/db.js";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/note.js";

const app = new Hono();
app.use("*", cors());

app.route("/auth", authRoutes);
app.route("/note", noteRoutes);

app.get("/", (c) => c.text("Running!"));

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
