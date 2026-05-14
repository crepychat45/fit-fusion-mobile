import React, { useState, useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Apple, ChefHat, Plus, Trash2, Clock, Flame, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  id: string;
  name: string;
  protein: number;
  calories: number;
  prepTime: string;
  ingredients: string[];
  instructions: string;
}

interface FoodLog {
  id: string;
  date: string;
  meal: string;
  food: string;
  calories: number;
  protein: number;
}

const recipes: Recipe[] = [
  {
    id: "1",
    name: "Grilled Chicken & Quinoa Bowl",
    protein: 45,
    calories: 520,
    prepTime: "25 min",
    ingredients: ["200g chicken breast", "1 cup quinoa", "Mixed vegetables", "Olive oil", "Lemon"],
    instructions: "1. Cook quinoa according to package. 2. Grill seasoned chicken breast. 3. Sauté vegetables. 4. Combine and drizzle with olive oil and lemon."
  },
  {
    id: "2",
    name: "Greek Yogurt Protein Bowl",
    protein: 30,
    calories: 350,
    prepTime: "5 min",
    ingredients: ["300g Greek yogurt", "1 scoop protein powder", "Berries", "Almonds", "Honey"],
    instructions: "1. Mix Greek yogurt with protein powder. 2. Top with fresh berries and almonds. 3. Drizzle with honey."
  },
  {
    id: "3",
    name: "Salmon & Sweet Potato",
    protein: 38,
    calories: 480,
    prepTime: "30 min",
    ingredients: ["180g salmon fillet", "1 large sweet potato", "Asparagus", "Garlic", "Herbs"],
    instructions: "1. Bake sweet potato at 200°C. 2. Pan-sear salmon with garlic. 3. Steam asparagus. 4. Season and serve."
  },
  {
    id: "4",
    name: "Protein Smoothie Bowl",
    protein: 35,
    calories: 400,
    prepTime: "10 min",
    ingredients: ["2 scoops protein powder", "Banana", "Spinach", "Almond milk", "Granola"],
    instructions: "1. Blend protein powder, banana, spinach with almond milk. 2. Pour into bowl. 3. Top with granola and fresh fruit."
  },
  {
    id: "5",
    name: "Turkey & Veggie Stir-Fry",
    protein: 40,
    calories: 450,
    prepTime: "20 min",
    ingredients: ["200g ground turkey", "Mixed vegetables", "Brown rice", "Soy sauce", "Ginger"],
    instructions: "1. Cook brown rice. 2. Stir-fry turkey with vegetables. 3. Add soy sauce and ginger. 4. Serve over rice."
  },
  {
    id: "6",
    name: "Egg White Omelette",
    protein: 25,
    calories: 250,
    prepTime: "10 min",
    ingredients: ["6 egg whites", "Spinach", "Mushrooms", "Tomatoes", "Low-fat cheese"],
    instructions: "1. Whisk egg whites. 2. Pour into hot pan. 3. Add vegetables and cheese. 4. Fold and serve."
  }
];

const NutritionPage = () => {
  const { toast } = useToast();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>(() => {
    const saved = localStorage.getItem("food-logs");
    return saved ? JSON.parse(saved) : [];
  });

  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    meal: "",
    food: "",
    calories: "",
    protein: ""
  });

  useEffect(() => {
    localStorage.setItem("food-logs", JSON.stringify(foodLogs));
  }, [foodLogs]);

  const addFoodLog = () => {
    if (!newLog.meal || !newLog.food || !newLog.calories || !newLog.protein) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const log: FoodLog = {
      id: Date.now().toString(),
      date: newLog.date,
      meal: newLog.meal,
      food: newLog.food,
      calories: parseFloat(newLog.calories),
      protein: parseFloat(newLog.protein)
    };

    setFoodLogs([...foodLogs, log]);
    setNewLog({
      date: new Date().toISOString().split('T')[0],
      meal: "",
      food: "",
      calories: "",
      protein: ""
    });

    toast({
      title: "Food Logged",
      description: `${log.food} added to ${log.meal}`
    });
  };

  const deleteFoodLog = (id: string) => {
    setFoodLogs(foodLogs.filter(log => log.id !== id));
    toast({
      title: "Entry Deleted",
      description: "Food log has been removed"
    });
  };

  const todayLogs = foodLogs.filter(log => log.date === new Date().toISOString().split('T')[0]);
  const todayCalories = todayLogs.reduce((sum, log) => sum + log.calories, 0);
  const todayProtein = todayLogs.reduce((sum, log) => sum + log.protein, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-8 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Nutrition</h1>
            <p className="text-white/80">Fuel your fitness journey</p>
          </div>
          <Apple className="h-12 w-12 text-white/80" />
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4">
        <Tabs defaultValue="recipes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="recipes" className="gap-2">
              <ChefHat className="h-4 w-4" />
              Recipes
            </TabsTrigger>
            <TabsTrigger value="logger" className="gap-2">
              <Utensils className="h-4 w-4" />
              Food Logger
            </TabsTrigger>
          </TabsList>

          {/* Recipe Library */}
          <TabsContent value="recipes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.map((recipe) => (
                <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{recipe.name}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="gap-1">
                            <Flame className="h-3 w-3" />
                            {recipe.calories} cal
                          </Badge>
                          <Badge variant="secondary">
                            {recipe.protein}g protein
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {recipe.prepTime}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Ingredients:</h4>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
                      <p className="text-sm text-muted-foreground">{recipe.instructions}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Food Logger */}
          <TabsContent value="logger" className="space-y-6">
            {/* Today's Summary */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Today's Calories</p>
                      <p className="text-3xl font-bold">{todayCalories}</p>
                    </div>
                    <Flame className="h-10 w-10 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Today's Protein</p>
                      <p className="text-3xl font-bold">{todayProtein}g</p>
                    </div>
                    <Apple className="h-10 w-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Food Log */}
            <Card>
              <CardHeader>
                <CardTitle>Log Your Meals</CardTitle>
                <CardDescription>Track your daily food intake</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="log-date">Date</Label>
                    <Input
                      id="log-date"
                      type="date"
                      value={newLog.date}
                      onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meal">Meal</Label>
                    <select
                      id="meal"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={newLog.meal}
                      onChange={(e) => setNewLog({ ...newLog, meal: e.target.value })}
                    >
                      <option value="">Select meal</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food">Food Description</Label>
                  <Input
                    id="food"
                    placeholder="e.g., Grilled chicken with rice"
                    value={newLog.food}
                    onChange={(e) => setNewLog({ ...newLog, food: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="log-calories">Calories</Label>
                    <Input
                      id="log-calories"
                      type="number"
                      placeholder="500"
                      value={newLog.calories}
                      onChange={(e) => setNewLog({ ...newLog, calories: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="log-protein">Protein (g)</Label>
                    <Input
                      id="log-protein"
                      type="number"
                      placeholder="30"
                      value={newLog.protein}
                      onChange={(e) => setNewLog({ ...newLog, protein: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={addFoodLog} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food Log
                </Button>
              </CardContent>
            </Card>

            {/* Food Log History */}
            {foodLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Food Log History</CardTitle>
                  <CardDescription>Your meal tracking history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {foodLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{log.meal}</Badge>
                            <span className="text-xs text-muted-foreground">{log.date}</span>
                          </div>
                          <p className="font-medium">{log.food}</p>
                          <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3" />
                              {log.calories} cal
                            </span>
                            <span>{log.protein}g protein</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFoodLog(log.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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

export default NutritionPage;