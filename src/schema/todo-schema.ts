import { z } from "zod";

export const todoSchema = z.object({
  message: z.string(),
});
