import { z } from "zod";

/**
 * Security-focused validation schemas for user inputs
 * Protects against XSS, injection attacks, and malicious content
 */

// Sanitize HTML and dangerous characters
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .replace(/data:text\/html/gi, "") // Remove data URLs
    .trim();
};

// Post content validation (community posts)
export const postContentSchema = z
  .string()
  .trim()
  .min(1, "Post content cannot be empty")
  .max(5000, "Post content must be less than 5000 characters")
  .transform(sanitizeInput);

// Comment validation
export const commentSchema = z
  .string()
  .trim()
  .min(1, "Comment cannot be empty")
  .max(1000, "Comment must be less than 1000 characters")
  .transform(sanitizeInput);

// Profile bio validation
export const bioSchema = z
  .string()
  .trim()
  .max(500, "Bio must be less than 500 characters")
  .transform(sanitizeInput);

// Name validation
export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name cannot be empty")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .transform(sanitizeInput);

// URL validation (for profile links)
export const urlSchema = z
  .string()
  .trim()
  .max(500, "URL must be less than 500 characters")
  .url("Invalid URL format")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    "URL must use HTTP or HTTPS protocol"
  );

// Number validation helpers
export const ageSchema = z
  .number()
  .int("Age must be a whole number")
  .min(13, "Must be at least 13 years old")
  .max(120, "Invalid age");

export const heightSchema = z
  .number()
  .int("Height must be a whole number")
  .min(100, "Height must be at least 100 cm")
  .max(250, "Height must be less than 250 cm");

export const weightSchema = z
  .number()
  .positive("Weight must be positive")
  .min(30, "Weight must be at least 30 kg")
  .max(300, "Weight must be less than 300 kg");

// Phone number validation (international format)
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
  .max(20, "Phone number too long");

// Email validation with enhanced security
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters")
  .refine(
    (email) => {
      // Block common test/spam patterns
      const blockedPatterns = [
        /test@test/,
        /example@example/,
        /disposable/,
        /tempmail/,
      ];
      return !blockedPatterns.some((pattern) => pattern.test(email));
    },
    "Please use a valid email address"
  );

/**
 * Validate and sanitize user input
 * @param schema - Zod schema to validate against
 * @param value - Value to validate
 * @returns Object with success status, data, and error message
 */
export const validateInput = <T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { success: boolean; data?: T; error?: string } => {
  try {
    const result = schema.parse(value);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Unknown validation error" };
  }
};

/**
 * Batch validate multiple fields
 */
export const validateFields = (
  fields: { schema: z.ZodSchema; value: unknown; fieldName: string }[]
): { success: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  for (const field of fields) {
    const result = validateInput(field.schema, field.value);
    if (!result.success) {
      errors[field.fieldName] = result.error!;
    }
  }
  
  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Check for potentially malicious content patterns
 */
export const containsMaliciousContent = (input: string): boolean => {
  const maliciousPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /<object/i,
    /<embed/i,
  ];
  
  return maliciousPatterns.some((pattern) => pattern.test(input));
};
