import { Meal, UserProfile } from './storage';

export interface SuggestionRecipe {
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

export interface RankedRecipe extends SuggestionRecipe {
  score: number;
  reasons: string[];
}

export interface MealSuggestionSummary {
  summary: string;
  topFoods: string[];
  macroFocus: 'protein' | 'carbs' | 'fat' | 'balanced';
  recentMealCount: number;
}

export interface GeneratedMealSuggestion {
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
  reasons: string[];
  generated: true;
}

interface MealTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const STOP_WORDS = new Set([
  'fresh',
  'mixed',
  'roasted',
  'grilled',
  'baked',
  'large',
  'small',
  'medium',
  'cup',
  'cups',
  'tsp',
  'tbsp',
  'tablespoon',
  'tablespoons',
  'teaspoon',
  'teaspoons',
  'olive',
  'oil',
  'juice',
  'salt',
  'pepper',
  'lemon',
  'garlic',
  'herbs',
  'dressing',
  'sauce',
  'water',
  'with',
  'and',
  'or',
  'the',
]);

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function titleCase(value: string): string {
  return value
    .split(' ')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function addTotals(target: MealTotals, meal: Meal): MealTotals {
  return {
    calories: target.calories + meal.totalCalories,
    protein: target.protein + meal.totalProtein,
    carbs: target.carbs + meal.totalCarbs,
    fat: target.fat + meal.totalFat,
  };
}

function getMealTotals(meals: Meal[]): MealTotals {
  return meals.reduce(
    (totals, meal) => addTotals(totals, meal),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function getTopFoods(meals: Meal[], limit = 4): string[] {
  const counts = new Map<string, number>();

  meals.forEach((meal) => {
    meal.foods.forEach((food) => {
      const normalized = normalizeText(food.name);
      if (!normalized) return;

      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([food]) => food);
}

function getMacroFocus(remaining: MealTotals, goal: UserProfile['goal']): 'protein' | 'carbs' | 'fat' | 'balanced' {
  if (goal === 'muscle-gain' && remaining.protein > 0) {
    return 'protein';
  }

  const ordered = [
    ['protein', remaining.protein],
    ['carbs', remaining.carbs],
    ['fat', remaining.fat],
  ] as const;

  const positive = ordered.filter(([, amount]) => amount > 0);
  if (positive.length === 0) {
    return 'balanced';
  }

  positive.sort((a, b) => b[1] - a[1]);
  return positive[0][0];
}

function ingredientMatchesFood(ingredient: string, foodName: string): boolean {
  const ingredientTokens = tokenize(ingredient);
  const foodTokens = tokenize(foodName);

  return foodTokens.some((foodToken) => ingredientTokens.includes(foodToken) || normalizeText(ingredient).includes(foodToken));
}

function getRecipeFoodOverlap(recipe: SuggestionRecipe, topFoods: string[]): number {
  if (topFoods.length === 0) {
    return 0;
  }

  return recipe.ingredients.reduce((total, ingredient) => {
    const matched = topFoods.some((food) => ingredientMatchesFood(ingredient, food));
    return total + (matched ? 1 : 0);
  }, 0);
}

export function buildMealSuggestionSummary(profile: UserProfile, meals: Meal[]): MealSuggestionSummary {
  const recentMeals = meals.slice(0, 7);
  const totals = getMealTotals(recentMeals);
  const remaining = {
    calories: profile.targetCalories - totals.calories,
    protein: profile.targetProtein - totals.protein,
    carbs: profile.targetCarbs - totals.carbs,
    fat: profile.targetFat - totals.fat,
  };

  const topFoods = getTopFoods(recentMeals);
  const macroFocus = getMacroFocus(remaining, profile.goal);
  const focusText = macroFocus === 'balanced'
    ? 'balanced meals'
    : `${macroFocus}-focused meals`;

  const topFoodText = topFoods.length > 0
    ? `You've been eating ${topFoods.slice(0, 2).join(' and ')} most often.`
    : 'We have not logged enough meals yet to spot a pattern.';

  return {
    summary: `Based on your recent meals, the next best options are ${focusText}. ${topFoodText}`,
    topFoods,
    macroFocus,
    recentMealCount: recentMeals.length,
  };
}

export function rankMealSuggestions(
  profile: UserProfile,
  meals: Meal[],
  recipes: SuggestionRecipe[],
  limit = 4
): RankedRecipe[] {
  const recentMeals = meals.slice(0, 7);
  const totals = getMealTotals(recentMeals);
  const remaining = {
    calories: profile.targetCalories - totals.calories,
    protein: profile.targetProtein - totals.protein,
    carbs: profile.targetCarbs - totals.carbs,
    fat: profile.targetFat - totals.fat,
  };
  const topFoods = getTopFoods(recentMeals);

  return recipes
    .map((recipe) => {
      let score = 0;
      const reasons: string[] = [];

      if (recipe.suitableFor.includes(profile.goal)) {
        score += 40;
        reasons.push(`Matches your ${profile.goal.replace('-', ' ')} goal`);
      } else {
        score -= 10;
      }

      const calorieGap = Math.abs(recipe.calories - Math.max(remaining.calories, 250));
      const calorieScore = Math.max(0, 30 - calorieGap / 20);
      score += calorieScore;
      if (calorieScore >= 18) {
        reasons.push('Fits your remaining calories well');
      }

      const proteinNeed = Math.max(remaining.protein, 0);
      const proteinScore = proteinNeed > 0 ? Math.min(20, (recipe.protein / Math.max(proteinNeed, 1)) * 20) : Math.min(10, recipe.protein / 4);
      score += proteinScore;
      if (recipe.protein >= 20) {
        reasons.push('Adds a solid protein boost');
      }

      const macroSpread = Math.abs(recipe.carbs - Math.max(remaining.carbs, 0) / 2) + Math.abs(recipe.fat - Math.max(remaining.fat, 0) / 2);
      const balanceScore = Math.max(0, 15 - macroSpread / 5);
      score += balanceScore;

      const overlapCount = getRecipeFoodOverlap(recipe, topFoods);
      if (overlapCount > 0) {
        score += overlapCount * 2;
        reasons.push('Uses ingredients you already eat often');
      } else {
        score += 3;
        reasons.push('Adds some variety to your recent meals');
      }

      if (recipe.tags.some((tag) => /protein/i.test(tag)) && profile.goal === 'muscle-gain') {
        score += 5;
      }

      return {
        ...recipe,
        score,
        reasons: reasons.slice(0, 3),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

const imagePool = [
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop',
];

interface GeneratedTemplate {
  key: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  ingredients: string[];
  instructions: string[];
}

const generatedTemplates: GeneratedTemplate[] = [
  {
    key: 'power-bowl',
    mealType: 'Power Bowl',
    calories: 430,
    protein: 34,
    carbs: 38,
    fat: 14,
    prepTime: '22 min',
    difficulty: 'Easy',
    tags: ['Balanced', 'High Protein', 'Meal Prep'],
    ingredients: ['base protein', 'brown rice', 'broccoli', 'olive oil', 'herbs'],
    instructions: [
      'Season the protein and cook until done.',
      'Cook the rice and steam vegetables.',
      'Assemble in a bowl and finish with herbs.',
    ],
  },
  {
    key: 'smart-wrap',
    mealType: 'Smart Wrap',
    calories: 380,
    protein: 28,
    carbs: 35,
    fat: 11,
    prepTime: '15 min',
    difficulty: 'Easy',
    tags: ['Quick', 'Portable', 'Balanced'],
    ingredients: ['base protein', 'whole wheat wrap', 'spinach', 'tomato', 'yogurt dressing'],
    instructions: [
      'Warm the wrap and prep vegetables.',
      'Layer protein, vegetables, and dressing.',
      'Roll tightly and toast briefly if desired.',
    ],
  },
  {
    key: 'stir-fry',
    mealType: 'Stir-Fry Remix',
    calories: 410,
    protein: 30,
    carbs: 44,
    fat: 12,
    prepTime: '20 min',
    difficulty: 'Easy',
    tags: ['One Pan', 'Fiber Rich', 'Weeknight'],
    ingredients: ['base protein', 'mixed vegetables', 'garlic', 'ginger', 'soy sauce', 'rice'],
    instructions: [
      'Cook protein in a hot pan until browned.',
      'Add vegetables, garlic, and ginger.',
      'Stir in sauce and serve over rice.',
    ],
  },
  {
    key: 'macro-plate',
    mealType: 'Macro Plate',
    calories: 470,
    protein: 36,
    carbs: 46,
    fat: 15,
    prepTime: '28 min',
    difficulty: 'Medium',
    tags: ['Goal Focused', 'High Protein', 'Satisfying'],
    ingredients: ['base protein', 'sweet potato', 'greens', 'avocado', 'lemon'],
    instructions: [
      'Roast the sweet potato and cook protein.',
      'Assemble with greens and sliced avocado.',
      'Finish with lemon and light seasoning.',
    ],
  },
];

function pickBaseFood(topFoods: string[], fallback: string): string {
  return topFoods[0] ? titleCase(topFoods[0]) : fallback;
}

function tuneTemplateForFocus(template: GeneratedTemplate, focus: MealSuggestionSummary['macroFocus']): GeneratedTemplate {
  if (focus === 'protein') {
    return {
      ...template,
      calories: template.calories + 40,
      protein: template.protein + 10,
      carbs: Math.max(20, template.carbs - 6),
      tags: [...template.tags, 'Protein Focus'],
    };
  }

  if (focus === 'carbs') {
    return {
      ...template,
      carbs: template.carbs + 12,
      calories: template.calories + 35,
      tags: [...template.tags, 'Carb Recovery'],
    };
  }

  if (focus === 'fat') {
    return {
      ...template,
      fat: template.fat + 7,
      carbs: Math.max(20, template.carbs - 5),
      calories: template.calories + 45,
      tags: [...template.tags, 'Healthy Fats'],
    };
  }

  return template;
}

export function generateUniqueMealSuggestions(
  profile: UserProfile,
  meals: Meal[],
  limit = 3
): GeneratedMealSuggestion[] {
  const summary = buildMealSuggestionSummary(profile, meals);
  const baseFood = pickBaseFood(summary.topFoods, profile.goal === 'muscle-gain' ? 'Chicken Breast' : 'Tofu');

  return generatedTemplates
    .slice(0, limit)
    .map((template, index) => {
      const tuned = tuneTemplateForFocus(template, summary.macroFocus);
      const title = `${baseFood} ${tuned.mealType}`;
      const ingredients = tuned.ingredients.map((ingredient) => ingredient.replace('base protein', baseFood));

      return {
        id: `generated-${template.key}-${index}`,
        name: title,
        image: imagePool[index % imagePool.length],
        calories: tuned.calories,
        protein: tuned.protein,
        carbs: tuned.carbs,
        fat: tuned.fat,
        prepTime: tuned.prepTime,
        difficulty: tuned.difficulty,
        tags: [...tuned.tags, 'Generated For You'],
        ingredients,
        instructions: tuned.instructions,
        suitableFor: [profile.goal],
        reasons: [
          `Built around your frequent food: ${baseFood}`,
          `Tuned for your ${summary.macroFocus} needs`,
          'Generated from your recent uploaded meals',
        ],
        generated: true as const,
      };
    });
}