import { describe, expect, it } from 'vitest';
import { buildMealSuggestionSummary, generateUniqueMealSuggestions, rankMealSuggestions, SuggestionRecipe } from './mealSuggestions';
import { Meal, UserProfile } from './storage';

function makeMeal(timestamp: string, foods: string[], totals: Pick<Meal, 'totalCalories' | 'totalProtein' | 'totalCarbs' | 'totalFat'>): Meal {
  return {
    id: timestamp,
    timestamp,
    foods: foods.map((name) => ({
      name,
      calories: 100,
      protein: 10,
      carbs: 10,
      fat: 5,
      portionSize: '1 serving',
    })),
    imageData: undefined,
    mealType: 'lunch',
    ...totals,
  };
}

const profile: UserProfile = {
  name: 'Test User',
  age: 25,
  gender: 'male',
  weight: 80,
  height: 180,
  goal: 'muscle-gain',
  activityLevel: 'moderate',
  targetCalories: 2400,
  targetProtein: 260,
  targetCarbs: 140,
  targetFat: 50,
};

const recipes: SuggestionRecipe[] = [
  {
    id: 'protein-bowl',
    name: 'Protein Bowl',
    image: 'https://example.com/protein.jpg',
    calories: 420,
    protein: 38,
    carbs: 25,
    fat: 14,
    prepTime: '20 min',
    difficulty: 'Easy',
    tags: ['High Protein'],
    ingredients: ['Chicken breast', 'Rice', 'Broccoli'],
    instructions: ['Cook chicken', 'Add rice', 'Serve with broccoli'],
    suitableFor: ['muscle-gain'],
  },
  {
    id: 'pasta-bake',
    name: 'Pasta Bake',
    image: 'https://example.com/pasta.jpg',
    calories: 600,
    protein: 18,
    carbs: 72,
    fat: 20,
    prepTime: '35 min',
    difficulty: 'Medium',
    tags: ['Comfort Food'],
    ingredients: ['Pasta', 'Cheese', 'Tomato'],
    instructions: ['Cook pasta', 'Mix with sauce', 'Bake'],
    suitableFor: ['muscle-gain'],
  },
];

describe('mealSuggestions', () => {
  it('summarizes recent meals into a macro focus and top foods', () => {
    const meals = [
      makeMeal('2026-08-09T12:00:00.000Z', ['Chicken Breast', 'Broccoli'], {
        calories: 220,
        protein: 45,
        carbs: 20,
        fat: 18,
      }),
      makeMeal('2026-08-09T09:00:00.000Z', ['Chicken Breast', 'Rice'], {
        calories: 260,
        protein: 40,
        carbs: 55,
        fat: 16,
      }),
    ];

    const summary = buildMealSuggestionSummary(profile, meals);

    expect(summary.macroFocus).toBe('balanced');
    expect(summary.topFoods[0]).toBe('chicken breast');
    expect(summary.summary).toContain('balanced meals');
  });

  it('ranks recipes that fill the current meal gap ahead of carb-heavy options', () => {
    const meals = [
      makeMeal('2026-08-09T12:00:00.000Z', ['Bread', 'Pasta'], {
        calories: 900,
        protein: 25,
        carbs: 130,
        fat: 22,
      }),
      makeMeal('2026-08-09T09:00:00.000Z', ['Bread'], {
        calories: 450,
        protein: 12,
        carbs: 60,
        fat: 8,
      }),
    ];

    const ranked = rankMealSuggestions(profile, meals, recipes, 2);

    expect(ranked[0].id).toBe('protein-bowl');
    expect(ranked[0].reasons.some((reason) => reason.includes('protein'))).toBe(true);
  });

  it('generates user-specific meals from uploaded meal patterns', () => {
    const meals = [
      makeMeal('2026-08-09T12:00:00.000Z', ['Chicken Breast', 'Broccoli'], {
        calories: 420,
        protein: 38,
        carbs: 22,
        fat: 13,
      }),
      makeMeal('2026-08-09T09:00:00.000Z', ['Chicken Breast', 'Rice'], {
        calories: 470,
        protein: 36,
        carbs: 42,
        fat: 12,
      }),
    ];

    const generated = generateUniqueMealSuggestions(profile, meals, 2);

    expect(generated).toHaveLength(2);
    expect(generated[0].name.toLowerCase()).toContain('chicken breast');
    expect(generated[0].reasons.some((reason) => reason.includes('uploaded meals'))).toBe(true);
  });
});