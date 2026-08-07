// Protects authenticated routes by checking whether a valid Supabase session exists.
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { getCurrentSession } from "../utils/auth";
import { hydrateUserDataFromSupabase, storage } from "../utils/storage";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Validate the current auth session before allowing access to protected screens.
  useEffect(() => {
    async function verifySession() {
      const demoUser = localStorage.getItem('userAuth');
      const isDemoSession = Boolean(demoUser);

      if (!isDemoSession) {
        const { data } = await getCurrentSession();

        if (!data.session) {
          navigate("/login", { replace: true });
          return;
        }
      }

      if (isDemoSession) {
        const profile = storage.getProfile();
        const onboardingComplete = storage.hasCompletedOnboarding();
        const isOnboardingRoute = location.pathname === "/onboarding" || location.pathname.startsWith("/onboarding");

        if ((!profile || !profile.name || !onboardingComplete) && !isOnboardingRoute) {
          navigate("/onboarding", { replace: true });
          return;
        }

        setLoading(false);
        return;
      }

      await hydrateUserDataFromSupabase();

      const isOnboardingRoute = location.pathname === "/onboarding" || location.pathname.startsWith("/onboarding");
      const profile = storage.getProfile();
      const onboardingComplete = storage.hasCompletedOnboarding();

      if ((!profile || !profile.name || !onboardingComplete) && !isOnboardingRoute) {
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
