import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getCurrentSession } from "../utils/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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
