import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { storage, Meal } from "../utils/storage";
import { Calendar, Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

export function History() {
  const [meals, setMeals] = useState(storage.getMeals());
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const groupedMeals = useMemo(() => {
    const groups: { [key: string]: Meal[] } = {};
    
    meals.forEach(meal => {
      const date = new Date(meal.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(meal);
    });

    return Object.entries(groups).sort((a, b) => {
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  }, [meals]);

  const handleDelete = (id: string) => {
    storage.deleteMeal(id);
    setMeals(storage.getMeals());
    toast.success("Meal deleted");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const getDayTotal = (dayMeals: Meal[]) => {
    return {
      calories: dayMeals.reduce((sum, m) => sum + m.totalCalories, 0),
      protein: dayMeals.reduce((sum, m) => sum + m.totalProtein, 0),
      carbs: dayMeals.reduce((sum, m) => sum + m.totalCarbs, 0),
      fat: dayMeals.reduce((sum, m) => sum + m.totalFat, 0),
    };
  };

  if (meals.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Meal History</h2>
          <p className="text-gray-600">View and manage your tracked meals</p>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2">No meals tracked yet</h3>
              <p className="text-gray-600">Start scanning your meals to see them here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Meal History</h2>
        <p className="text-gray-600">{meals.length} meal{meals.length !== 1 ? 's' : ''} tracked</p>
      </div>

      <div className="space-y-6">
        {groupedMeals.map(([date, dayMeals]) => {
          const dayTotal = getDayTotal(dayMeals);
          
          return (
            <Card key={date}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      {formatDate(date)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {dayMeals.length} meal{dayMeals.length !== 1 ? 's' : ''} • {dayTotal.calories} calories
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 space-y-0.5">
                      <div>P: {dayTotal.protein}g</div>
                      <div>C: {dayTotal.carbs}g</div>
                      <div>F: {dayTotal.fat}g</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dayMeals.map((meal) => (
                    <div key={meal.id}>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        {meal.imageData && (
                          <img
                            src={meal.imageData}
                            alt="Meal"
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {meal.mealType && (
                              <Badge variant="outline" className="capitalize">
                                {meal.mealType}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-3 h-3" />
                              {new Date(meal.timestamp).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2 truncate">
                            {meal.foods.map(f => f.name).join(', ')}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span className="font-semibold text-orange-600">{meal.totalCalories} cal</span>
                            <span>P: {meal.totalProtein}g</span>
                            <span>C: {meal.totalCarbs}g</span>
                            <span>F: {meal.totalFat}g</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                          >
                            {expandedMeal === meal.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this meal?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove this meal from your history. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(meal.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      {expandedMeal === meal.id && (
                        <div className="mt-3 ml-4 p-4 bg-white border rounded-lg space-y-2">
                          <h4 className="font-medium text-sm mb-3">Food Items</h4>
                          {meal.foods.map((food, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div>
                                <p className="font-medium text-sm">{food.name}</p>
                                <p className="text-xs text-gray-600">{food.portionSize}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">{food.calories} cal</p>
                                <div className="text-xs text-gray-600 space-x-2">
                                  <span>P: {food.protein}g</span>
                                  <span>C: {food.carbs}g</span>
                                  <span>F: {food.fat}g</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
