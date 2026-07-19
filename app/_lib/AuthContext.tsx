"use client";

import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ALLOWED_EMAILS, auth, googleProvider } from "./firebase";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAllowed: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|WhatsApp|Line\/|MicroMessenger|Twitter/i.test(ua);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (!result) return;
        const email = result.user.email?.toLowerCase();
        if (!email || !ALLOWED_EMAILS.includes(email)) {
          firebaseSignOut(auth);
          setError("Bu hesabın erişim izni yok. Yetkili bir hesapla giriş yapın.");
        }
      })
      .catch(() => {
        setError("Giriş yapılamadı. Lütfen tekrar deneyin.");
      });
  }, []);

  const isAllowed = Boolean(
    user?.email && ALLOWED_EMAILS.includes(user.email.toLowerCase())
  );

  async function signInWithGoogle() {
    setError(null);
    try {
      if (isInAppBrowser()) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();
      if (!email || !ALLOWED_EMAILS.includes(email)) {
        await firebaseSignOut(auth);
        setError("Bu hesabın erişim izni yok. Yetkili bir hesapla giriş yapın.");
      }
    } catch {
      setError("Giriş yapılamadı. Lütfen tekrar deneyin.");
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAllowed, error, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
