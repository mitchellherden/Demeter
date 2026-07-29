// Local storage utilities for user data

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  goal: 'weight-loss' | 'muscle-gain' | 'maintain' | 'general-health';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  createdAt?: string; // Track when profile was created
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  portionSize: string;
}

export interface Meal {
  id: string;
  timestamp: string;
  imageData?: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export const storage = {
  getProfile(): UserProfile | null {
    const data = localStorage.getItem('userProfile');
    return data ? JSON.parse(data) : null;
  },

  setProfile(profile: UserProfile): void {
    // Add createdAt if it doesn't exist
    if (!profile.createdAt) {
      profile.createdAt = new Date().toISOString();
    }
    localStorage.setItem('userProfile', JSON.stringify(profile));
  },

  saveProfile(profile: UserProfile): void {
    this.setProfile(profile);
  },

  setOnboardingComplete(complete: boolean): void {
    localStorage.setItem('onboardingComplete', JSON.stringify(complete));
  },

  getMeals(): Meal[] {
    const data = localStorage.getItem('meals');
    return data ? JSON.parse(data) : [];
  },

  addMeal(meal: Meal): void {
    const meals = this.getMeals();
    meals.unshift(meal);
    localStorage.setItem('meals', JSON.stringify(meals));
  },

  deleteMeal(id: string): void {
    const meals = this.getMeals();
    const filtered = meals.filter(m => m.id !== id);
    localStorage.setItem('meals', JSON.stringify(filtered));
  },

  getTodaysMeals(): Meal[] {
    const meals = this.getMeals();
    const today = new Date().toDateString();
    return meals.filter(m => new Date(m.timestamp).toDateString() === today);
  },

  getWeekMeals(): Meal[] {
    const meals = this.getMeals();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return meals.filter(m => new Date(m.timestamp) >= weekAgo);
  },

  hasCompletedOnboarding(): boolean {
    const complete = localStorage.getItem('onboardingComplete');
    return complete ? JSON.parse(complete) : false;
  },

  clearAllData(): void {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('meals');
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('badgeMetrics');
  },
};