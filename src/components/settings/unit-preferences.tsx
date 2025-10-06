import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ruler, Weight, Thermometer, Globe, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function UnitPreferences() {
  const { toast } = useToast();

  // Unit preferences
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [distanceUnit, setDistanceUnit] = useState<"km" | "miles">("km");
  const [temperatureUnit, setTemperatureUnit] = useState<"celsius" | "fahrenheit">("celsius");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");
  const [firstDayOfWeek, setFirstDayOfWeek] = useState("monday");

  // Load saved preferences
  useEffect(() => {
    const savedPrefs = localStorage.getItem("fitfusion-unit-preferences");
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        setWeightUnit(prefs.weightUnit || "kg");
        setHeightUnit(prefs.heightUnit || "cm");
        setDistanceUnit(prefs.distanceUnit || "km");
        setTemperatureUnit(prefs.temperatureUnit || "celsius");
        setDateFormat(prefs.dateFormat || "DD/MM/YYYY");
        setTimeFormat(prefs.timeFormat || "24h");
        setFirstDayOfWeek(prefs.firstDayOfWeek || "monday");
      } catch (error) {
        console.error("Error loading unit preferences:", error);
      }
    }
  }, []);

  const handleSavePreferences = () => {
    const preferences = {
      weightUnit,
      heightUnit,
      distanceUnit,
      temperatureUnit,
      dateFormat,
      timeFormat,
      firstDayOfWeek,
    };

    localStorage.setItem("fitfusion-unit-preferences", JSON.stringify(preferences));

    // Dispatch event to notify other components of unit change
    window.dispatchEvent(new CustomEvent("unitPreferencesChanged", { detail: preferences }));

    toast({
      title: "✅ Preferences Saved",
      description: "Your unit preferences have been updated.",
    });
  };

  const setMetricSystem = () => {
    setWeightUnit("kg");
    setHeightUnit("cm");
    setDistanceUnit("km");
    setTemperatureUnit("celsius");
    toast({
      title: "Metric System Applied",
      description: "All units have been set to metric.",
    });
  };

  const setImperialSystem = () => {
    setWeightUnit("lbs");
    setHeightUnit("ft");
    setDistanceUnit("miles");
    setTemperatureUnit("fahrenheit");
    toast({
      title: "Imperial System Applied",
      description: "All units have been set to imperial.",
    });
  };

  // Conversion examples
  const getWeightExample = () => {
    return weightUnit === "kg" ? "70 kg" : "154 lbs";
  };

  const getHeightExample = () => {
    return heightUnit === "cm" ? "175 cm" : "5'9\"";
  };

  const getDistanceExample = () => {
    return distanceUnit === "km" ? "5 km" : "3.1 miles";
  };

  return (
    <div className="space-y-6">
      {/* Quick System Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Measurement System
          </CardTitle>
          <CardDescription>
            Choose your preferred measurement system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={weightUnit === "kg" && heightUnit === "cm" ? "default" : "outline"}
              onClick={setMetricSystem}
              className="h-auto py-4 flex-col gap-2"
            >
              <span className="text-lg font-bold">Metric</span>
              <span className="text-xs text-muted-foreground">
                kg, cm, km, °C
              </span>
            </Button>
            <Button
              variant={weightUnit === "lbs" && heightUnit === "ft" ? "default" : "outline"}
              onClick={setImperialSystem}
              className="h-auto py-4 flex-col gap-2"
            >
              <span className="text-lg font-bold">Imperial</span>
              <span className="text-xs text-muted-foreground">
                lbs, ft/in, miles, °F
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Physical Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Physical Measurements
          </CardTitle>
          <CardDescription>
            Set your preferred units for body measurements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weight Unit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-primary" />
                <Label>Weight Unit</Label>
              </div>
              <Badge variant="outline">{getWeightExample()}</Badge>
            </div>
            <RadioGroup value={weightUnit} onValueChange={(value: "kg" | "lbs") => setWeightUnit(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kg" id="kg" />
                <Label htmlFor="kg" className="cursor-pointer">
                  Kilograms (kg)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lbs" id="lbs" />
                <Label htmlFor="lbs" className="cursor-pointer">
                  Pounds (lbs)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Height Unit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                <Label>Height Unit</Label>
              </div>
              <Badge variant="outline">{getHeightExample()}</Badge>
            </div>
            <RadioGroup value={heightUnit} onValueChange={(value: "cm" | "ft") => setHeightUnit(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cm" id="cm" />
                <Label htmlFor="cm" className="cursor-pointer">
                  Centimeters (cm)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ft" id="ft" />
                <Label htmlFor="ft" className="cursor-pointer">
                  Feet & Inches (ft/in)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Distance Unit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                <Label>Distance Unit</Label>
              </div>
              <Badge variant="outline">{getDistanceExample()}</Badge>
            </div>
            <RadioGroup value={distanceUnit} onValueChange={(value: "km" | "miles") => setDistanceUnit(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="km" id="km" />
                <Label htmlFor="km" className="cursor-pointer">
                  Kilometers (km)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="miles" id="miles" />
                <Label htmlFor="miles" className="cursor-pointer">
                  Miles (mi)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Temperature & Regional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Temperature & Regional Settings
          </CardTitle>
          <CardDescription>
            Configure temperature and regional preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Temperature Unit */}
          <div className="space-y-3">
            <Label>Temperature Unit</Label>
            <RadioGroup value={temperatureUnit} onValueChange={(value: "celsius" | "fahrenheit") => setTemperatureUnit(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="celsius" id="celsius" />
                <Label htmlFor="celsius" className="cursor-pointer">
                  Celsius (°C)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fahrenheit" id="fahrenheit" />
                <Label htmlFor="fahrenheit" className="cursor-pointer">
                  Fahrenheit (°F)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger id="dateFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                <SelectItem value="DD MMM YYYY">DD MMM YYYY (31 Dec 2024)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Format */}
          <div className="space-y-3">
            <Label>Time Format</Label>
            <RadioGroup value={timeFormat} onValueChange={(value: "12h" | "24h") => setTimeFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="12h" id="12h" />
                <Label htmlFor="12h" className="cursor-pointer">
                  12-hour (2:30 PM)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="24h" id="24h" />
                <Label htmlFor="24h" className="cursor-pointer">
                  24-hour (14:30)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* First Day of Week */}
          <div className="space-y-2">
            <Label htmlFor="firstDay">First Day of Week</Label>
            <Select value={firstDayOfWeek} onValueChange={setFirstDayOfWeek}>
              <SelectTrigger id="firstDay">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setMetricSystem();
            setDateFormat("DD/MM/YYYY");
            setTimeFormat("24h");
            setFirstDayOfWeek("monday");
          }}
        >
          Reset to Defaults
        </Button>
        <Button onClick={handleSavePreferences}>
          <Globe className="h-4 w-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
