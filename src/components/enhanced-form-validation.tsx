import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
  severity: "error" | "warning" | "success";
}

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  validationRules?: ValidationRule[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning" | "success";
}

export function EnhancedFormField({
  label,
  type,
  value,
  onChange,
  validationRules = [],
  placeholder,
  required = false,
  className = "",
}: FormFieldProps) {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (value.length === 0) {
      setErrors([]);
      setIsValid(null);
      return;
    }

    const validationErrors: ValidationError[] = [];

    validationRules.forEach((rule) => {
      if (!rule.test(value)) {
        validationErrors.push({
          field: label,
          message: rule.message,
          severity: rule.severity,
        });
      }
    });

    setErrors(validationErrors);
    setIsValid(
      validationErrors.filter((e) => e.severity === "error").length === 0,
    );
  }, [value, validationRules, label]);

  const getFieldBorderColor = () => {
    if (isValid === null) return "";
    if (isValid) return "border-green-500 focus:border-green-600";
    return "border-red-500 focus:border-red-600";
  };

  const getValidationIcon = () => {
    if (isValid === null) return null;
    return isValid ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, "-")}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={label.toLowerCase().replace(/\s+/g, "-")}
          type={type === "password" && showPassword ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 transition-colors duration-200 ${getFieldBorderColor()}`}
          required={required}
        />

        <div className="absolute right-3 top-2.5 flex items-center gap-1">
          {type === "password" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
          {getValidationIcon()}
        </div>
      </div>

      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1"
          >
            {errors.map((error, index) => (
              <motion.div
                key={index}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-2 text-xs ${
                  error.severity === "error"
                    ? "text-red-500"
                    : error.severity === "warning"
                      ? "text-yellow-500"
                      : "text-green-500"
                }`}
              >
                <AlertTriangle className="h-3 w-3" />
                {error.message}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Common validation rules
export const validationRules = {
  email: [
    {
      test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Please enter a valid email address",
      severity: "error" as const,
    },
  ],

  password: [
    {
      test: (value: string) => value.length >= 8,
      message: "Password must be at least 8 characters",
      severity: "error" as const,
    },
    {
      test: (value: string) => /[a-z]/.test(value),
      message: "Include at least one lowercase letter",
      severity: "error" as const,
    },
    {
      test: (value: string) => /[A-Z]/.test(value),
      message: "Include at least one uppercase letter",
      severity: "error" as const,
    },
    {
      test: (value: string) => /\d/.test(value),
      message: "Include at least one number",
      severity: "error" as const,
    },
    {
      test: (value: string) => /[^a-zA-Z\d]/.test(value),
      message: "Include at least one special character",
      severity: "warning" as const,
    },
  ],

  name: [
    {
      test: (value: string) => value.length >= 2,
      message: "Name must be at least 2 characters",
      severity: "error" as const,
    },
    {
      test: (value: string) => /^[a-zA-Z\s]+$/.test(value),
      message: "Name should only contain letters and spaces",
      severity: "warning" as const,
    },
  ],

  phone: [
    {
      test: (value: string) => /^\+?[\d\s\-\(\)]+$/.test(value),
      message: "Please enter a valid phone number",
      severity: "error" as const,
    },
  ],
};

// Form validation hook
export function useFormValidation(
  fields: Record<string, string>,
  rules: Record<string, ValidationRule[]>,
) {
  const [isFormValid, setIsFormValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, ValidationError[]>
  >({});

  useEffect(() => {
    const errors: Record<string, ValidationError[]> = {};
    let hasErrors = false;

    Object.entries(fields).forEach(([fieldName, fieldValue]) => {
      const fieldRules = rules[fieldName] || [];
      const fieldErrors: ValidationError[] = [];

      fieldRules.forEach((rule) => {
        if (!rule.test(fieldValue)) {
          fieldErrors.push({
            field: fieldName,
            message: rule.message,
            severity: rule.severity,
          });
          if (rule.severity === "error") {
            hasErrors = true;
          }
        }
      });

      errors[fieldName] = fieldErrors;
    });

    setFieldErrors(errors);
    setIsFormValid(!hasErrors);
  }, [fields, rules]);

  return {
    isFormValid,
    fieldErrors,
    getFieldErrors: (fieldName: string) => fieldErrors[fieldName] || [],
    hasFieldErrors: (fieldName: string) =>
      (fieldErrors[fieldName] || []).some((e) => e.severity === "error"),
  };
}
