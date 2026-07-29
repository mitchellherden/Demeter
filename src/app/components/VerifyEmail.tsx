import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Mail, AlertCircle, ArrowRight } from "lucide-react";

export function VerifyEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("userAuth");
    if (!saved) {
      navigate("/register");
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setEmail(parsed.email ?? null);
    } catch {
      setEmail(null);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center text-center mb-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          </div>
          <CardDescription className="text-center">
            A verification link has been sent to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-green-900">
              <AlertCircle className="w-4 h-4" />
              <p>
                {email
                  ? `Please open ${email} and click the confirmation link to complete registration.`
                  : "Please check your email and follow the verification link."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Back to Login
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/register")}
              className="w-full"
            >
              Return to Registration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
