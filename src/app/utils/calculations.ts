// Nutrition calculation helpers.
// These functions convert user profile information into calorie, BMI, and macro targets.
import { UserProfile } from './storage';

// Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female' = 'male'): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Calculate TDEE (Total Daily Energy Expenditure)
export function calculateTDEE(bmr: number, activityLevel: UserProfile['activityLevel']): number {
  const multipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very-active': 1.9,
  };
  
  return bmr * multipliers[activityLevel];
}

// Calculate target calories based on goal
export function calculateTargetCalories(tdee: number, goal: UserProfile['goal']): number {
  switch (goal) {
    case 'weight-loss':
      return Math.round(tdee - 500); // 500 calorie deficit
    case 'muscle-gain':
      return Math.round(tdee + 300); // 300 calorie surplus
    case 'maintain':
    case 'general-health':
      return Math.round(tdee);
    default:
      return Math.round(tdee);
  }
}

// Calculate macro targets (as grams)
export function calculateMacros(targetCalories: number, goal: UserProfile['goal'], weight: number) {
  let proteinRatio: number;
  let fatRatio: number;
  
  switch (goal) {
    case 'muscle-gain':
      // High protein: 30% protein, 25% fat, 45% carbs
      proteinRatio = 0.30;
      fatRatio = 0.25;
      break;
    case 'weight-loss':
      // High protein, moderate fat: 35% protein, 30% fat, 35% carbs
      proteinRatio = 0.35;
      fatRatio = 0.30;
      break;
    default:
      // Balanced: 25% protein, 25% fat, 50% carbs
      proteinRatio = 0.25;
      fatRatio = 0.25;
      break;
  }
  
  const carbsRatio = 1 - proteinRatio - fatRatio;
  
  return {
    protein: Math.round((targetCalories * proteinRatio) / 4), // 4 cal per gram
    carbs: Math.round((targetCalories * carbsRatio) / 4), // 4 cal per gram
    fat: Math.round((targetCalories * fatRatio) / 9), // 9 cal per gram
  };
}

// Calculate BMI
export function calculateBMI(weight: number, height: number): number {
  return weight / Math.pow(height / 100, 2);
}

// Get BMI category
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// Calculate all targets at once
export function calculateTargets(
  age: number,
  gender: 'male' | 'female',
  weight: number,
  height: number,
  activityLevel: UserProfile['activityLevel'],
  goal: UserProfile['goal']
) {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetCalories = calculateTargetCalories(tdee, goal);
  const macros = calculateMacros(targetCalories, goal, weight);
  
  return {
    targetCalories,
    targetProtein: macros.protein,
    targetCarbs: macros.carbs,
    targetFat: macros.fat,
  };
}