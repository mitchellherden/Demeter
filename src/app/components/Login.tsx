// Login screen for existing users.
// It validates credentials, signs in with Supabase, and records the user session.
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Mail, Lock } from "lucide-react";
import { signInWithEmail } from "../utils/auth";
import { recordLogin } from "../utils/badges";
import { setCurrentUserAuth } from "../utils/storage";
import { supabase } from "../utils/supabaseClient";

export function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { data, error } = await signInWithEmail(formData.email, formData.password);

      if (error) {
        setErrors({ ...errors, general: error.message });
        return;
      }

      if (!data.session) {
        setErrors({ ...errors, general: 'Unable to sign in. Please verify your email or try again.' });
        return;
      }

      if (data.user) {
        setCurrentUserAuth(data.user.id, data.user.email ?? formData.email);

        const { data: existingProfile, error: profileLookupError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (profileLookupError && profileLookupError.code !== 'PGRST116') {
          console.error('Failed to check for existing profile:', profileLookupError);
        }

        if (!existingProfile) {
          const { error: profileError } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            email: data.user.email ?? formData.email,
            name: null,
            age: null,
            gender: null,
            weight: null,
            height: null,
            goal: null,
            activity_level: null,
            target_calories: null,
            target_protein: null,
            target_carbs: null,
            target_fat: null,
          });

          if (profileError) {
            console.error('Failed to create Supabase profile row:', profileError);
          }
        }
      }

      recordLogin();
      navigate('/dashboard');
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
    // Clear general error
    if (errors.general) {
      setErrors({ ...errors, general: undefined });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
          </div>
          <CardDescription>
            Sign in to your Demeter account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-600" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
                onClick={() => navigate('/reset-password')}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Sign In
            </Button>

            {/* Additional Links */}
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-green-600 hover:text-green-700 font-medium"
                onClick={() => navigate('/register')}
              >
                Create Account
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}