
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Dumbbell, 
  BarChart3, 
  User, 
  MessageCircle,
  Plus,
  Settings,
  Heart,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    href: "/",
    icon: Home,
    label: "Home",
    color: "text-blue-500"
  },
  {
    href: "/workouts",
    icon: Dumbbell,
    label: "Workouts",
    color: "text-purple-500"
  },
  {
    href: "/progress",
    icon: BarChart3,
    label: "Progress",
    color: "text-green-500"
  },
  {
    href: "/chat",
    icon: MessageCircle,
    label: "Chat",
    color: "text-orange-500"
  },
  {
    href: "/profile",
    icon: User,
    label: "Profile",
    color: "text-pink-500"
  }
];

export function MobileNav() {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const additionalItems = [
    { href: "/settings", icon: Settings, label: "Settings", color: "text-gray-500" },
    { href: "/subscription", icon: Trophy, label: "Premium", color: "text-yellow-500" },
  ];

  return (
    <>
      {/* Main Navigation */}
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-border/50 px-4 py-2 shadow-lg"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.href}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link to={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      isActive && "bg-primary/20"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5 transition-colors duration-200",
                        isActive ? "text-primary" : item.color
                      )} />
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-1 h-1 bg-primary rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
          
          {/* More Button */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMore(true)}
              className="flex flex-col items-center space-y-1 p-2 h-auto text-muted-foreground hover:text-foreground"
            >
              <div className="p-2 rounded-lg">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">More</span>
            </Button>
          </motion.div>
        </div>
      </motion.nav>

      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
              
              <h3 className="text-lg font-semibold mb-4 text-center">More Options</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {additionalItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <Link 
                        to={item.href}
                        onClick={() => setShowMore(false)}
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 transition-all duration-200"
                        >
                          <div className={cn("p-3 rounded-xl bg-white shadow-sm mb-2", item.color)}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              
              <Button 
                onClick={() => setShowMore(false)}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
