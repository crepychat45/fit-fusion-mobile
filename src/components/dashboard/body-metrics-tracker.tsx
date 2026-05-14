import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Droplets, Moon, Footprints, Heart, Brain, Battery, Thermometer, Wind } from "lucide-react";

interface BodyMetric {
  id: string;
  label: string;
  value: string;
  target: string;
  progress: number;
  icon: React.ElementType;
  color: string;
  trend: "up" | "down" | "stable";
}

const metrics: BodyMetric[] = [
  { id: "water", label: "Hydration", value: "6/8", target: "8 glasses", progress: 75, icon: Droplets, color: "text-cyan-500", trend: "up" },
  { id: "sleep", label: "Sleep Score", value: "82", target: "90+", progress: 82, icon: Moon, color: "text-indigo-500", trend: "stable" },
  { id: "steps", label: "Steps", value: "8,432", target: "10,000", progress: 84, icon: Footprints, color: "text-green-500", trend: "up" },
  { id: "rhr", label: "Resting HR", value: "62 bpm", target: "<65", progress: 95, icon: Heart, color: "text-red-500", trend: "down" },
  { id: "stress", label: "Stress Level", value: "Low", target: "Low", progress: 85, icon: Brain, color: "text-purple-500", trend: "stable" },
  { id: "energy", label: "Energy", value: "High", target: "High", progress: 88, icon: Battery, color: "text-yellow-500", trend: "up" },
  { id: "temp", label: "Body Temp", value: "36.6°C", target: "36.1-37.2", progress: 100, icon: Thermometer, color: "text-orange-500", trend: "stable" },
  { id: "o2", label: "SpO2", value: "98%", target: "95%+", progress: 98, icon: Wind, color: "text-blue-500", trend: "stable" },
];

export function BodyMetricsTracker() {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Body Metrics</h3>
            <p className="text-xs text-muted-foreground font-normal">Real-time health monitoring</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <p className="text-lg font-bold mb-1">{metric.value}</p>
              <Progress value={metric.progress} className="h-1 mb-1" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Target: {metric.target}</span>
                <Badge variant="outline" className={`text-[10px] px-1 ${metric.trend === "up" ? "text-green-600" : metric.trend === "down" ? "text-blue-600" : "text-muted-foreground"}`}>
                  {metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→"}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
