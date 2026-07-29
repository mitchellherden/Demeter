import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { storage, UserProfile } from "../utils/storage";
import { calculateTargets } from "../utils/calculations";
import { ArrowRight, Target, Activity, User } from "lucide-react";

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    goal: 'maintain' as const,
    activityLevel: 'moderate' as const,
    gender: 'male' as const,
  });

  const handleSubmit = () => {
    if (step === 1 && !formData.name.trim()) return;
    if (step === 2 && !formData.goal) return;

    if (step < 3) {
      setStep(step + 1);
    } else {
      // Calculate targets based on user data
      const targets = calculateTargets(
        Number(formData.age),
        formData.gender,
        Number(formData.weight),
        Number(formData.height),
        formData.activityLevel,
        formData.goal
      );

      const profile: UserProfile = {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        weight: Number(formData.weight),
        height: Number(formData.height),
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        ...targets,
      };

      storage.saveProfile(profile);
      storage.setOnboardingComplete(true);
      navigate('/registration-success');
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.name && formData.age && formData.weight && formData.height;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <CardTitle className="text-2xl">Welcome to Demeter</CardTitle>
          </div>
          <CardDescription>
            {step === 1 && "Let's start by getting to know you"}
            {step === 2 && "What are your health goals?"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <User className="w-4 h-4" />
                <span>Step 1 of 2: Basic Information</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: any) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Target className="w-4 h-4" />
                <span>Step 2 of 2: Health Goals</span>
              </div>

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

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-gray-700">
                  Based on your information, we'll calculate personalized daily targets for calories and macronutrients to help you achieve your goals.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step === 2 && (
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={() => {
                if (step === 1) {
                  setStep(2);
                } else {
                  handleSubmit();
                }
              }}
              disabled={!canProceed()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {step === 1 ? 'Continue' : 'Get Started'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}