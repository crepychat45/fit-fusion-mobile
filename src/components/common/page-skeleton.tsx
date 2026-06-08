import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * PageSkeleton — Liquid Glass styled skeleton shown during route lazy-loads.
 * Mimics the structure of a typical FitFusion page (header + cards + grid)
 * so transitions feel instant instead of a blank spinner.
 */
export const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background relative overflow-hidden">
    {/* Ambient orbs */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
    </div>

    {/* Header */}
    <div className="relative px-4 pt-10 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 bg-muted/40" />
          <Skeleton className="h-6 w-44 bg-muted/60" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full bg-muted/50" />
      </div>

      {/* Hero glass card */}
      <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl p-5 space-y-3 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)]">
        <Skeleton className="h-4 w-32 bg-muted/40" />
        <Skeleton className="h-8 w-3/4 bg-muted/60" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-24 rounded-xl bg-muted/50" />
          <Skeleton className="h-9 w-24 rounded-xl bg-muted/40" />
        </div>
      </div>
    </div>

    {/* Card grid */}
    <div className="px-4 grid grid-cols-2 gap-3 mb-6">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/10 bg-card/30 backdrop-blur-xl p-4 space-y-2"
        >
          <Skeleton className="h-8 w-8 rounded-lg bg-muted/50" />
          <Skeleton className="h-3 w-16 bg-muted/40" />
          <Skeleton className="h-5 w-20 bg-muted/60" />
        </div>
      ))}
    </div>

    {/* List rows */}
    <div className="px-4 space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/10 bg-card/30 backdrop-blur-xl p-4 flex items-center gap-3"
        >
          <Skeleton className="h-12 w-12 rounded-xl bg-muted/50" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 bg-muted/60" />
            <Skeleton className="h-3 w-1/3 bg-muted/40" />
          </div>
          <Skeleton className="h-8 w-16 rounded-lg bg-muted/50" />
        </div>
      ))}
    </div>
  </div>
);

export default PageSkeleton;
