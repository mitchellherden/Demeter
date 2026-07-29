// Badge achievements and tracking
import { storage } from './storage';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  dateObtained?: string;
  isUnlocked: boolean;
  progress?: number; // For badges in progress (0-100)
  requirement?: string;
}

export interface BadgeMetrics {
  accountCreatedDate?: string;
  loginDates: string[]; // Array of date strings when user logged in
  currentLoginStreak: number;
  longestLoginStreak: number;
  totalMealsLogged: number;
  currentMealStreak: number;
  longestMealStreak: number;
  daysWithMacroGoalsMet: number;
  daysWithCalorieGoalsMet: number;
  perfectDaysCount: number; // Days where all goals were met
  goalAchievements: {
    goal: string;
    achievedDate?: string;
  }[];
}

// Get or initialize badge metrics from localStorage
export function getBadgeMetrics(): BadgeMetrics {
  const data = localStorage.getItem('badgeMetrics');
  if (data) {
    return JSON.parse(data);
  }
  
  // Initialize with default values
  const userAuth = localStorage.getItem('userAuth');
  const accountCreatedDate = userAuth ? JSON.parse(userAuth).registeredAt : new Date().toISOString();
  
  return {
    accountCreatedDate,
    loginDates: [],
    currentLoginStreak: 0,
    longestLoginStreak: 0,
    totalMealsLogged: storage.getMeals().length,
    currentMealStreak: 0,
    longestMealStreak: 0,
    daysWithMacroGoalsMet: 0,
    daysWithCalorieGoalsMet: 0,
    perfectDaysCount: 0,
    goalAchievements: [],
  };
}

// Save badge metrics to localStorage
export function saveBadgeMetrics(metrics: BadgeMetrics): void {
  localStorage.setItem('badgeMetrics', JSON.stringify(metrics));
}

// Calculate current login streak
function calculateLoginStreak(loginDates: string[]): number {
  if (loginDates.length === 0) return 0;
  
  const sortedDates = loginDates
    .map(d => new Date(d).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (sortedDates[i] === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// Calculate meal logging streak (consecutive days with at least one meal)
function calculateMealStreak(): number {
  const meals = storage.getMeals();
  if (meals.length === 0) return 0;
  
  const mealDates = meals
    .map(m => new Date(m.timestamp).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < mealDates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (mealDates[i] === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// Update badge metrics (call this on app load and after significant events)
export function updateBadgeMetrics(): BadgeMetrics {
  const metrics = getBadgeMetrics();
  const meals = storage.getMeals();
  
  // Update total meals logged
  metrics.totalMealsLogged = meals.length;
  
  // Update meal streak
  metrics.currentMealStreak = calculateMealStreak();
  metrics.longestMealStreak = Math.max(metrics.longestMealStreak, metrics.currentMealStreak);
  
  // Update login streak
  metrics.currentLoginStreak = calculateLoginStreak(metrics.loginDates);
  metrics.longestLoginStreak = Math.max(metrics.longestLoginStreak, metrics.currentLoginStreak);
  
  saveBadgeMetrics(metrics);
  return metrics;
}

// Record a login event
export function recordLogin(): void {
  const metrics = getBadgeMetrics();
  const today = new Date().toISOString();
  
  // Only add if not already logged in today
  const todayStr = new Date().toDateString();
  const hasLoggedInToday = metrics.loginDates.some(
    d => new Date(d).toDateString() === todayStr
  );
  
  if (!hasLoggedInToday) {
    metrics.loginDates.push(today);
    updateBadgeMetrics();
  }
}

// Get all available badges with their unlock status
export function getAllBadges(): Badge[] {
  const metrics = updateBadgeMetrics();
  const profile = storage.getProfile();
  const meals = storage.getMeals();
  
  const badges: Badge[] = [];
  
  // Welcome Badge - Account Created
  if (metrics.accountCreatedDate) {
    badges.push({
      id: 'welcome',
      title: '🎉 Welcome to Demeter',
      description: 'Started your health journey with Demeter',
      icon: '🎉',
      color: 'bg-purple-100 text-purple-700',
      dateObtained: metrics.accountCreatedDate,
      isUnlocked: true,
    });
  }
  
  // Login Streak Badges
  const loginStreakBadges = [
    { days: 1, title: 'First Day', icon: '📅', color: 'bg-blue-100 text-blue-700' },
    { days: 3, title: 'Three Day Streak', icon: '🔥', color: 'bg-orange-100 text-orange-700' },
    { days: 7, title: 'Week Warrior', icon: '⭐', color: 'bg-yellow-100 text-yellow-700' },
    { days: 30, title: 'Monthly Master', icon: '🏆', color: 'bg-green-100 text-green-700' },
    { days: 100, title: 'Century Champion', icon: '👑', color: 'bg-pink-100 text-pink-700' },
  ];
  
  loginStreakBadges.forEach(({ days, title, icon, color }) => {
    const isUnlocked = metrics.longestLoginStreak >= days;
    const dateObtained = isUnlocked
      ? metrics.loginDates[Math.min(days - 1, metrics.loginDates.length - 1)]
      : undefined;
    
    badges.push({
      id: `login-streak-${days}`,
      title: `${icon} ${title}`,
      description: `Logged in ${days} day${days > 1 ? 's' : ''} in a row`,
      icon,
      color,
      dateObtained,
      isUnlocked,
      progress: isUnlocked ? 100 : (metrics.currentLoginStreak / days) * 100,
      requirement: `${days} consecutive days`,
    });
  });
  
  // First Meal Badge
  if (meals.length > 0) {
    badges.push({
      id: 'first-meal',
      title: '🍽️ First Meal Logged',
      description: 'Logged your very first meal',
      icon: '🍽️',
      color: 'bg-teal-100 text-teal-700',
      dateObtained: meals[meals.length - 1].timestamp,
      isUnlocked: true,
    });
  }
  
  // Meal Milestone Badges
  const mealMilestones = [
    { count: 10, title: 'Getting Started', icon: '🌱', color: 'bg-lime-100 text-lime-700' },
    { count: 50, title: 'Committed Tracker', icon: '📊', color: 'bg-cyan-100 text-cyan-700' },
    { count: 100, title: 'Tracking Master', icon: '💪', color: 'bg-indigo-100 text-indigo-700' },
    { count: 250, title: 'Nutrition Expert', icon: '🎓', color: 'bg-violet-100 text-violet-700' },
  ];
  
  mealMilestones.forEach(({ count, title, icon, color }) => {
    const isUnlocked = metrics.totalMealsLogged >= count;
    const dateObtained = isUnlocked && meals[Math.max(0, meals.length - count)]
      ? meals[Math.max(0, meals.length - count)].timestamp
      : undefined;
    
    badges.push({
      id: `meal-count-${count}`,
      title: `${icon} ${title}`,
      description: `Logged ${count} meals`,
      icon,
      color,
      dateObtained,
      isUnlocked,
      progress: isUnlocked ? 100 : (metrics.totalMealsLogged / count) * 100,
      requirement: `${count} meals logged`,
    });
  });
  
  // Meal Streak Badges
  const mealStreakBadges = [
    { days: 3, title: 'Consistency Starter', icon: '✨', color: 'bg-amber-100 text-amber-700' },
    { days: 7, title: 'Weekly Logger', icon: '📝', color: 'bg-rose-100 text-rose-700' },
    { days: 30, title: 'Daily Dedication', icon: '🎯', color: 'bg-emerald-100 text-emerald-700' },
  ];
  
  mealStreakBadges.forEach(({ days, title, icon, color }) => {
    const isUnlocked = metrics.longestMealStreak >= days;
    
    badges.push({
      id: `meal-streak-${days}`,
      title: `${icon} ${title}`,
      description: `Logged meals ${days} days in a row`,
      icon,
      color,
      dateObtained: isUnlocked ? new Date().toISOString() : undefined,
      isUnlocked,
      progress: isUnlocked ? 100 : (metrics.currentMealStreak / days) * 100,
      requirement: `${days} consecutive days`,
    });
  });
  
  // Goal-Specific Badges
  if (profile) {
    const goalBadges = {
      'weight-loss': {
        title: '⚖️ Weight Loss Journey',
        description: 'Committed to your weight loss goal',
        color: 'bg-red-100 text-red-700',
      },
      'muscle-gain': {
        title: '💪 Muscle Builder',
        description: 'Committed to building muscle',
        color: 'bg-orange-100 text-orange-700',
      },
      'maintain': {
        title: '⚖️ Balance Keeper',
        description: 'Committed to maintaining your weight',
        color: 'bg-blue-100 text-blue-700',
      },
      'general-health': {
        title: '❤️ Health Enthusiast',
        description: 'Committed to general health and wellness',
        color: 'bg-green-100 text-green-700',
      },
    };
    
    const goalBadge = goalBadges[profile.goal];
    if (goalBadge) {
      badges.push({
        id: `goal-${profile.goal}`,
        title: goalBadge.title,
        description: goalBadge.description,
        icon: goalBadge.title.split(' ')[0],
        color: goalBadge.color,
        dateObtained: metrics.accountCreatedDate,
        isUnlocked: true,
      });
    }
  }
  
  // Activity Level Badges
  if (profile) {
    const activityBadges = {
      'sedentary': { title: '🪑 Starting Point', description: 'Every journey begins somewhere' },
      'light': { title: '🚶 Light Mover', description: 'Active 1-3 days per week' },
      'moderate': { title: '🏃 Moderate Athlete', description: 'Active 3-5 days per week' },
      'active': { title: '🏋️ Active Lifestyle', description: 'Active 6-7 days per week' },
      'very-active': { title: '⚡ Super Active', description: 'Intense daily exercise' },
    };
    
    const activityBadge = activityBadges[profile.activityLevel];
    if (activityBadge) {
      badges.push({
        id: `activity-${profile.activityLevel}`,
        title: activityBadge.title,
        description: activityBadge.description,
        icon: activityBadge.title.split(' ')[0],
        color: 'bg-sky-100 text-sky-700',
        dateObtained: metrics.accountCreatedDate,
        isUnlocked: true,
      });
    }
  }
  
  return badges;
}

// Get only unlocked badges
export function getUnlockedBadges(): Badge[] {
  return getAllBadges().filter(badge => badge.isUnlocked);
}

// Get badges in progress (not yet unlocked but with progress)
export function getBadgesInProgress(): Badge[] {
  return getAllBadges().filter(badge => !badge.isUnlocked && badge.progress !== undefined && badge.progress > 0);
}

// Get locked badges (not started)
export function getLockedBadges(): Badge[] {
  return getAllBadges().filter(badge => !badge.isUnlocked && (!badge.progress || badge.progress === 0));
}
