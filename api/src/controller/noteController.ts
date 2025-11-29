import type { Context } from "hono";

export const createNote = async (c: Context) => {
  return c.text("createNote");
};
