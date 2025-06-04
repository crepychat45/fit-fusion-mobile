
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Activity, 
  Droplets, 
  Moon, 
  ThermometerSun,
  TrendingUp,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

export function HealthMetricsPanel() {
  const [metrics, setMetrics] = useState({
    heartRate: { value: 78, status: "Normal", trend: "stable" },
    hydration: { value: 65, target: 100, status: "Good" },
    sleep: { hours: 7.5, quality: 85, status: "Good" },
    stress: { level: 25, status: "Low" },
    recovery: { score: 82, status: "Good" }
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        heartRate: {
          ...prev.heartRate,
          value: Math.floor(Math.random() * 10) + 75
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'normal':
      case 'moderate':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">Health Metrics</h2>
        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
          <Shield className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Heart Rate */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <Heart className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Heart Rate</p>
                    <p className="text-xs text-muted-foreground">Resting</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{metrics.heartRate.value}</p>
                  <p className="text-xs text-muted-foreground">BPM</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="outline" className={getStatusColor(metrics.heartRate.status)}>
                  {metrics.heartRate.status}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Stable
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hydration & Sleep */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Hydration</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>{metrics.hydration.value}%</span>
                    <span className="text-muted-foreground">Goal: {metrics.hydration.target}%</span>
                  </div>
                  <Progress value={metrics.hydration.value} className="h-2" />
                </div>
                <Badge variant="outline" className={`mt-2 ${getStatusColor(metrics.hydration.status)}`}>
                  {metrics.hydration.status}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Sleep</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold">{metrics.sleep.hours}h</p>
                  <p className="text-xs text-muted-foreground">Quality: {metrics.sleep.quality}%</p>
                </div>
                <Badge variant="outline" className={`mt-2 ${getStatusColor(metrics.sleep.status)}`}>
                  {metrics.sleep.status}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recovery Score */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Recovery Score</p>
                    <p className="text-xs text-muted-foreground">Based on HRV & Sleep</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{metrics.recovery.score}</p>
                  <p className="text-xs text-green-700">Excellent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
