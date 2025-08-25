import React, { createContext, useContext } from "react";
import { toast } from "sonner";

interface SecurityManagerProps {
  children: React.ReactNode;
}

interface SecurityContext {
  isSecure: boolean;
  encryptionLevel: "standard" | "high" | "maximum";
  sanitizeInput: (input: string) => string;
  validateCSP: () => boolean;
}

const SecurityContext = createContext<SecurityContext | null>(null);

export function SecurityManager({ children }: SecurityManagerProps) {
  const isBrowser = typeof window !== "undefined";
  const isHTTPS = isBrowser ? window.location.protocol === "https:" : false;
  const isLocalhost = isBrowser
    ? window.location.hostname === "localhost"
    : false;

  // Notify once without using React hooks to avoid dispatcher issues
  if (isBrowser && !isHTTPS && !isLocalhost) {
    try {
      toast.error(
        "⚠️ Security Warning: Connection is not secure. Please use HTTPS.",
      );
    } catch (e) {
      // no-op
      console.warn("Toast unavailable:", e);
    }
  }

  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .trim();
  };

  const validateContentSecurityPolicy = (): boolean => {
    if (!isBrowser) return false;
    const metaCSP = document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]',
    );
    const hasCSP = !!metaCSP;
    if (!hasCSP) {
      console.warn(
        "Content Security Policy not detected. Consider adding CSP headers for enhanced security.",
      );
    }
    return hasCSP;
  };

  const contextValue: SecurityContext = {
    isSecure: isHTTPS || isLocalhost,
    encryptionLevel: "high",
    sanitizeInput,
    validateCSP: validateContentSecurityPolicy,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurityManager() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurityManager must be used within SecurityManager");
  }
  return context;
}
