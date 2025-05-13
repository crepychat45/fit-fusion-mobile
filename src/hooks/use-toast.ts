
import { useToast as useShadcnToast } from "@/components/ui/toast";
import { toast as shadcnToast } from "@/components/ui/toast";

// Re-export the hooks for consistency
export const useToast = useShadcnToast;
export const toast = shadcnToast;

// Note: This ensures we have a single source of truth for toast functionality
