import { useMemo, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { storage } from "../utils/storage";
import { Camera, TrendingUp, Target, Flame, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { updateBadgeMetrics } from "../utils/badges";

export function Dashboard() {
  const profile = storage.getProfile();
  const todaysMeals = storage.getTodaysMeals();
  const weekMeals = storage.getWeekMeals();

  // Update badge metrics when dashboard loads
  useEffect(() => {
    updateBadgeMetrics();
  }, []);

  const todaysStats = useMemo(() => {
    return {
      calories: todaysMeals.reduce((sum, meal) => sum + meal.totalCalories, 0),
      protein: todaysMeals.reduce((sum, meal) => sum + meal.totalProtein, 0),
      carbs: todaysMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0),
      fat: todaysMeals.reduce((sum, meal) => sum + meal.totalFat, 0),
    };
  }, [todaysMeals]);

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - ((today + 6) % 7));

    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + index);
      const dateStr = date.toDateString();
      
      const dayMeals = weekMeals.filter(m => new Date(m.timestamp).toDateString() === dateStr);
      const calories = dayMeals.reduce((sum, m) => sum + m.totalCalories, 0);
      
      return { day, calories, target: profile?.targetCalories || 2000 };
    });
  }, [weekMeals, profile]);

  const macroData = [
    { name: 'Protein', value: todaysStats.protein, color: '#3b82f6' },
    { name: 'Carbs', value: todaysStats.carbs, color: '#10b981' },
    { name: 'Fat', value: todaysStats.fat, color: '#f59e0b' },
  ];

  if (!profile) {
    return null;
  }

  const calorieProgress = (todaysStats.calories / profile.targetCalories) * 100;
  const proteinProgress = (todaysStats.protein / profile.targetProtein) * 100;
  const carbsProgress = (todaysStats.carbs / profile.targetCarbs) * 100;
  const fatProgress = (todaysStats.fat / profile.targetFat) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-1">Welcome back, {profile.name}!</h2>
        <p className="text-gray-600">Here's your nutrition overview for today</p>
      </div>

      {/* Quick Action */}
      {todaysMeals.length === 0 && (
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Ready to track your first meal?</h3>
                <p className="text-green-50">Take a photo to get started</p>
              </div>
              <Link to="/dashboard/camera">
                <Button variant="secondary" size="lg">
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Meal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Daily Progress
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium">Calories</p>
                <p className="text-sm text-gray-600">
                  {todaysStats.calories} / {profile.targetCalories} kcal
                </p>
              </div>
              <Badge variant={calorieProgress > 100 ? "destructive" : "secondary"}>
                {Math.round(calorieProgress)}%
              </Badge>
            </div>
            <Progress value={Math.min(calorieProgress, 100)} className="h-2" />
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-700">Protein</p>
              </div>
              <div className="space-y-1">
                <Progress value={Math.min(proteinProgress, 100)} className="h-2" />
                <p className="text-xs text-gray-600">
                  {todaysStats.protein}g / {profile.targetProtein}g
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-green-700">Carbs</p>
              </div>
              <div className="space-y-1">
                <Progress value={Math.min(carbsProgress, 100)} className="h-2" />
                <p className="text-xs text-gray-600">
                  {todaysStats.carbs}g / {profile.targetCarbs}g
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-yellow-700">Fat</p>
              </div>
              <div className="space-y-1">
                <Progress value={Math.min(fatProgress, 100)} className="h-2" />
                <p className="text-xs text-gray-600">
                  {todaysStats.fat}g / {profile.targetFat}g
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Calories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Weekly Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="calories" fill="#10b981" radius={[4, 4, 0, 0]} name="Calories" />
                <Bar dataKey="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Macro Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Macro Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {macroData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {macroData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}: {item.value}g</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Meals */}
      {todaysMeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Today's Meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysMeals.slice(0, 3).map((meal) => (
                <div key={meal.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  {meal.imageData && (
                    <img
                      src={meal.imageData}
                      alt="Meal"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium capitalize">{meal.mealType || 'Meal'}</p>
                      <Badge variant="outline" className="text-xs">
                        {new Date(meal.timestamp).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {meal.foods.map(f => f.name).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{meal.totalCalories}</p>
                    <p className="text-xs text-gray-600">calories</p>
                  </div>
                </div>
              ))}
            </div>
            {todaysMeals.length > 3 && (
              <Link to="/dashboard/history">
                <Button variant="outline" className="w-full mt-4">
                  View All Meals
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}