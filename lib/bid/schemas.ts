import { z } from "zod";

export const createBidSchema = z.object({
  amount: z
    .number({
      message: "Amount is required",
    })
    .positive("Bid amount must be greater than 0"),

  message: z
    .string()
    .trim()
    .min(10, "Message must contain at least 10 characters")
    .max(500, "Message is too long"),
});

export type CreateBidInput = z.infer<typeof createBidSchema>;
