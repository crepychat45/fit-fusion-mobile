import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Bell,
  Volume2,
  Vibrate,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Navigation,
} from "lucide-react";

interface FindDeviceProps {
  deviceName: string;
  deviceConnected: boolean;
  lastLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
}

export const FindMyDevice: React.FC<FindDeviceProps> = ({
  deviceName,
  deviceConnected,
  lastLocation,
}) => {
  const { toast } = useToast();
  const [isRinging, setIsRinging] = useState(false);
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState(lastLocation);

  const handlePing = (type: "sound" | "vibrate") => {
    if (!deviceConnected) {
      toast({
        title: "Device Not Connected",
        description: "Your device must be connected to use this feature",
        variant: "destructive",
      });
      return;
    }

    setIsRinging(true);
    const pingType = type === "sound" ? "making a sound" : "vibrating";
    
    toast({
      title: `${deviceName} is ${pingType}`,
      description: "Your watch should be alerting you now",
    });

    // Simulate ping duration
    setTimeout(() => {
      setIsRinging(false);
      toast({
        title: "Ping Complete",
        description: "Did you find your device?",
      });
    }, 5000);
  };

  const handleLocate = () => {
    setLocating(true);
    
    // Simulate location fetch
    setTimeout(() => {
      const mockLocation = {
        lat: 37.7749 + (Math.random() - 0.5) * 0.01,
        lng: -122.4194 + (Math.random() - 0.5) * 0.01,
        timestamp: new Date().toISOString(),
      };
      setLocation(mockLocation);
      setLocating(false);

      toast({
        title: "Location Found",
        description: "Your device's last known location has been updated",
      });
    }, 2000);
  };

  const openInMaps = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">Device Status</h3>
              <p className="text-sm text-muted-foreground">{deviceName}</p>
            </div>
            <Badge
              variant={deviceConnected ? "default" : "secondary"}
              className={deviceConnected ? "bg-green-500" : ""}
            >
              {deviceConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last seen:</span>
              <span className="font-medium">
                {location
                  ? new Date(location.timestamp).toLocaleString()
                  : "Unknown"}
              </span>
            </div>
            {location && (
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Find My Device</h3>
            <p className="text-sm text-muted-foreground">
              Make your watch alert you with sound or vibration
            </p>
          </div>

          <AnimatePresence>
            {isRinging && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg bg-primary/10 p-4 border border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Bell className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Device is ringing...</p>
                    <Progress value={66} className="h-1 mt-2" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handlePing("sound")}
              disabled={!deviceConnected || isRinging}
              className="gap-2"
              variant="outline"
            >
              <Volume2 className="h-4 w-4" />
              Play Sound
            </Button>
            <Button
              onClick={() => handlePing("vibrate")}
              disabled={!deviceConnected || isRinging}
              className="gap-2"
              variant="outline"
            >
              <Vibrate className="h-4 w-4" />
              Vibrate
            </Button>
          </div>

          {!deviceConnected && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-600 dark:text-yellow-500">
                  Device Not Connected
                </p>
                <p className="text-muted-foreground">
                  Connect your device to use find features
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Last Known Location</h3>
            <p className="text-sm text-muted-foreground">
              View your device's last recorded position
            </p>
          </div>

          {locating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <MapPin className="h-8 w-8 text-primary" />
              </motion.div>
              <p className="text-sm text-muted-foreground mt-2">
                Locating device...
              </p>
            </motion.div>
          )}

          {!locating && location && (
            <div className="space-y-3">
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${location.lat},${location.lng}&zoom=15`}
                  allowFullScreen
                  title="Device Location"
                  className="rounded-lg"
                />
              </div>
              <Button
                onClick={openInMaps}
                variant="outline"
                className="w-full gap-2"
              >
                <Navigation className="h-4 w-4" />
                Open in Maps
              </Button>
            </div>
          )}

          {!locating && !location && (
            <div className="text-center py-6 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No location data available</p>
            </div>
          )}

          <Button
            onClick={handleLocate}
            disabled={locating || !deviceConnected}
            className="w-full gap-2"
          >
            <MapPin className="h-4 w-4" />
            {locating ? "Locating..." : "Update Location"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
