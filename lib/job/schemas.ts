import { z } from "zod";

export const createJobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(100),

  description: z.string().trim().min(10, "Description is too short"),

  address: z.string().trim().min(5, "Adress is too short"),

  categoryId: z.number().int().positive(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
