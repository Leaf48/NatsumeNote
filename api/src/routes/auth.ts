import { Hono } from "hono";
import { register } from "../controller/authController.js";

const app = new Hono();

app.post("/register", register);

export default app;
