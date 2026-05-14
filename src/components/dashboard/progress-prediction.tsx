import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Target, Calendar, Sparkles, Info } from "lucide-react";

// Generate prediction data based on current stats
function generatePrediction(metric: string) {
  const now = new Date();
  const data = [];
  const baseValues: Record<string, { current: number; monthlyGain: number; unit: string }> = {
    weight: { current: 78, monthlyGain: -1.5, unit: "kg" },
    strength: { current: 60, monthlyGain: 5, unit: "kg 1RM" },
    endurance: { current: 25, monthlyGain: 3, unit: "min" },
    consistency: { current: 65, monthlyGain: 8, unit: "%" },
  };

  const config = baseValues[metric] || baseValues.consistency;

  for (let i = -2; i <= 3; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = month.toLocaleDateString("en", { month: "short", year: "2-digit" });
    const value = Math.round((config.current + config.monthlyGain * i) * 10) / 10;
    const isPast = i <= 0;
    data.push({
      month: label,
      actual: isPast ? value : undefined,
      predicted: !isPast ? value : undefined,
      value,
      isPast,
    });
  }

  return { data, unit: config.unit, current: config.current, predicted: Math.round((config.current + config.monthlyGain * 3) * 10) / 10 };
}

export function ProgressPrediction() {
  const [metric, setMetric] = useState("consistency");
  const prediction = generatePrediction(metric);

  const metricLabels: Record<string, string> = {
    weight: "Body Weight",
    strength: "Bench Press 1RM",
    endurance: "Run Duration",
    consistency: "Workout Consistency",
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-cyan-500" />
            3-Month Forecast
            <Badge variant="outline" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />AI Predicted</Badge>
          </span>
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[160px] h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="consistency">Consistency</SelectItem>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="endurance">Endurance</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
            <p className="text-xs text-muted-foreground">Now</p>
            <p className="text-xl font-bold text-primary">{prediction.current}</p>
            <p className="text-xs text-muted-foreground">{prediction.unit}</p>
          </motion.div>
          <div className="flex-1 flex items-center gap-1">
            <div className="h-px flex-1 bg-gradient-to-r from-primary to-green-500" />
            <Target className="h-4 w-4 text-green-500" />
          </div>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="text-center">
            <p className="text-xs text-muted-foreground">In 3 months</p>
            <p className="text-xl font-bold text-green-500">{prediction.predicted}</p>
            <p className="text-xs text-muted-foreground">{prediction.unit}</p>
          </motion.div>
        </div>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={prediction.data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
              <Area type="monotone" dataKey="actual" stroke="hsl(var(--primary))" fill="url(#actualGrad)" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
              <Area type="monotone" dataKey="predicted" stroke="#10b981" fill="url(#predictedGrad)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-primary rounded" />Actual</div>
          <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-green-500 rounded border-dashed" style={{ borderTop: "1px dashed" }} />Predicted</div>
          <div className="flex items-center gap-1 ml-auto"><Info className="h-3 w-3" />Based on your current consistency</div>
        </div>
      </CardContent>
    </Card>
  );
}
