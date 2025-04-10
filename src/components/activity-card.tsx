
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ActivityCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  className 
}: ActivityCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-3 pb-0">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
