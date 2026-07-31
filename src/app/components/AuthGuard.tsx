// Protects authenticated routes by checking whether a valid Supabase session exists.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getCurrentSession } from "../utils/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Validate the current auth session before allowing access to protected screens.
  useEffect(() => {
    async function verifySession() {
      const { data } = await getCurrentSession();
      if (!data.session) {
        navigate("/login");
        return;
      }
      setLoading(false);
    }

    verifySession();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
