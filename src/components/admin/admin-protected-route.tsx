import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, checking } = useAdmin();
  const { toast } = useToast();
  const denied = !checking && !isAdmin;

  useEffect(() => {
    if (denied) {
      toast({
        title: "Access denied",
        description: "You need administrator access to open this area.",
        variant: "destructive",
      });
    }
  }, [denied, toast]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-4">
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
