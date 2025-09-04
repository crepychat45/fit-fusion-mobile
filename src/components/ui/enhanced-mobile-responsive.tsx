import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MobileResponsiveProps {
  children: React.ReactNode;
  mobileClassName?: string;
  desktopClassName?: string;
  className?: string;
}

export function MobileResponsive({
  children,
  mobileClassName = "",
  desktopClassName = "",
  className = "",
}: MobileResponsiveProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        className,
        isMobile ? mobileClassName : desktopClassName
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  mobileColumns?: number;
  desktopColumns?: number;
  className?: string;
  gap?: "sm" | "md" | "lg";
}

export function ResponsiveGrid({
  children,
  mobileColumns = 1,
  desktopColumns = 2,
  className = "",
  gap = "md",
}: ResponsiveGridProps) {
  const isMobile = useIsMobile();

  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const mobileGridClass = `grid-cols-${mobileColumns}`;
  const desktopGridClass = `md:grid-cols-${desktopColumns}`;

  return (
    <div
      className={cn(
        "grid",
        mobileGridClass,
        desktopGridClass,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  mobileSize?: "xs" | "sm" | "base" | "lg" | "xl";
  desktopSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}

export function ResponsiveText({
  children,
  mobileSize = "sm",
  desktopSize = "base",
  className = "",
}: ResponsiveTextProps) {
  const isMobile = useIsMobile();

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm", 
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
  };

  const textSizeClass = isMobile ? sizeClasses[mobileSize] : sizeClasses[desktopSize];

  return (
    <div className={cn(textSizeClass, className)}>
      {children}
    </div>
  );
}

interface ResponsivePaddingProps {
  children: React.ReactNode;
  mobilePadding?: "none" | "sm" | "md" | "lg";
  desktopPadding?: "none" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ResponsivePadding({
  children,
  mobilePadding = "sm",
  desktopPadding = "md", 
  className = "",
}: ResponsivePaddingProps) {
  const isMobile = useIsMobile();

  const paddingClasses = {
    none: "p-0",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  };

  const paddingClass = isMobile ? paddingClasses[mobilePadding] : paddingClasses[desktopPadding];

  return (
    <div className={cn(paddingClass, className)}>
      {children}
    </div>
  );
}