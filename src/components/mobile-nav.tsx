
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, Dumbbell, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    icon: Home,
    label: "Home",
    path: "/",
  },
  {
    icon: Dumbbell,
    label: "Workouts",
    path: "/workouts",
  },
  {
    icon: Activity,
    label: "Progress",
    path: "/progress",
  },
  {
    icon: User,
    label: "Profile",
    path: "/profile",
  },
];

export function MobileNav() {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-3",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="mt-1 text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
