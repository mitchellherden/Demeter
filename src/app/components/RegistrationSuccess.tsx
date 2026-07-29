import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle, Mail, Globe } from "lucide-react";

const regions = [
  { value: 'na', label: 'North America' },
  { value: 'sa', label: 'South America' },
  { value: 'eu', label: 'Europe' },
  { value: 'af', label: 'Africa' },
  { value: 'as', label: 'Asia' },
  { value: 'oc', label: 'Oceania' },
  { value: 'me', label: 'Middle East' },
];

export function RegistrationSuccess() {
  const navigate = useNavigate();

  // Get user auth data from localStorage
  const userAuth = localStorage.getItem('userAuth');
  const authData = userAuth ? JSON.parse(userAuth) : null;

  useEffect(() => {
    // If no auth data exists, redirect to registration
    if (!authData) {
      navigate('/register');
    }
  }, [authData, navigate]);

  if (!authData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center text-center mb-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Account Created Successfully!</CardTitle>
          </div>
          <CardDescription className="text-center">
            Your Demeter account has been created and your profile is all set up. You can now sign in to start tracking your nutrition journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-green-700" />
              <span className="font-medium text-green-900">Email:</span>
              <span className="text-green-700">{authData.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-green-700" />
              <span className="font-medium text-green-900">Region:</span>
              <span className="text-green-700">
                {regions.find(r => r.value === authData.region)?.label}
              </span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Continue to Sign In
          </Button>

          <p className="text-center text-sm text-gray-600">
            Use your email and password to sign in and start your wellness journey.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
