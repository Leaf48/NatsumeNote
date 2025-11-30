import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/note.js";

const app = new Hono();
app.use("*", cors());

app.route("/auth", authRoutes);
app.route("/note", noteRoutes);

app.get("/", (c) => c.text("Running!"));

export default app;
