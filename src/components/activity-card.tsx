import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export interface ActivityCardProps {
  title: string;
  description?: string;
  date: string;
  icon: React.ReactNode;
  stats: { label: string; value: string }[];
  onClick?: () => void;
}

export function ActivityCard({ title, description, date, icon, stats, onClick }: ActivityCardProps) {
  return (
    <Card
      className="overflow-hidden border-primary/10 shadow-sm hover:bg-secondary/5"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="text-sm font-medium">{title}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{stat.label}</span>
              <span className="font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
