import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Activity,
  Utensils,
  Sparkles,
  TrendingUp,
  Calculator,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AIFitnessTools() {
  const [repMaxWeight, setRepMaxWeight] = useState("");
  const [repMaxReps, setRepMaxReps] = useState("");
  const [repMaxResult, setRepMaxResult] = useState<number | null>(null);

  const [bodyFat, setBodyFat] = useState({ weight: "", waist: "", neck: "", height: "", gender: "male" });
  const [bodyFatResult, setBodyFatResult] = useState<number | null>(null);

  const { toast } = useToast();

  const calculate1RM = () => {
    const weight = parseFloat(repMaxWeight);
    const reps = parseFloat(repMaxReps);
    
    if (!weight || !reps || reps < 1 || reps > 12) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid weight and reps (1-12)",
        variant: "destructive",
      });
      return;
    }

    // Epley Formula: 1RM = weight × (1 + reps/30)
    const oneRM = weight * (1 + reps / 30);
    setRepMaxResult(Math.round(oneRM * 10) / 10);
    
    toast({
      title: "Calculated!",
      description: `Your estimated 1 rep max is ${Math.round(oneRM * 10) / 10} kg`,
    });
  };

  const calculateBodyFat = () => {
    const { weight, waist, neck, height, gender } = bodyFat;
    
    if (!weight || !waist || !neck || !height) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all measurements",
        variant: "destructive",
      });
      return;
    }

    const w = parseFloat(weight);
    const waistCm = parseFloat(waist);
    const neckCm = parseFloat(neck);
    const heightCm = parseFloat(height);

    let result: number;
    
    if (gender === "male") {
      // US Navy Method for men
      result = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
    } else {
      // US Navy Method for women (requires hip measurement, using waist as approximation)
      result = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + 0 - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
    }

    setBodyFatResult(Math.max(0, Math.min(100, Math.round(result * 10) / 10)));
    
    toast({
      title: "Calculated!",
      description: `Estimated body fat: ${Math.round(result * 10) / 10}%`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">AI Fitness Tools</h3>
            <p className="text-xs text-muted-foreground font-normal">
              Advanced calculators powered by AI algorithms
            </p>
          </div>
          <Badge
            variant="outline"
            className="ml-auto bg-purple-50 text-purple-700 border-purple-200"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="1rm" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="1rm">
              <Calculator className="h-4 w-4 mr-2" />
              1RM Calculator
            </TabsTrigger>
            <TabsTrigger value="bodyfat">
              <Activity className="h-4 w-4 mr-2" />
              Body Fat %
            </TabsTrigger>
          </TabsList>

          <TabsContent value="1rm" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="weight">Weight Lifted (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="e.g., 100"
                  value={repMaxWeight}
                  onChange={(e) => setRepMaxWeight(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reps">Number of Reps</Label>
                <Input
                  id="reps"
                  type="number"
                  placeholder="e.g., 5"
                  value={repMaxReps}
                  onChange={(e) => setRepMaxReps(e.target.value)}
                />
              </div>
              <Button
                onClick={calculate1RM}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
              >
                Calculate 1 Rep Max
              </Button>

              {repMaxResult && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Estimated 1 Rep Max
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {repMaxResult} kg
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Based on Epley Formula
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold">Training Percentages:</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-white dark:bg-black/20 rounded">
                        <div className="font-medium">85% - 3 reps</div>
                        <div className="text-muted-foreground">
                          {Math.round(repMaxResult * 0.85)} kg
                        </div>
                      </div>
                      <div className="p-2 bg-white dark:bg-black/20 rounded">
                        <div className="font-medium">80% - 5 reps</div>
                        <div className="text-muted-foreground">
                          {Math.round(repMaxResult * 0.8)} kg
                        </div>
                      </div>
                      <div className="p-2 bg-white dark:bg-black/20 rounded">
                        <div className="font-medium">75% - 8 reps</div>
                        <div className="text-muted-foreground">
                          {Math.round(repMaxResult * 0.75)} kg
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bodyfat" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="bf-gender">Gender</Label>
                <select
                  id="bf-gender"
                  className="w-full p-2 border rounded-md"
                  value={bodyFat.gender}
                  onChange={(e) => setBodyFat({ ...bodyFat, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <Label htmlFor="bf-weight">Weight (kg)</Label>
                <Input
                  id="bf-weight"
                  type="number"
                  placeholder="e.g., 75"
                  value={bodyFat.weight}
                  onChange={(e) => setBodyFat({ ...bodyFat, weight: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bf-height">Height (cm)</Label>
                <Input
                  id="bf-height"
                  type="number"
                  placeholder="e.g., 175"
                  value={bodyFat.height}
                  onChange={(e) => setBodyFat({ ...bodyFat, height: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bf-waist">Waist (cm)</Label>
                <Input
                  id="bf-waist"
                  type="number"
                  placeholder="e.g., 85"
                  value={bodyFat.waist}
                  onChange={(e) => setBodyFat({ ...bodyFat, waist: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bf-neck">Neck (cm)</Label>
                <Input
                  id="bf-neck"
                  type="number"
                  placeholder="e.g., 38"
                  value={bodyFat.neck}
                  onChange={(e) => setBodyFat({ ...bodyFat, neck: e.target.value })}
                />
              </div>
              <Button
                onClick={calculateBodyFat}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
              >
                Calculate Body Fat %
              </Button>

              {bodyFatResult !== null && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Estimated Body Fat Percentage
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {bodyFatResult}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Based on US Navy Method
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold">Category:</p>
                    <div className="p-2 bg-white dark:bg-black/20 rounded text-sm">
                      {bodyFatResult < 6 ? "Essential Fat" :
                       bodyFatResult < 14 ? "Athletes" :
                       bodyFatResult < 18 ? "Fitness" :
                       bodyFatResult < 25 ? "Average" :
                       "Above Average"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
