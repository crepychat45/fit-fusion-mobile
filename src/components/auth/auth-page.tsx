import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EnhancedAuthForm } from "./enhanced-auth-form";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { EnhancedErrorBoundary } from "@/components/enhanced-error-handling";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useEnhancedAuth();

  useEffect(() => {
    // Redirect authenticated users to home
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleAuthSuccess = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <EnhancedErrorBoundary>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <EnhancedAuthForm onSuccess={handleAuthSuccess} />
        </motion.div>
      </div>
    </EnhancedErrorBoundary>
  );
}
