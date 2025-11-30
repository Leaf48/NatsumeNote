import { Hono } from "hono";
import { challenge, register } from "../controller/authController.js";

const app = new Hono();

app.post("/register", register);
app.get("/challenge", challenge);

export default app;
