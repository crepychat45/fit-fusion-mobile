import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Download, Star, CheckCircle, Smartphone, Heart, Dumbbell, Brain, Timer, Map, Music, Compass, Zap } from "lucide-react";

interface WatchApp {
  id: string;
  name: string;
  icon: string;
  category: string;
  rating: number;
  downloads: string;
  size: string;
  installed: boolean;
  description: string;
  premium: boolean;
}

const watchApps: WatchApp[] = [
  { id: "1", name: "Workout Pro", icon: "💪", category: "Fitness", rating: 4.9, downloads: "50K+", size: "2.1 MB", installed: true, description: "Advanced workout tracking with AI coaching", premium: false },
  { id: "2", name: "Heart Monitor+", icon: "❤️", category: "Health", rating: 4.8, downloads: "120K+", size: "1.5 MB", installed: true, description: "Continuous heart rate monitoring with alerts", premium: false },
  { id: "3", name: "Sleep Tracker", icon: "😴", category: "Health", rating: 4.7, downloads: "85K+", size: "1.8 MB", installed: false, description: "Advanced sleep analysis with smart alarms", premium: false },
  { id: "4", name: "Running Coach", icon: "🏃", category: "Fitness", rating: 4.9, downloads: "200K+", size: "3.2 MB", installed: false, description: "GPS running with pace coaching", premium: true },
  { id: "5", name: "Meditation", icon: "🧘", category: "Wellness", rating: 4.6, downloads: "95K+", size: "4.5 MB", installed: false, description: "Guided meditation and breathing exercises", premium: false },
  { id: "6", name: "Music Control", icon: "🎵", category: "Utility", rating: 4.5, downloads: "300K+", size: "0.8 MB", installed: true, description: "Control music from your wrist", premium: false },
  { id: "7", name: "Compass Pro", icon: "🧭", category: "Utility", rating: 4.4, downloads: "45K+", size: "0.5 MB", installed: false, description: "Outdoor navigation and altimeter", premium: false },
  { id: "8", name: "Calorie AI", icon: "🔥", category: "Nutrition", rating: 4.8, downloads: "75K+", size: "2.8 MB", installed: false, description: "AI-powered calorie tracking", premium: true },
  { id: "9", name: "Swim Tracker", icon: "🏊", category: "Fitness", rating: 4.7, downloads: "35K+", size: "1.9 MB", installed: false, description: "Waterproof swim lap counter", premium: false },
  { id: "10", name: "Stress Monitor", icon: "🧠", category: "Health", rating: 4.5, downloads: "60K+", size: "1.2 MB", installed: false, description: "HRV-based stress detection", premium: true },
];

export function WatchAppStore() {
  const { toast } = useToast();
  const [apps, setApps] = useState(watchApps);
  const [category, setCategory] = useState("All");
  const [installing, setInstalling] = useState<string | null>(null);

  const categories = ["All", "Fitness", "Health", "Wellness", "Nutrition", "Utility"];
  const filtered = category === "All" ? apps : apps.filter(a => a.category === category);

  const handleInstall = async (appId: string) => {
    setInstalling(appId);
    await new Promise(r => setTimeout(r, 2000));
    setApps(prev => prev.map(a => a.id === appId ? { ...a, installed: true } : a));
    setInstalling(null);
    toast({ title: "✅ App Installed!", description: `${apps.find(a => a.id === appId)?.name} is ready on your watch.` });
  };

  const handleUninstall = (appId: string) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, installed: false } : a));
    toast({ title: "App Removed", description: "App has been uninstalled from your watch." });
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Watch App Store</h3>
              <p className="text-xs text-muted-foreground font-normal">Install apps on your smartwatch</p>
            </div>
          </div>
          <Badge variant="outline">{apps.filter(a => a.installed).length} Installed</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {categories.map(cat => (
              <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" className="text-xs whitespace-nowrap" onClick={() => setCategory(cat)}>
                {cat}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <ScrollArea className="h-[320px] pr-2">
          <div className="space-y-2">
            {filtered.map((app, i) => (
              <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`p-3 transition-all hover:shadow-sm ${app.installed ? "border-green-200 dark:border-green-800" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">{app.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm truncate">{app.name}</span>
                        {app.premium && <Badge className="text-[9px] bg-yellow-500 px-1">PRO</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{app.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />{app.rating}</span>
                        <span>{app.downloads}</span>
                        <span>{app.size}</span>
                      </div>
                    </div>
                    {app.installed ? (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handleUninstall(app.id)}>
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />Installed
                      </Button>
                    ) : (
                      <Button size="sm" className="text-xs" disabled={installing === app.id} onClick={() => handleInstall(app.id)}>
                        {installing === app.id ? <Download className="h-3 w-3 animate-bounce mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                        Install
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
