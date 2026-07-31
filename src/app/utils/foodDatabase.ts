// Mock nutrition database used by the meal-recognition flow.
// In a real app, this would be replaced by a live food-recognition or nutrition API.
import { FoodItem } from './storage';

export const foodDatabase: Record<string, FoodItem> = {
  // Proteins
  'chicken breast': {
    name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    portionSize: '100g',
  },
  'salmon': {
    name: 'Salmon',
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    portionSize: '100g',
  },
  'eggs': {
    name: 'Eggs',
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    portionSize: '2 large eggs',
  },
  'tofu': {
    name: 'Tofu',
    calories: 76,
    protein: 8,
    carbs: 1.9,
    fat: 4.8,
    portionSize: '100g',
  },
  'steak': {
    name: 'Beef Steak',
    calories: 271,
    protein: 26,
    carbs: 0,
    fat: 19,
    portionSize: '100g',
  },
  
  // Carbs
  'rice': {
    name: 'White Rice',
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    portionSize: '100g cooked',
  },
  'brown rice': {
    name: 'Brown Rice',
    calories: 112,
    protein: 2.6,
    carbs: 24,
    fat: 0.9,
    fiber: 1.8,
    portionSize: '100g cooked',
  },
  'pasta': {
    name: 'Pasta',
    calories: 131,
    protein: 5,
    carbs: 25,
    fat: 1.1,
    portionSize: '100g cooked',
  },
  'bread': {
    name: 'Whole Wheat Bread',
    calories: 247,
    protein: 13,
    carbs: 41,
    fat: 3.4,
    fiber: 7,
    portionSize: '100g',
  },
  'quinoa': {
    name: 'Quinoa',
    calories: 120,
    protein: 4.4,
    carbs: 21,
    fat: 1.9,
    fiber: 2.8,
    portionSize: '100g cooked',
  },
  'sweet potato': {
    name: 'Sweet Potato',
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    fiber: 3,
    portionSize: '100g',
  },
  'potato': {
    name: 'Potato',
    calories: 77,
    protein: 2,
    carbs: 17,
    fat: 0.1,
    fiber: 2.2,
    portionSize: '100g',
  },
  
  // Vegetables
  'broccoli': {
    name: 'Broccoli',
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    portionSize: '100g',
  },
  'spinach': {
    name: 'Spinach',
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    portionSize: '100g',
  },
  'carrots': {
    name: 'Carrots',
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    fiber: 2.8,
    sugar: 4.7,
    portionSize: '100g',
  },
  'tomato': {
    name: 'Tomato',
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    portionSize: '100g',
  },
  'salad': {
    name: 'Mixed Salad',
    calories: 15,
    protein: 1.4,
    carbs: 3,
    fat: 0.2,
    fiber: 1.5,
    portionSize: '100g',
  },
  'avocado': {
    name: 'Avocado',
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    fiber: 7,
    portionSize: '100g',
  },
  
  // Fruits
  'banana': {
    name: 'Banana',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12,
    portionSize: '1 medium',
  },
  'apple': {
    name: 'Apple',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4,
    sugar: 10,
    portionSize: '1 medium',
  },
  'berries': {
    name: 'Mixed Berries',
    calories: 57,
    protein: 1.1,
    carbs: 14,
    fat: 0.3,
    fiber: 2.4,
    sugar: 7,
    portionSize: '100g',
  },
  'orange': {
    name: 'Orange',
    calories: 47,
    protein: 0.9,
    carbs: 12,
    fat: 0.1,
    fiber: 2.4,
    sugar: 9,
    portionSize: '1 medium',
  },
  
  // Dairy
  'milk': {
    name: 'Milk',
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fat: 3.3,
    sugar: 5,
    portionSize: '100ml',
  },
  'yogurt': {
    name: 'Greek Yogurt',
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    portionSize: '100g',
  },
  'cheese': {
    name: 'Cheddar Cheese',
    calories: 402,
    protein: 25,
    carbs: 1.3,
    fat: 33,
    portionSize: '100g',
  },
  
  // Common meals
  'pizza': {
    name: 'Pizza Slice',
    calories: 285,
    protein: 12,
    carbs: 36,
    fat: 10,
    portionSize: '1 slice',
  },
  'burger': {
    name: 'Hamburger',
    calories: 354,
    protein: 18,
    carbs: 30,
    fat: 18,
    portionSize: '1 burger',
  },
  'sandwich': {
    name: 'Sandwich',
    calories: 300,
    protein: 15,
    carbs: 35,
    fat: 12,
    portionSize: '1 sandwich',
  },
  'salad bowl': {
    name: 'Mixed Salad Bowl',
    calories: 150,
    protein: 8,
    carbs: 20,
    fat: 6,
    fiber: 5,
    portionSize: '1 bowl',
  },
  'oatmeal': {
    name: 'Oatmeal',
    calories: 71,
    protein: 2.5,
    carbs: 12,
    fat: 1.5,
    fiber: 1.7,
    portionSize: '100g cooked',
  },
  'granola': {
    name: 'Granola',
    calories: 471,
    protein: 14,
    carbs: 64,
    fat: 18,
    fiber: 9,
    sugar: 21,
    portionSize: '100g',
  },
};

// Mock AI function to recognize food items in an image
export function recognizeFood(imageData: string): FoodItem[] {
  // In a real app, this would use computer vision API
  // For now, return random items from the database
  const foodKeys = Object.keys(foodDatabase);
  const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
  const recognizedItems: FoodItem[] = [];
  
  const shuffled = [...foodKeys].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < numItems && i < shuffled.length; i++) {
    recognizedItems.push({ ...foodDatabase[shuffled[i]] });
  }
  
  return recognizedItems;
}
