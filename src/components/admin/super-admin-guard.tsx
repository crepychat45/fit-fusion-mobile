import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Guards super-admin-only surfaces. Roles are read from the secure
 * `user_roles` table via `useAdmin` — never from local storage or profiles.
 */
export function SuperAdminGuard({
  children,
  allowAdmins = true,
}: {
  children: React.ReactNode;
  allowAdmins?: boolean;
}) {
  const { isAdmin, isSuperAdmin, checking } = useAdmin();
  const { toast } = useToast();
  const allowed = isSuperAdmin || (allowAdmins && isAdmin);
  const denied = !checking && !allowed;

  useEffect(() => {
    if (denied) {
      toast({
        title: "Access denied",
        description: "This area is restricted to administrators.",
        variant: "destructive",
      });
    }
  }, [denied, toast]);

  if (checking) {
    return (
      <div className="min-h-screen space-y-4 bg-background p-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (denied) return <Navigate to="/" replace />;
  return <>{children}</>;
}
