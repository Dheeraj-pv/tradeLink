// lib/validation/job.ts
import { z } from 'zod';
import { validateAsync } from './index';

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description is too long'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  categoryId: z.number().positive('Invalid category'),
  budget: z.number().positive('Budget must be greater than 0').optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const bidSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message is too long'),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(5, 'Comment must be at least 5 characters').max(1000, 'Comment is too long'),
});

export async function validateCreateJob(data: unknown) {
  return validateAsync(createJobSchema, data);
}

export async function validateUpdateJob(data: unknown) {
  return validateAsync(updateJobSchema, data);
}

export async function validateBid(data: unknown) {
  return validateAsync(bidSchema, data);
}

export async function validateReview(data: unknown) {
  return validateAsync(reviewSchema, data);
}