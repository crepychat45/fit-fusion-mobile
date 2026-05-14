import { z } from 'zod';

/**
 * Security validator utilities for input validation and sanitization
 */

// Common validation schemas
export const schemas = {
  email: z.string().email().max(255),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8).max(128),
  url: z.string().url().max(2048),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  uuid: z.string().uuid(),
  positiveInt: z.number().int().positive(),
  nonEmptyString: z.string().trim().min(1),
  safeText: z.string().max(1000).trim(),
};

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate and sanitize user input
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(input);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map(e => e.message).join(', '),
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

/**
 * Rate limiting helper for client-side
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    this.attempts.set(key, recentAttempts);
    
    return recentAttempts.length >= this.maxAttempts;
  }

  recordAttempt(key: string): void {
    const attempts = this.attempts.get(key) || [];
    attempts.push(Date.now());
    this.attempts.set(key, attempts);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Content Security Policy validator
 */
export function validateCSP(): void {
  const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!meta) {
    console.warn('Content Security Policy not set');
  }
}

/**
 * Check for secure context (HTTPS)
 */
export function isSecureContext(): boolean {
  return window.isSecureContext;
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = [],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
    };
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} is not allowed`,
      };
    }
  }

  return { valid: true };
}

/**
 * Prevent SQL injection by validating query parameters
 */
export function sanitizeSqlInput(input: string): string {
  // Remove potentially dangerous SQL keywords and characters
  return input
    .replace(/['";\\]/g, '')
    .replace(/(--)|(\/\*)|(\*\/)/g, '')
    .trim();
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  }
  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters');
  }
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters');
  }
  if (!/[0-9]/.test(password)) {
    feedback.push('Add numbers');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Add special characters');
  }

  return { score, feedback };
}
