// lib/validation/index.ts
import { z } from 'zod';
import { ValidationError } from '@/lib/errors';

export const idSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const searchSchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors[0].message);
    }
    throw error;
  }
}

export function validateAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  try {
    return schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors[0].message);
    }
    throw error;
  }
}