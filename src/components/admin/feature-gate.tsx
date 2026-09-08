import React from "react";
import { Wrench } from "lucide-react";
import { useRemoteConfig } from "@/hooks/use-remote-config";
import { useLocation } from "react-router-dom";

/**
 * Renders children only when a remote feature switch is on.
 * Otherwise shows a maintenance card (or nothing when `hideWhenOff`).
 */
export const FeatureGate: React.FC<{
  feature: string;
  children: React.ReactNode;
  hideWhenOff?: boolean;
  label?: string;
}> = ({ feature, children, hideWhenOff = false, label }) => {
  const { isFeatureEnabled, switches } = useRemoteConfig();
  if (isFeatureEnabled(feature, true)) return <>{children}</>;
  if (hideWhenOff) return null;

  return (
    <div className="liquid-glass rounded-2xl border border-border/40 p-6 text-center">
      <Wrench className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
      <p className="font-semibold">
        {label ?? switches[feature]?.name ?? "This section"} is temporarily under maintenance
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        We're making improvements. Please check back shortly.
      </p>
    </div>
  );
};

/** Full-screen maintenance override for the whole user-facing app. */
export const MaintenanceGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { maintenanceMode, getContent } = useRemoteConfig();
  const location = useLocation();
  const notice = getContent<{ message?: string; eta?: string }>("maintenance.notice", {});

  // Admins must always be able to reach /admin to turn maintenance back off.
  if (!maintenanceMode || location.pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="liquid-glass w-full max-w-md rounded-3xl border border-border/40 p-8 text-center">
        <Wrench className="mx-auto mb-4 h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">We'll be right back</h1>
        <p className="mt-2 text-muted-foreground">
          {notice.message ?? "FitXFusion is under scheduled maintenance."}
        </p>
        {notice.eta && (
          <p className="mt-4 rounded-xl border border-border/40 px-3 py-2 text-sm">
            Estimated return: {notice.eta}
          </p>
        )}
      </div>
    </div>
  );
};
