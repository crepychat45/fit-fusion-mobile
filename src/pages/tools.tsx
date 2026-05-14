import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Activity, TrendingUp, Ruler, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ToolsPage = () => {
  const { toast } = useToast();
  
  // BMI Calculator State
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmiResult, setBmiResult] = useState<{ bmi: number; category: string; color: string } | null>(null);

  // TDEE Calculator State
  const [tdeeHeight, setTdeeHeight] = useState("");
  const [tdeeWeight, setTdeeWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activityLevel, setActivityLevel] = useState("1.2");
  const [tdeeResult, setTdeeResult] = useState<{ bmr: number; tdee: number } | null>(null);

  const calculateBMI = () => {
    const heightM = parseFloat(height) / 100;
    const weightKg = parseFloat(weight);
    
    if (!heightM || !weightKg || heightM <= 0 || weightKg <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid height and weight values",
        variant: "destructive"
      });
      return;
    }

    const bmi = weightKg / (heightM * heightM);
    let category = "";
    let color = "";

    if (bmi < 18.5) {
      category = "Underweight";
      color = "text-blue-500";
    } else if (bmi < 25) {
      category = "Normal weight";
      color = "text-green-500";
    } else if (bmi < 30) {
      category = "Overweight";
      color = "text-yellow-500";
    } else {
      category = "Obese";
      color = "text-red-500";
    }

    setBmiResult({ bmi: Math.round(bmi * 10) / 10, category, color });
  };

  const calculateTDEE = () => {
    const heightCm = parseFloat(tdeeHeight);
    const weightKg = parseFloat(tdeeWeight);
    const ageYears = parseFloat(age);
    const activity = parseFloat(activityLevel);

    if (!heightCm || !weightKg || !ageYears || heightCm <= 0 || weightKg <= 0 || ageYears <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid values for all fields",
        variant: "destructive"
      });
      return;
    }

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === "male") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
    }

    const tdee = bmr * activity;
    setTdeeResult({ bmr: Math.round(bmr), tdee: Math.round(tdee) });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-8 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Fitness Tools</h1>
            <p className="text-white/80">Track your health metrics and calculations</p>
          </div>
          <Calculator className="h-12 w-12 text-white/80" />
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4">
        <Tabs defaultValue="bmi" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="bmi" className="gap-2">
              <Scale className="h-4 w-4" />
              BMI Calculator
            </TabsTrigger>
            <TabsTrigger value="tdee" className="gap-2">
              <Activity className="h-4 w-4" />
              TDEE Calculator
            </TabsTrigger>
          </TabsList>

          {/* BMI Calculator */}
          <TabsContent value="bmi">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  Body Mass Index (BMI)
                </CardTitle>
                <CardDescription>
                  Calculate your BMI to understand your body composition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={calculateBMI} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate BMI
                </Button>

                {bmiResult && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border">
                    <div className="text-center space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Your BMI</p>
                        <p className="text-5xl font-bold text-primary">{bmiResult.bmi}</p>
                      </div>
                      <Badge className={`${bmiResult.color} text-lg px-4 py-2`}>
                        {bmiResult.category}
                      </Badge>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Reference:</strong>
                          <br />
                          Underweight: &lt; 18.5 | Normal: 18.5-24.9 | Overweight: 25-29.9 | Obese: ≥ 30
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">About BMI:</p>
                  <p className="text-muted-foreground">
                    BMI is a measure of body fat based on height and weight. While useful as a general guideline,
                    it doesn't account for muscle mass, bone density, or body composition. Consult with a healthcare
                    professional for a comprehensive assessment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TDEE Calculator */}
          <TabsContent value="tdee">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Total Daily Energy Expenditure (TDEE)
                </CardTitle>
                <CardDescription>
                  Calculate your daily calorie needs based on your activity level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tdee-height">Height (cm)</Label>
                    <Input
                      id="tdee-height"
                      type="number"
                      placeholder="170"
                      value={tdeeHeight}
                      onChange={(e) => setTdeeHeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tdee-weight">Weight (kg)</Label>
                    <Input
                      id="tdee-weight"
                      type="number"
                      placeholder="70"
                      value={tdeeWeight}
                      onChange={(e) => setTdeeWeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="30"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={(v) => setGender(v as "male" | "female")}>
                      <SelectTrigger id="gender">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">Activity Level</Label>
                  <Select value={activityLevel} onValueChange={setActivityLevel}>
                    <SelectTrigger id="activity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.2">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="1.375">Lightly active (1-3 days/week)</SelectItem>
                      <SelectItem value="1.55">Moderately active (3-5 days/week)</SelectItem>
                      <SelectItem value="1.725">Very active (6-7 days/week)</SelectItem>
                      <SelectItem value="1.9">Super active (athlete, 2x/day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={calculateTDEE} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate TDEE
                </Button>

                {tdeeResult && (
                  <div className="mt-6 space-y-4">
                    <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Basal Metabolic Rate (BMR)</p>
                        <p className="text-4xl font-bold text-primary">{tdeeResult.bmr}</p>
                        <p className="text-sm text-muted-foreground">calories/day at rest</p>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Total Daily Energy Expenditure (TDEE)</p>
                        <p className="text-5xl font-bold text-accent">{tdeeResult.tdee}</p>
                        <p className="text-sm text-muted-foreground">calories/day to maintain weight</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                        <CardContent className="pt-6 text-center">
                          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Weight Loss</p>
                          <p className="text-2xl font-bold">{tdeeResult.tdee - 500}</p>
                          <p className="text-xs text-muted-foreground mt-1">cal/day (-500)</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                        <CardContent className="pt-6 text-center">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Maintain</p>
                          <p className="text-2xl font-bold">{tdeeResult.tdee}</p>
                          <p className="text-xs text-muted-foreground mt-1">cal/day (±0)</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200">
                        <CardContent className="pt-6 text-center">
                          <p className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2">Muscle Gain</p>
                          <p className="text-2xl font-bold">{tdeeResult.tdee + 300}</p>
                          <p className="text-xs text-muted-foreground mt-1">cal/day (+300)</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">About TDEE:</p>
                  <p className="text-muted-foreground">
                    TDEE represents the total calories you burn in a day, including exercise and daily activities.
                    To lose weight, eat below your TDEE. To gain muscle, eat slightly above. These are estimates -
                    adjust based on your progress and consult a nutritionist for personalized advice.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
};

export default ToolsPage;