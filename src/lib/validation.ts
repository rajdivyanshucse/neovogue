import { z } from 'zod';

/** Validation schema for New Redesign Request form */
export const requestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .or(z.literal('')),
  pickupAddress: z
    .string()
    .trim()
    .min(5, 'Pickup address is too short')
    .max(500, 'Address must be less than 500 characters'),
  deliveryAddress: z
    .string()
    .trim()
    .min(5, 'Delivery address is too short')
    .max(500, 'Address must be less than 500 characters'),
});

/** Validation schema for quotation submission */
export const quotationSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be positive')
    .int('Amount must be a whole number')
    .min(100, 'Amount must be at least ₹100')
    .max(10000000, 'Amount exceeds maximum'),
  estimatedDays: z
    .number({ invalid_type_error: 'Days must be a number' })
    .positive('Days must be positive')
    .int('Days must be a whole number')
    .min(1, 'Minimum 1 day')
    .max(365, 'Maximum 365 days'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
});

/** Validation schema for chat messages */
export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be less than 5000 characters'),
});

/** Validation schema for profile settings */
export const profileSchema = z.object({
  full_name: z
    .string()
    .max(100, 'Name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(100, 'City name is too long')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address is too long')
    .optional()
    .or(z.literal('')),
});

/** Validation schema for designer profile settings */
export const designerProfileSchema = z.object({
  bio: z
    .string()
    .max(2000, 'Bio must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  experience_years: z
    .number()
    .int()
    .min(0, 'Experience cannot be negative')
    .max(100, 'Invalid experience years'),
  price_range_min: z
    .number()
    .int()
    .min(0, 'Price cannot be negative')
    .max(10000000, 'Price too high'),
  price_range_max: z
    .number()
    .int()
    .min(0, 'Price cannot be negative')
    .max(10000000, 'Price too high'),
  portfolio_url: z
    .string()
    .url('Invalid URL format')
    .max(500, 'URL is too long')
    .optional()
    .or(z.literal('')),
});

/** Validation schema for portfolio items */
export const portfolioSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  category: z
    .string()
    .max(100, 'Category is too long')
    .optional()
    .or(z.literal('')),
  tags: z
    .string()
    .max(500, 'Tags string is too long')
    .optional()
    .or(z.literal('')),
});
