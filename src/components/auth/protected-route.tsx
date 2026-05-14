import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { LoadingSpinner } from "@/components/common/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, error } = useEnhancedAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    console.warn("Protected route auth fallback:", error);
  }

  if (!user) {
    // Redirect to auth page but save the attempted location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
