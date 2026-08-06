// Local storage abstraction for app state.
// Data is kept scoped per user and synced to Supabase when a user is signed in.
import { supabase } from "./supabaseClient";

function isValidUuid(value?: string | null): boolean {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function createSupabaseId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeMealId(id?: string): string {
  return isValidUuid(id) ? id! : createSupabaseId();
}

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

function getCurrentUserId(): string | null {
  const userAuth = getCurrentUserAuth();
  return userAuth?.userId ?? userAuth?.id ?? null;
}

function getStorageKey(prefix: string): string {
  const userId = getCurrentUserId() ?? 'anonymous';
  return `${prefix}_${userId}`;
}

function profileToSupabasePayload(profile: UserProfile) {
  const userAuth = getCurrentUserAuth();
  const userId = getCurrentUserId();

  return {
    user_id: userId,
    email: userAuth?.email ?? null,
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
    goal: profile.goal,
    activity_level: profile.activityLevel,
    target_calories: profile.targetCalories,
    target_protein: profile.targetProtein,
    target_carbs: profile.targetCarbs,
    target_fat: profile.targetFat,
    created_at: profile.createdAt ?? new Date().toISOString(),
  };
}

async function syncProfileToSupabase(profile: UserProfile): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(profileToSupabasePayload(profile), { onConflict: 'user_id' });

    if (error) {
      console.error('Supabase profile sync failed:', error.message);
    }
  } catch (error) {
    console.error('Supabase profile sync error:', error);
  }
}

async function syncOnboardingToSupabase(complete: boolean): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    const { error } = await supabase
      .from('onboarding_status')
      .upsert({
        user_id: userId,
        completed: complete,
        completed_at: complete ? new Date().toISOString() : null,
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Supabase onboarding sync failed:', error.message);
    }
  } catch (error) {
    console.error('Supabase onboarding sync error:', error);
  }
}

async function syncMealToSupabase(meal: Meal): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;

  const mealId = normalizeMealId(meal.id);
  const payload = {
    id: mealId,
    user_id: userId,
    timestamp: meal.timestamp,
    meal_type: meal.mealType ?? 'lunch',
    foods: meal.foods,
    total_calories: meal.totalCalories,
    total_protein: meal.totalProtein,
    total_carbs: meal.totalCarbs,
    total_fat: meal.totalFat,
    image_data: meal.imageData ?? null,
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('meals')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Supabase meal sync failed:', error.message);
    }
  } catch (error) {
    console.error('Supabase meal sync error:', error);
  }
}

async function removeMealFromSupabase(id: string): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase meal delete failed:', error.message);
    }
  } catch (error) {
    console.error('Supabase meal delete error:', error);
  }
}

export async function hydrateUserDataFromSupabase(): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profileError && profileData && profileData.name) {
      const profile: UserProfile = {
        name: profileData.name ?? '',
        age: Number(profileData.age ?? 0),
        gender: profileData.gender ?? 'male',
        weight: Number(profileData.weight ?? 0),
        height: Number(profileData.height ?? 0),
        goal: profileData.goal ?? 'maintain',
        activityLevel: profileData.activity_level ?? 'moderate',
        targetCalories: Number(profileData.target_calories ?? 0),
        targetProtein: Number(profileData.target_protein ?? 0),
        targetCarbs: Number(profileData.target_carbs ?? 0),
        targetFat: Number(profileData.target_fat ?? 0),
        createdAt: profileData.created_at ?? undefined,
      };
      localStorage.setItem(getStorageKey('userProfile'), JSON.stringify(profile));
    } else {
      localStorage.removeItem(getStorageKey('userProfile'));
    }

    const { data: mealsData, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (!mealsError && mealsData) {
      const meals: Meal[] = mealsData.map((meal) => ({
        id: meal.id ?? crypto.randomUUID(),
        timestamp: meal.timestamp ?? new Date().toISOString(),
        imageData: meal.image_data ?? undefined,
        foods: Array.isArray(meal.foods) ? meal.foods : [],
        totalCalories: Number(meal.total_calories ?? 0),
        totalProtein: Number(meal.total_protein ?? 0),
        totalCarbs: Number(meal.total_carbs ?? 0),
        totalFat: Number(meal.total_fat ?? 0),
        mealType: meal.meal_type ?? 'lunch',
      }));
      localStorage.setItem(getStorageKey('meals'), JSON.stringify(meals));
    }

    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!onboardingError && onboardingData) {
      localStorage.setItem(getStorageKey('onboardingComplete'), JSON.stringify(Boolean(onboardingData.completed)));
    }
  } catch (error) {
    console.error('Supabase hydration failed:', error);
  }
}

export function setCurrentUserAuth(userId: string, email?: string): void {
  localStorage.setItem('userAuth', JSON.stringify({ userId, email, registeredAt: new Date().toISOString() }));
}

export const storage = {
  getProfile(): UserProfile | null {
    const key = getStorageKey('userProfile');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  setProfile(profile: UserProfile): void {
    const finalProfile = {
      ...profile,
      createdAt: profile.createdAt ?? new Date().toISOString(),
    };

    localStorage.setItem(getStorageKey('userProfile'), JSON.stringify(finalProfile));

    void syncProfileToSupabase(finalProfile);
  },

  saveProfile(profile: UserProfile): void {
    this.setProfile(profile);
  },

  setOnboardingComplete(complete: boolean): void {
    localStorage.setItem(getStorageKey('onboardingComplete'), JSON.stringify(complete));

    void syncOnboardingToSupabase(complete);
  },

  getMeals(): Meal[] {
    const key = getStorageKey('meals');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  addMeal(meal: Meal): void {
    const normalizedMeal = { ...meal, id: normalizeMealId(meal.id) };
    const meals = this.getMeals();
    const nextMeals = [normalizedMeal, ...meals];
    localStorage.setItem(getStorageKey('meals'), JSON.stringify(nextMeals));

    void syncMealToSupabase(normalizedMeal);
  },

  deleteMeal(id: string): void {
    const meals = this.getMeals();
    const filtered = meals.filter(m => m.id !== id);
    localStorage.setItem(getStorageKey('meals'), JSON.stringify(filtered));

    void removeMealFromSupabase(id);
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
    const complete = localStorage.getItem(key);
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

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('userProfile_') || key.startsWith('meals_') || key.startsWith('onboardingComplete_') || key.startsWith('badgeMetrics_')) {
        localStorage.removeItem(key);
      }
    });
  },

  async clearAllData(): Promise<void> {
    const userId = getCurrentUserId();

    if (userId) {
      await supabase.from('meals').delete().eq('user_id', userId);
      await supabase.from('onboarding_status').delete().eq('user_id', userId);
      await supabase.from('profiles').delete().eq('user_id', userId);
      await supabase.from('badge_metrics').delete().eq('user_id', userId);
    }

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