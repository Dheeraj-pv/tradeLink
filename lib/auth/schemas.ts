// lib/auth/schemas.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Must contain at least one special character",
    ),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Must contain at least one special character",
      ),
    phone: z
      .string()
      .trim()
      .min(10, "Phone number is too short")
      .nullable()
      .optional(),
    role: z.enum(["CUSTOMER", "PROVIDER"]),
    categoryIds: z.array(z.number()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.role === "PROVIDER" && data.categoryIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["categoryIds"],

        message: "Please select at least one category",
      });
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
