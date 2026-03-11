import { z } from "zod";

export const newsSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title cannot exceed 200 characters"),

  slug: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val), {
      message:
        "Slug must be URL-friendly (lowercase, hyphens, no special characters)",
    }),

  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters long")
    .max(500, "Excerpt cannot exceed 500 characters")
    .optional()
    .nullable(),

  content: z.string().min(20, "Content must be at least 20 characters long"),

  image_url: z.string().url("Must be a valid URL").optional().nullable(),

  category: z
    .string()
    .min(2, "Category must be at least 2 characters long")
    .max(100, "Category cannot exceed 100 characters")
    .optional()
    .nullable(),

  published_at: z
    .string()
    .datetime("Must be a valid date")
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});

// For creating news (all fields optional except required ones)
export const createNewsSchema = newsSchema.extend({
  // Make sure required fields are present
  title: newsSchema.shape.title,
  content: newsSchema.shape.content,
});

// For updating news (all fields optional)
export const updateNewsSchema = newsSchema.partial();

// For slug generation validation
export const slugSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
});

// Type inference
export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
