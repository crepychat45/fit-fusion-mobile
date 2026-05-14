import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";

export function WeatherWidget() {
  const [weather, setWeather] = useState({
    temperature: 24,
    condition: "sunny",
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    uvIndex: 6,
    workoutRating: "excellent",
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return Sun;
      case "cloudy":
        return Cloud;
      case "rainy":
        return CloudRain;
      default:
        return Sun;
    }
  };

  const getWorkoutRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "bg-green-100 text-green-700 border-green-300";
      case "good":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "fair":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "poor":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const WeatherIcon = getWeatherIcon(weather.condition);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <WeatherIcon className="h-4 w-4 text-primary" />
          Weather & Workout Conditions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{weather.temperature}°C</p>
            <p className="text-sm text-muted-foreground capitalize">
              {weather.condition}
            </p>
          </div>
          <motion.div
            animate={{
              rotate: weather.condition === "sunny" ? [0, 360] : 0,
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: weather.condition === "sunny" ? 20 : 2,
              repeat: weather.condition === "sunny" ? Infinity : 0,
              ease: "linear",
            }}
          >
            <WeatherIcon className="h-8 w-8 text-yellow-500" />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Droplets className="h-3 w-3 text-blue-500" />
            <span>{weather.humidity}% Humidity</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="h-3 w-3 text-gray-500" />
            <span>{weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3 text-green-500" />
            <span>{weather.visibility}km Visibility</span>
          </div>
          <div className="flex items-center gap-1">
            <Sun className="h-3 w-3 text-orange-500" />
            <span>UV {weather.uvIndex}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Workout Rating</span>
            <Badge
              variant="outline"
              className={getWorkoutRatingColor(weather.workoutRating)}
            >
              {weather.workoutRating}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Perfect conditions for outdoor activities!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
