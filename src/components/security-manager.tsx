import React, { createContext, useContext, useEffect } from "react";

interface SecurityManagerProps {
  children: React.ReactNode;
}

interface SecurityContext {
  isSecure: boolean;
  encryptionLevel: "standard" | "high" | "maximum";
  sanitizeInput: (input: string) => string;
  validateCSP: () => boolean;
}

const SecurityCtx = createContext<SecurityContext | null>(null);

export function SecurityManager({ children }: SecurityManagerProps) {
  const isBrowser = typeof window !== "undefined";
  const isHTTPS = isBrowser ? window.location.protocol === "https:" : false;
  const isLocalhost = isBrowser ? window.location.hostname === "localhost" : false;

  // Move side effect to useEffect instead of render
  useEffect(() => {
    if (isBrowser && !isHTTPS && !isLocalhost) {
      console.warn("Security Warning: Connection is not secure. Please use HTTPS.");
    }
  }, [isBrowser, isHTTPS, isLocalhost]);

  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .trim();
  };

  const validateContentSecurityPolicy = (): boolean => {
    if (!isBrowser) return false;
    return !!document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  };

  const contextValue: SecurityContext = {
    isSecure: isHTTPS || isLocalhost,
    encryptionLevel: "high",
    sanitizeInput,
    validateCSP: validateContentSecurityPolicy,
  };

  return (
    <SecurityCtx.Provider value={contextValue}>
      {children}
    </SecurityCtx.Provider>
  );
}

export function useSecurityManager() {
  const context = useContext(SecurityCtx);
  if (!context) {
    throw new Error("useSecurityManager must be used within SecurityManager");
  }
  return context;
}
