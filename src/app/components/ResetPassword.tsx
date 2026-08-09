// Password reset flow.
// It captures the user's email and also handles password updates from recovery links.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Mail, Lock } from "lucide-react";
import { sendPasswordReset } from "../utils/auth";
import { supabase } from "../utils/supabaseClient";
import { ensureCurrentUserAuthFromSession } from "../utils/storage";

export function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isResetDisabled = useMemo(() => {
    return !email.trim() || isSubmitting;
  }, [email, isSubmitting]);

  const isUpdateDisabled = useMemo(() => {
    return !newPassword || !confirmPassword || isSubmitting;
  }, [newPassword, confirmPassword, isSubmitting]);

  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    const fromRecoveryLink = hash.includes("type=recovery") || search.includes("type=recovery") || search.includes("code=");
    setIsRecoveryMode(fromRecoveryLink);

    if (fromRecoveryLink) {
      void ensureCurrentUserAuthFromSession();
    }
  }, []);

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await sendPasswordReset(email);
    setIsSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Check your inbox for a password reset link.");
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password updated successfully. You can now sign in with your new password.");
    setTimeout(() => navigate('/login'), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center text-center mb-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              {isRecoveryMode ? <Lock className="w-10 h-10 text-green-600" /> : <Mail className="w-10 h-10 text-green-600" />}
            </div>
            <CardTitle className="text-2xl">{isRecoveryMode ? 'Set New Password' : 'Reset Password'}</CardTitle>
          </div>
          <CardDescription className="text-center">
            {isRecoveryMode
              ? 'Create a new password for your account.'
              : 'Enter your email and we’ll send a reset link to your inbox.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={isRecoveryMode ? handleUpdatePassword : handleRequestLink} className="space-y-4">
            {!isRecoveryMode ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-600" />
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-600" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}
            <Button className="w-full bg-green-600 hover:bg-green-700" type="submit" disabled={isRecoveryMode ? isUpdateDisabled : isResetDisabled}>
              {isRecoveryMode ? 'Update password' : 'Send reset link'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => navigate('/login')}
            >
              Back to Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
