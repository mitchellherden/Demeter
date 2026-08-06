// Personalized recipe recommendations.
// It measures remaining calories/macros and suggests recipes that match the user's goal.
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { storage } from "../utils/storage";
import { Sparkles, ChefHat, TrendingUp, Clock } from "lucide-react";

interface Recipe {
  id: string;
  name: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  ingredients: string[];
  instructions: string[];
  suitableFor: string[];
}

export function Recommendations() {
  const profile = storage.getProfile();
  const todaysMeals = storage.getTodaysMeals();

  const todaysStats = useMemo(() => {
    return {
      calories: todaysMeals.reduce((sum, meal) => sum + meal.totalCalories, 0),
      protein: todaysMeals.reduce((sum, meal) => sum + meal.totalProtein, 0),
      carbs: todaysMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0),
      fat: todaysMeals.reduce((sum, meal) => sum + meal.totalFat, 0),
    };
  }, [todaysMeals]);

  if (!profile) {
    return null;
  }

  const remaining = {
    calories: profile.targetCalories - todaysStats.calories,
    protein: profile.targetProtein - todaysStats.protein,
    carbs: profile.targetCarbs - todaysStats.carbs,
    fat: profile.targetFat - todaysStats.fat,
  };

  // Mock recipe database
  const allRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Grilled Chicken Salad',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      calories: 350,
      protein: 35,
      carbs: 20,
      fat: 15,
      prepTime: '20 min',
      difficulty: 'Easy',
      tags: ['High Protein', 'Low Carb', 'Gluten Free'],
      suitableFor: ['weight-loss', 'muscle-gain'],
      ingredients: [
        '200g chicken breast',
        'Mixed greens',
        'Cherry tomatoes',
        'Cucumber',
        'Olive oil',
        'Lemon juice',
      ],
      instructions: [
        'Season and grill chicken breast',
        'Chop vegetables',
        'Mix greens and vegetables',
        'Slice chicken and place on salad',
        'Drizzle with olive oil and lemon',
      ],
    },
    {
      id: '2',
      name: 'Quinoa Buddha Bowl',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      calories: 450,
      protein: 18,
      carbs: 65,
      fat: 12,
      prepTime: '30 min',
      difficulty: 'Easy',
      tags: ['Vegetarian', 'High Fiber', 'Balanced'],
      suitableFor: ['maintain', 'general-health'],
      ingredients: [
        '1 cup quinoa',
        'Roasted sweet potato',
        'Chickpeas',
        'Avocado',
        'Spinach',
        'Tahini dressing',
      ],
      instructions: [
        'Cook quinoa according to package',
        'Roast sweet potato and chickpeas',
        'Arrange quinoa in bowl',
        'Top with vegetables and chickpeas',
        'Drizzle with tahini dressing',
      ],
    },
    {
      id: '3',
      name: 'Salmon with Asparagus',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      calories: 420,
      protein: 40,
      carbs: 15,
      fat: 22,
      prepTime: '25 min',
      difficulty: 'Medium',
      tags: ['High Protein', 'Omega-3', 'Low Carb'],
      suitableFor: ['weight-loss', 'muscle-gain', 'general-health'],
      ingredients: [
        '200g salmon fillet',
        'Fresh asparagus',
        'Garlic',
        'Lemon',
        'Olive oil',
        'Herbs',
      ],
      instructions: [
        'Preheat oven to 400°F',
        'Season salmon with herbs and lemon',
        'Toss asparagus with olive oil and garlic',
        'Bake for 15-18 minutes',
        'Serve immediately',
      ],
    },
    {
      id: '4',
      name: 'Protein Pancakes',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
      calories: 380,
      protein: 30,
      carbs: 45,
      fat: 8,
      prepTime: '15 min',
      difficulty: 'Easy',
      tags: ['High Protein', 'Breakfast', 'Post-Workout'],
      suitableFor: ['muscle-gain', 'general-health'],
      ingredients: [
        'Protein powder',
        'Oats',
        'Eggs',
        'Banana',
        'Cinnamon',
        'Berries for topping',
      ],
      instructions: [
        'Blend all ingredients except berries',
        'Heat non-stick pan',
        'Pour batter and cook until bubbles form',
        'Flip and cook other side',
        'Top with berries and serve',
      ],
    },
    {
      id: '5',
      name: 'Vegetable Stir-Fry with Tofu',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
      calories: 320,
      protein: 20,
      carbs: 35,
      fat: 12,
      prepTime: '20 min',
      difficulty: 'Easy',
      tags: ['Vegetarian', 'Low Calorie', 'Quick'],
      suitableFor: ['weight-loss', 'general-health'],
      ingredients: [
        'Firm tofu',
        'Mixed vegetables',
        'Soy sauce',
        'Ginger',
        'Garlic',
        'Sesame oil',
      ],
      instructions: [
        'Press and cube tofu',
        'Stir-fry tofu until golden',
        'Add vegetables and stir-fry',
        'Add sauce and seasonings',
        'Serve hot',
      ],
    },
    {
      id: '6',
      name: 'Greek Yogurt Parfait',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
      calories: 280,
      protein: 25,
      carbs: 35,
      fat: 6,
      prepTime: '5 min',
      difficulty: 'Easy',
      tags: ['High Protein', 'Breakfast', 'Quick'],
      suitableFor: ['weight-loss', 'muscle-gain', 'general-health'],
      ingredients: [
        'Greek yogurt',
        'Granola',
        'Mixed berries',
        'Honey',
        'Chia seeds',
      ],
      instructions: [
        'Layer yogurt in a glass',
        'Add granola',
        'Top with berries',
        'Drizzle with honey',
        'Sprinkle chia seeds',
      ],
    },
  ];

  // Filter recipes based on user's goal and remaining calories
  const recommendedRecipes = useMemo(() => {
    return allRecipes
      .filter(recipe => recipe.suitableFor.includes(profile.goal))
      .filter(recipe => recipe.calories <= remaining.calories + 100) // Allow some flexibility
      .sort((a, b) => {
        // Prioritize recipes that match remaining macros
        const aScore = Math.abs(a.protein - remaining.protein) + 
                      Math.abs(a.carbs - remaining.carbs) + 
                      Math.abs(a.fat - remaining.fat);
        const bScore = Math.abs(b.protein - remaining.protein) + 
                      Math.abs(b.carbs - remaining.carbs) + 
                      Math.abs(b.fat - remaining.fat);
        return aScore - bScore;
      })
      .slice(0, 4);
  }, [profile.goal, remaining, allRecipes]);

  const popularRecipes = allRecipes.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Meal Recommendations</h2>
        <p className="text-gray-600">Personalized recipes to help you reach your goals</p>
      </div>

      {/* Remaining Targets */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Remaining Today
          </CardTitle>
          <CardDescription>
            What you still need to meet your daily targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{Math.max(0, remaining.calories)}</p>
              <p className="text-sm text-gray-600">Calories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{Math.max(0, remaining.protein)}g</p>
              <p className="text-sm text-gray-600">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{Math.max(0, remaining.carbs)}g</p>
              <p className="text-sm text-gray-600">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{Math.max(0, remaining.fat)}g</p>
              <p className="text-sm text-gray-600">Fat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      {recommendedRecipes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-semibold">Recommended For You</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendedRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Recipes */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="w-5 h-5 text-orange-600" />
          <h3 className="text-xl font-semibold">Popular Recipes</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {popularRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [showRecipe, setShowRecipe] = useState(false);
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg leading-tight">{recipe.name}</CardTitle>
          <Badge variant="secondary">{recipe.calories} cal</Badge>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {recipe.prepTime}
          </div>
          <Badge variant="outline" className="text-xs">{recipe.difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {recipe.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Protein:</span>
              <span className="font-medium ml-1">{recipe.protein}g</span>
            </div>
            <div>
              <span className="text-gray-500">Carbs:</span>
              <span className="font-medium ml-1">{recipe.carbs}g</span>
            </div>
            <div>
              <span className="text-gray-500">Fat:</span>
              <span className="font-medium ml-1">{recipe.fat}g</span>
            </div>
          </div>

          <button
            className="w-full border rounded-md p-2 hover:bg-gray-100"
            onClick={() => setShowRecipe(true)}
            >
            View Recipe
          </button>

          {showRecipe && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">  
                Instructions 
              </h3>

              {recipe.instructions.map((step, index) => ( 
                <p key={index} className="text-sm mb-1"> 
                {index + 1}. {step}
                </p>
                ))} 

          <button
              className="mt-3 text-sm text-green-600"
              onClick={() => setShowRecipe(false)}
          >
              Close

          </button>
        </div>
        
            )
            }
        </div>
      </CardContent>
    </Card>
  );
}
