import React from "react";
import { EnhancedAuthForm } from "./enhanced-auth-form";

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  return <EnhancedAuthForm onSuccess={onSuccess} />;
}
