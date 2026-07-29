import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { storage } from "../utils/storage";
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros, calculateBMI, getBMICategory } from "../utils/calculations";
import { User, Target, Activity, TrendingDown, AlertCircle, Award } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AchievementBadge } from "./AchievementBadge";
import { getUnlockedBadges, getBadgesInProgress, getLockedBadges } from "../utils/badges";

export function Profile() {
  const navigate = useNavigate();
  const profile = storage.getProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile || {
    name: '',
    age: 0,
    weight: 0,
    height: 0,
    goal: 'maintain' as const,
    activityLevel: 'moderate' as const,
    targetCalories: 2000,
    targetProtein: 150,
    targetCarbs: 200,
    targetFat: 67,
  });

  if (!profile) {
    return null;
  }

  const bmi = calculateBMI(profile.weight, profile.height);
  const bmiCategory = getBMICategory(bmi);

  const handleSave = () => {
    const age = formData.age;
    const weight = formData.weight;
    const height = formData.height;

    const bmr = calculateBMR(weight, height, age);
    const tdee = calculateTDEE(bmr, formData.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, formData.goal);
    const macros = calculateMacros(targetCalories, formData.goal, weight);

    const updatedProfile = {
      ...formData,
      targetCalories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFat: macros.fat,
    };

    storage.setProfile(updatedProfile);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleClearData = () => {
    storage.clearAllData();
    toast.success("All data cleared");
    navigate('/register');
  };

  const goalLabels = {
    'weight-loss': 'Weight Loss',
    'muscle-gain': 'Muscle Gain',
    'maintain': 'Maintain Weight',
    'general-health': 'General Health',
  };

  const activityLabels = {
    'sedentary': 'Sedentary',
    'light': 'Light',
    'moderate': 'Moderate',
    'active': 'Active',
    'very-active': 'Very Active',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Your Profile</h2>
          <p className="text-gray-600">Manage your personal information and goals</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Achievements
          </CardTitle>
          <CardDescription>
            Track your progress and unlock badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="unlocked" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="unlocked">
                Unlocked ({getUnlockedBadges().length})
              </TabsTrigger>
              <TabsTrigger value="progress">
                In Progress ({getBadgesInProgress().length})
              </TabsTrigger>
              <TabsTrigger value="locked">
                Locked ({getLockedBadges().length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="unlocked" className="mt-6">
              {getUnlockedBadges().length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {getUnlockedBadges().map((badge) => (
                    <AchievementBadge key={badge.id} badge={badge} size="md" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No badges unlocked yet. Keep going!</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="progress" className="mt-6">
              {getBadgesInProgress().length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {getBadgesInProgress().map((badge) => (
                    <AchievementBadge key={badge.id} badge={badge} size="md" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No badges in progress yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="locked" className="mt-6">
              {getLockedBadges().length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {getLockedBadges().map((badge) => (
                    <AchievementBadge key={badge.id} badge={badge} size="md" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>All badges unlocked! Amazing!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-600">Name</Label>
                <p className="font-medium mt-1">{profile.name}</p>
              </div>
              <div>
                <Label className="text-gray-600">Age</Label>
                <p className="font-medium mt-1">{profile.age} years</p>
              </div>
              <div>
                <Label className="text-gray-600">Weight</Label>
                <p className="font-medium mt-1">{profile.weight} kg</p>
              </div>
              <div>
                <Label className="text-gray-600">Height</Label>
                <p className="font-medium mt-1">{profile.height} cm</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals & Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Goals & Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-600">Primary Goal</Label>
                <div className="mt-1">
                  <Badge variant="secondary" className="text-sm">
                    {goalLabels[profile.goal]}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Activity Level</Label>
                <div className="mt-1">
                  <Badge variant="secondary" className="text-sm">
                    {activityLabels[profile.activityLevel]}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Primary Goal</Label>
                <Select
                  value={formData.goal}
                  onValueChange={(value: any) => setFormData({ ...formData, goal: value })}
                >
                  <SelectTrigger id="goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight-loss">Weight Loss</SelectItem>
                    <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="general-health">General Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity">Activity Level</Label>
                <Select
                  value={formData.activityLevel}
                  onValueChange={(value: any) => setFormData({ ...formData, activityLevel: value })}
                >
                  <SelectTrigger id="activity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (Little or no exercise)</SelectItem>
                    <SelectItem value="light">Light (Exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (Exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (Exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very-active">Very Active (Intense exercise daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutrition Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-purple-600" />
            Daily Nutrition Targets
          </CardTitle>
          <CardDescription>Based on your goals and activity level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{profile.targetCalories}</p>
              <p className="text-sm text-gray-600 mt-1">Calories</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{profile.targetProtein}g</p>
              <p className="text-sm text-gray-600 mt-1">Protein</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{profile.targetCarbs}g</p>
              <p className="text-sm text-gray-600 mt-1">Carbs</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{profile.targetFat}g</p>
              <p className="text-sm text-gray-600 mt-1">Fat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Body Mass Index (BMI)</p>
              <p className="text-2xl font-bold mt-1">{bmi.toFixed(1)}</p>
            </div>
            <Badge variant={
              bmi < 18.5 ? "secondary" :
              bmi < 25 ? "default" :
              bmi < 30 ? "secondary" :
              "destructive"
            }>
              {bmiCategory}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Save Changes
          </Button>
          <Button
            onClick={() => {
              setFormData(profile);
              setIsEditing(false);
            }}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions - proceed with caution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your profile and all meal history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}