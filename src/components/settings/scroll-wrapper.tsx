import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScrollWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollWrapper({ children, className = "" }: ScrollWrapperProps) {
  return (
    <ScrollArea className={`h-[calc(100vh-16rem)] ${className}`}>
      <div className="pr-4">
        {children}
      </div>
    </ScrollArea>
  );
}
