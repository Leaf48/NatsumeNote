import { Hono } from "hono";
import { createNote } from "../controller/noteController.js";

const app = new Hono();

app.post("/createNote", createNote);

export default app;
