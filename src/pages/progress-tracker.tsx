import React, { useState, useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Ruler, TrendingUp, Calendar, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface WeightEntry {
  date: string;
  weight: number;
}

interface MeasurementEntry {
  date: string;
  waist: number;
  chest: number;
  arms: number;
  thighs: number;
}

const ProgressTrackerPage = () => {
  const { toast } = useToast();
  
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(() => {
    const saved = localStorage.getItem("weight-log");
    return saved ? JSON.parse(saved) : [];
  });

  const [measurements, setMeasurements] = useState<MeasurementEntry[]>(() => {
    const saved = localStorage.getItem("measurements-log");
    return saved ? JSON.parse(saved) : [];
  });

  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [newMeasurement, setNewMeasurement] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    waist: "",
    chest: "",
    arms: "",
    thighs: ""
  });

  useEffect(() => {
    localStorage.setItem("weight-log", JSON.stringify(weightEntries));
  }, [weightEntries]);

  useEffect(() => {
    localStorage.setItem("measurements-log", JSON.stringify(measurements));
  }, [measurements]);

  const addWeightEntry = () => {
    const weight = parseFloat(newWeight);
    if (!weight || weight <= 0) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid weight value",
        variant: "destructive"
      });
      return;
    }

    const newEntry: WeightEntry = {
      date: newDate,
      weight
    };

    setWeightEntries([...weightEntries, newEntry].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
    
    setNewWeight("");
    toast({
      title: "Weight Logged",
      description: `${weight}kg recorded for ${format(new Date(newDate), "MMM dd, yyyy")}`
    });
  };

  const deleteWeightEntry = (index: number) => {
    setWeightEntries(weightEntries.filter((_, i) => i !== index));
    toast({
      title: "Entry Deleted",
      description: "Weight entry has been removed"
    });
  };

  const addMeasurement = () => {
    const waist = parseFloat(newMeasurement.waist);
    const chest = parseFloat(newMeasurement.chest);
    const arms = parseFloat(newMeasurement.arms);
    const thighs = parseFloat(newMeasurement.thighs);

    if (!waist || !chest || !arms || !thighs) {
      toast({
        title: "Invalid Measurements",
        description: "Please enter all measurement values",
        variant: "destructive"
      });
      return;
    }

    const entry: MeasurementEntry = {
      date: newMeasurement.date,
      waist,
      chest,
      arms,
      thighs
    };

    setMeasurements([...measurements, entry].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));

    setNewMeasurement({
      date: format(new Date(), "yyyy-MM-dd"),
      waist: "",
      chest: "",
      arms: "",
      thighs: ""
    });

    toast({
      title: "Measurements Logged",
      description: "Your body measurements have been recorded"
    });
  };

  const deleteMeasurement = (index: number) => {
    setMeasurements(measurements.filter((_, i) => i !== index));
    toast({
      title: "Entry Deleted",
      description: "Measurement entry has been removed"
    });
  };

  const chartData = weightEntries.map(entry => ({
    date: format(new Date(entry.date), "MMM dd"),
    weight: entry.weight
  }));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-8 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Progress Tracker</h1>
            <p className="text-white/80">Monitor your fitness journey</p>
          </div>
          <TrendingUp className="h-12 w-12 text-white/80" />
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4">
        <Tabs defaultValue="weight" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="weight" className="gap-2">
              <Scale className="h-4 w-4" />
              Bodyweight
            </TabsTrigger>
            <TabsTrigger value="measurements" className="gap-2">
              <Ruler className="h-4 w-4" />
              Measurements
            </TabsTrigger>
          </TabsList>

          {/* Weight Tracker */}
          <TabsContent value="weight" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Log Your Weight</CardTitle>
                <CardDescription>Track your weight over time to monitor progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-weight">Weight (kg)</Label>
                    <Input
                      id="new-weight"
                      type="number"
                      step="0.1"
                      placeholder="70.5"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={addWeightEntry} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </CardContent>
            </Card>

            {weightEntries.length > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Weight Progress Chart</CardTitle>
                    <CardDescription>Visual representation of your weight over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--primary))", r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weight History</CardTitle>
                    <CardDescription>Your recorded weight entries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {weightEntries.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{entry.weight} kg</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(entry.date), "MMMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteWeightEntry(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Measurements Tracker */}
          <TabsContent value="measurements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Log Your Measurements</CardTitle>
                <CardDescription>Track body measurements in centimeters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meas-date">Date</Label>
                  <Input
                    id="meas-date"
                    type="date"
                    value={newMeasurement.date}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="waist">Waist (cm)</Label>
                    <Input
                      id="waist"
                      type="number"
                      step="0.1"
                      placeholder="75.0"
                      value={newMeasurement.waist}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, waist: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chest">Chest (cm)</Label>
                    <Input
                      id="chest"
                      type="number"
                      step="0.1"
                      placeholder="95.0"
                      value={newMeasurement.chest}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, chest: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arms">Arms (cm)</Label>
                    <Input
                      id="arms"
                      type="number"
                      step="0.1"
                      placeholder="35.0"
                      value={newMeasurement.arms}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, arms: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thighs">Thighs (cm)</Label>
                    <Input
                      id="thighs"
                      type="number"
                      step="0.1"
                      placeholder="55.0"
                      value={newMeasurement.thighs}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, thighs: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={addMeasurement} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Measurements
                </Button>
              </CardContent>
            </Card>

            {measurements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Measurement History</CardTitle>
                  <CardDescription>Track changes in your body measurements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {measurements.map((entry, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">
                              {format(new Date(entry.date), "MMMM dd, yyyy")}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMeasurement(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Waist:</span>
                            <span className="ml-2 font-semibold">{entry.waist} cm</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Chest:</span>
                            <span className="ml-2 font-semibold">{entry.chest} cm</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Arms:</span>
                            <span className="ml-2 font-semibold">{entry.arms} cm</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Thighs:</span>
                            <span className="ml-2 font-semibold">{entry.thighs} cm</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
};

export default ProgressTrackerPage;