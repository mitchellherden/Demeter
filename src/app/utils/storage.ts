// Local storage utilities for user-specific app data

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
  createdAt?: string;
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

function getCurrentUserAuth() {
  const data = localStorage.getItem('userAuth');
  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function getStorageKey(prefix: string): string {
  const userAuth = getCurrentUserAuth();
  const userId = userAuth?.userId ?? userAuth?.id ?? 'anonymous';
  return `${prefix}_${userId}`;
}

export function setCurrentUserAuth(userId: string, email?: string): void {
  localStorage.setItem('userAuth', JSON.stringify({ userId, email, registeredAt: new Date().toISOString() }));
}

export const storage = {
  getProfile(): UserProfile | null {
    const key = getStorageKey('userProfile');
    const data = localStorage.getItem(key) ?? localStorage.getItem('userProfile');
    return data ? JSON.parse(data) : null;
  },

  setProfile(profile: UserProfile): void {
    const finalProfile = {
      ...profile,
      createdAt: profile.createdAt ?? new Date().toISOString(),
    };

    localStorage.setItem(getStorageKey('userProfile'), JSON.stringify(finalProfile));

    const userAuth = getCurrentUserAuth();
    if (!userAuth) {
      localStorage.setItem('userProfile', JSON.stringify(finalProfile));
    }
  },

  saveProfile(profile: UserProfile): void {
    this.setProfile(profile);
  },

  setOnboardingComplete(complete: boolean): void {
    localStorage.setItem(getStorageKey('onboardingComplete'), JSON.stringify(complete));

    const userAuth = getCurrentUserAuth();
    if (!userAuth) {
      localStorage.setItem('onboardingComplete', JSON.stringify(complete));
    }
  },

  getMeals(): Meal[] {
    const key = getStorageKey('meals');
    const data = localStorage.getItem(key) ?? localStorage.getItem('meals');
    return data ? JSON.parse(data) : [];
  },

  addMeal(meal: Meal): void {
    const meals = this.getMeals();
    meals.unshift(meal);
    localStorage.setItem(getStorageKey('meals'), JSON.stringify(meals));

    const userAuth = getCurrentUserAuth();
    if (!userAuth) {
      localStorage.setItem('meals', JSON.stringify(meals));
    }
  },

  deleteMeal(id: string): void {
    const meals = this.getMeals();
    const filtered = meals.filter(m => m.id !== id);
    localStorage.setItem(getStorageKey('meals'), JSON.stringify(filtered));

    const userAuth = getCurrentUserAuth();
    if (!userAuth) {
      localStorage.setItem('meals', JSON.stringify(filtered));
    }
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
    const key = getStorageKey('onboardingComplete');
    const complete = localStorage.getItem(key) ?? localStorage.getItem('onboardingComplete');
    return complete ? JSON.parse(complete) : false;
  },

  clearCurrentUserData(): void {
    const userAuth = getCurrentUserAuth();
    const userId = userAuth?.userId ?? userAuth?.id ?? 'anonymous';

    localStorage.removeItem(`userProfile_${userId}`);
    localStorage.removeItem(`meals_${userId}`);
    localStorage.removeItem(`onboardingComplete_${userId}`);
    localStorage.removeItem(`badgeMetrics_${userId}`);
    localStorage.removeItem('userAuth');
  },

  clearAllData(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (
        key.startsWith('userProfile_') ||
        key.startsWith('meals_') ||
        key.startsWith('onboardingComplete_') ||
        key.startsWith('badgeMetrics_') ||
        key === 'userProfile' ||
        key === 'meals' ||
        key === 'onboardingComplete' ||
        key === 'badgeMetrics' ||
        key === 'userAuth'
      ) {
        localStorage.removeItem(key);
      }
    });
  },
};