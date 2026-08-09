// Protects authenticated routes by checking whether a valid Supabase session exists.
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { getCurrentSession } from "../utils/auth";
import { ensureCurrentUserAuthFromSession, hydrateUserDataFromSupabase, storage } from "../utils/storage";

function hasCompletedSetup() {
  const profile = storage.getProfile();
  const onboardingComplete = storage.hasCompletedOnboarding();
  const hasMealHistory = storage.getMeals().length > 0;

  const profileLooksComplete = Boolean(
    profile &&
    profile.goal &&
    profile.activityLevel &&
    profile.targetCalories > 0
  );

  const hasMeaningfulProfile = Boolean(profile && (profile.name || profile.goal || hasMealHistory));

  return onboardingComplete || profileLooksComplete || hasMeaningfulProfile;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Validate the current auth session before allowing access to protected screens.
  useEffect(() => {
    async function verifySession() {
      const localUserAuth = localStorage.getItem('userAuth');
      const { data } = await getCurrentSession();
      const hasSupabaseSession = Boolean(data.session);
      const isDemoSession = Boolean(localUserAuth) && !hasSupabaseSession;

      if (!hasSupabaseSession && !isDemoSession) {
        navigate('/login', { replace: true });
        return;
      }

      if (hasSupabaseSession) {
        await ensureCurrentUserAuthFromSession();
      }

      if (isDemoSession) {
        const isOnboardingRoute = location.pathname === "/onboarding" || location.pathname.startsWith("/onboarding");

        if (!hasCompletedSetup() && !isOnboardingRoute) {
          navigate("/onboarding", { replace: true });
          return;
        }

        setLoading(false);
        return;
      }

      await hydrateUserDataFromSupabase();

      const isOnboardingRoute = location.pathname === "/onboarding" || location.pathname.startsWith("/onboarding");

      if (!hasCompletedSetup() && !isOnboardingRoute) {
        navigate("/onboarding", { replace: true });
        return;
      }

      setLoading(false);
    }

    void verifySession();
  }, [navigate, location.pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
