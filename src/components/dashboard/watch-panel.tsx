
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Watch, 
  Battery, 
  Bluetooth, 
  Heart, 
  Activity, 
  Wifi,
  Settings,
  RefreshCw,
  Signal,
  Zap,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface WatchDevice {
  id: string;
  name: string;
  model: string;
  image: string;
  connected: boolean;
  batteryLevel: number;
  signalStrength: number;
  heartRate?: number;
  steps?: number;
  lastSync: string;
  status: 'connected' | 'disconnected' | 'syncing';
}

const mockWatches: WatchDevice[] = [
  {
    id: "1",
    name: "Apple Watch Series 9",
    model: "45mm GPS",
    image: "/placeholder.svg",
    connected: true,
    batteryLevel: 78,
    signalStrength: 95,
    heartRate: 72,
    steps: 8432,
    lastSync: "2 minutes ago",
    status: 'connected'
  },
  {
    id: "2", 
    name: "Samsung Galaxy Watch 6",
    model: "44mm LTE",
    image: "/placeholder.svg",
    connected: false,
    batteryLevel: 34,
    signalStrength: 0,
    lastSync: "1 hour ago",
    status: 'disconnected'
  },
  {
    id: "3",
    name: "Garmin Forerunner 965",
    model: "Sport Edition",
    image: "/placeholder.svg", 
    connected: true,
    batteryLevel: 92,
    signalStrength: 87,
    heartRate: 68,
    steps: 12847,
    lastSync: "Just now",
    status: 'connected'
  }
];

export function WatchPanel() {
  const [watches, setWatches] = useState<WatchDevice[]>(mockWatches);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedWatch, setSelectedWatch] = useState<string | null>(null);

  const handleConnect = async (watchId: string) => {
    setWatches(prev => prev.map(watch => 
      watch.id === watchId 
        ? { ...watch, status: 'syncing' as const }
        : watch
    ));

    // Simulate connection process
    setTimeout(() => {
      setWatches(prev => prev.map(watch => 
        watch.id === watchId 
          ? { 
              ...watch, 
              connected: true, 
              status: 'connected' as const,
              lastSync: 'Just now',
              signalStrength: 85 + Math.floor(Math.random() * 15)
            }
          : watch
      ));
    }, 2000);
  };

  const handleDisconnect = (watchId: string) => {
    setWatches(prev => prev.map(watch => 
      watch.id === watchId 
        ? { 
            ...watch, 
            connected: false, 
            status: 'disconnected' as const,
            signalStrength: 0,
            heartRate: undefined,
            steps: undefined
          }
        : watch
    ));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setWatches(prev => prev.map(watch => ({
        ...watch,
        batteryLevel: Math.max(0, Math.min(100, watch.batteryLevel + Math.floor(Math.random() * 10) - 5)),
        lastSync: watch.connected ? 'Just now' : watch.lastSync,
        heartRate: watch.connected ? 65 + Math.floor(Math.random() * 20) : undefined,
        steps: watch.connected ? (watch.steps || 0) + Math.floor(Math.random() * 100) : undefined
      })));
      setIsRefreshing(false);
    }, 1500);
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-500";
    if (level > 20) return "text-yellow-500";
    return "text-red-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Watch className="h-5 w-5 text-white" />
            </div>
            Connected Devices
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {watches.map((watch) => (
              <motion.div
                key={watch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  watch.connected 
                    ? 'border-green-200 bg-green-50 dark:bg-green-950/20' 
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Watch Image */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                      <Watch className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      {getStatusIcon(watch.status)}
                    </div>
                  </div>

                  {/* Watch Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">{watch.name}</h3>
                      <Badge 
                        variant={watch.connected ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {watch.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{watch.model}</p>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Battery */}
                      <div className="flex items-center gap-1">
                        <Battery className={`h-3 w-3 ${getBatteryColor(watch.batteryLevel)}`} />
                        <span>{watch.batteryLevel}%</span>
                        <Progress 
                          value={watch.batteryLevel} 
                          className="h-1 w-8"
                        />
                      </div>
                      
                      {/* Signal */}
                      <div className="flex items-center gap-1">
                        <Signal className="h-3 w-3 text-blue-500" />
                        <span>{watch.signalStrength}%</span>
                      </div>
                      
                      {/* Heart Rate */}
                      {watch.heartRate && (
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-red-500" />
                          <span>{watch.heartRate} BPM</span>
                        </div>
                      )}
                      
                      {/* Steps */}
                      {watch.steps && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-green-500" />
                          <span>{watch.steps.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Last sync: {watch.lastSync}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {watch.connected ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnect(watch.id)}
                          className="h-7 text-xs"
                        >
                          Disconnect
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 text-xs"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleConnect(watch.id)}
                        disabled={watch.status === 'syncing'}
                        className="h-7 text-xs bg-gradient-to-r from-blue-500 to-purple-600"
                      >
                        {watch.status === 'syncing' ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Bluetooth className="h-3 w-3 mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            Quick Stats
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {watches.filter(w => w.connected).length}
              </div>
              <div className="text-xs text-muted-foreground">Connected</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {Math.round(watches.filter(w => w.connected).reduce((acc, w) => acc + w.batteryLevel, 0) / watches.filter(w => w.connected).length) || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Battery</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {watches.filter(w => w.steps).reduce((acc, w) => acc + (w.steps || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Steps</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
