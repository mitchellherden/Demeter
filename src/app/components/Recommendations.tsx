// Personalized recipe recommendations.
// It measures remaining calories/macros and suggests recipes that match the user's goal.
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { storage } from "../utils/storage";
import { Sparkles, ChefHat, TrendingUp, Clock } from "lucide-react";
import { buildMealSuggestionSummary, generateUniqueMealSuggestions, rankMealSuggestions, SuggestionRecipe } from "../utils/mealSuggestions";
import { recipeCatalog } from "../utils/recipeCatalog";

interface Recipe extends SuggestionRecipe {
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
  score?: number;
  reasons?: string[];
}

function ingredientWithQuantity(ingredient: string): string {
  const normalized = ingredient.trim();
  const hasExplicitQuantity = /(\d|\b(g|kg|ml|l|oz|lb|cup|cups|tbsp|tsp|slice|slices)\b)/i.test(normalized);

  if (hasExplicitQuantity) {
    return normalized;
  }

  const lower = normalized.toLowerCase();

  if (/(oil|sauce|dressing|honey|syrup|vinegar|peanut butter|tahini)/i.test(lower)) {
    return `1 tbsp ${normalized}`;
  }

  if (/(salt|pepper|cinnamon|paprika|chili|cumin|oregano|thyme|rosemary|parsley|basil|ginger|garlic powder)/i.test(lower)) {
    return `1 tsp ${normalized}`;
  }

  if (/(milk|broth|stock|juice|water)/i.test(lower)) {
    return `120 ml ${normalized}`;
  }

  if (/(rice|quinoa|oats|pasta|noodles|lentils|chickpeas|beans|granola|berries)/i.test(lower)) {
    return `100 g ${normalized}`;
  }

  if (/(chicken|beef|steak|salmon|shrimp|tofu|turkey|fish)/i.test(lower)) {
    return `150 g ${normalized}`;
  }

  if (/(egg|eggs)/i.test(lower)) {
    return `2 ${normalized}`;
  }

  if (/(wrap|tortilla|bread|bun|bagel)/i.test(lower)) {
    return `1 ${normalized}`;
  }

  if (/(yogurt|cheese|avocado|spinach|broccoli|carrot|tomato|cucumber|potato|sweet potato|onion|pepper)/i.test(lower)) {
    return `80 g ${normalized}`;
  }

  return `100 g ${normalized}`;
}

export function Recommendations() {
  const profile = storage.getProfile();
  const todaysMeals = storage.getTodaysMeals();
  const recentMeals = storage.getMeals();

  const todaysStats = useMemo(() => {
    return {
      calories: todaysMeals.reduce((sum, meal) => sum + meal.totalCalories, 0),
      protein: todaysMeals.reduce((sum, meal) => sum + meal.totalProtein, 0),
      carbs: todaysMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0),
      fat: todaysMeals.reduce((sum, meal) => sum + meal.totalFat, 0),
    };
  }, [todaysMeals]);

  const mealSummary = useMemo(
    () => (profile ? buildMealSuggestionSummary(profile, recentMeals) : null),
    [profile, recentMeals]
  );

  if (!profile) {
    return null;
  }

  const remaining = {
    calories: profile.targetCalories - todaysStats.calories,
    protein: profile.targetProtein - todaysStats.protein,
    carbs: profile.targetCarbs - todaysStats.carbs,
    fat: profile.targetFat - todaysStats.fat,
  };

  const allRecipes: Recipe[] = recipeCatalog;

  const recommendedRecipes = useMemo(() => {
    return rankMealSuggestions(profile, recentMeals, allRecipes, 4);
  }, [profile, recentMeals, allRecipes]);

  const generatedRecipes = useMemo(() => {
    return generateUniqueMealSuggestions(profile, recentMeals, 3);
  }, [profile, recentMeals]);

  const popularRecipes = useMemo(() => {
    const excludedIds = new Set([...recommendedRecipes.map((recipe) => recipe.id), ...generatedRecipes.map((recipe) => recipe.id)]);
    return allRecipes.filter((recipe) => !excludedIds.has(recipe.id)).slice(0, 3);
  }, [allRecipes, recommendedRecipes, generatedRecipes]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Meal Recommendations</h2>
        <p className="text-gray-600">Personalized recipes to help you reach your goals</p>
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Meal Insight
          </CardTitle>
          <CardDescription>
            Suggestions shaped by the meals you uploaded recently
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">{mealSummary?.summary}</p>
          <div className="flex flex-wrap gap-2">
            {mealSummary?.topFoods.map((food) => (
              <Badge key={food} variant="secondary" className="text-xs capitalize">
                {food}
              </Badge>
            ))}
            {mealSummary && (
              <>
                <Badge variant="outline" className="text-xs capitalize">
                  {mealSummary.macroFocus} focus
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {mealSummary.recentMealCount} recent meals analysed
                </Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

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

      {generatedRecipes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-fuchsia-600" />
            <h3 className="text-xl font-semibold">AI-Generated Just For You</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {generatedRecipes.map((recipe) => (
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

          {recipe.reasons && recipe.reasons.length > 0 && (
            <div className="space-y-1 rounded-md bg-purple-50 p-3 text-xs text-purple-800">
              {recipe.reasons.map((reason) => (
                <p key={reason}>• {reason}</p>
              ))}
            </div>
          )}
          
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
                Ingredients
              </h3>

              <ul className="text-sm mb-3 space-y-1">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient}>• {ingredientWithQuantity(ingredient)}</li>
                ))}
              </ul>

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
