// Authentication helpers for Supabase-backed sign-in and session management.
import { supabase } from "./supabaseClient";

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
}

export async function getCurrentUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }

  return user?.id ?? null;
}

export async function signOut() {
  localStorage.removeItem("userAuth");
  return supabase.auth.signOut();
}

export async function getCurrentSession() {
  return supabase.auth.getSession();
}

export async function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}
