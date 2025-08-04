import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

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
  const [isSecure, setIsSecure] = useState(false);
  const [encryptionLevel, setEncryptionLevel] = useState<"standard" | "high" | "maximum">("high");
  const { toast } = useToast();

  useEffect(() => {
    // Check if HTTPS is enabled
    const isHTTPS = location.protocol === 'https:';
    setIsSecure(isHTTPS);

    if (!isHTTPS && location.hostname !== 'localhost') {
      toast({
        title: "⚠️ Security Warning",
        description: "Connection is not secure. Please use HTTPS.",
        variant: "destructive"
      });
    }

    // Implement CSP validation
    validateContentSecurityPolicy();
  }, [toast]);

  const sanitizeInput = (input: string): string => {
    // Prevent XSS attacks by sanitizing user input
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };

  const validateContentSecurityPolicy = (): boolean => {
    // Check if CSP headers are properly configured
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const hasCSP = !!metaCSP;
    
    if (!hasCSP) {
      console.warn('Content Security Policy not detected. Consider adding CSP headers for enhanced security.');
    }
    
    return hasCSP;
  };

  const contextValue: SecurityContext = {
    isSecure,
    encryptionLevel,
    sanitizeInput,
    validateCSP: validateContentSecurityPolicy
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
    throw new Error('useSecurityManager must be used within SecurityManager');
  }
  return context;
}