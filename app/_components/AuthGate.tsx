"use client";

import { LogOut, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "../_lib/AuthContext";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.43 3.58v2.98h3.93c2.3-2.12 3.62-5.24 3.62-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.93-2.98c-1.09.73-2.48 1.15-4 1.15-3.08 0-5.68-2.08-6.61-4.87H1.34v3.07C3.31 21.3 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.39 14.38A7.19 7.19 0 0 1 5.01 12c0-.83.14-1.63.38-2.38V6.55H1.34A11.97 11.97 0 0 0 0 12c0 1.93.46 3.76 1.34 5.45l4.05-3.07z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.34 0 3.31 2.7 1.34 6.55l4.05 3.07C6.32 6.83 8.92 4.75 12 4.75z"
      />
    </svg>
  );
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading, isAllowed, error, signInWithGoogle, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-400">Yükleniyor...</p>
      </div>
    );
  }

  if (!user || !isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Vakıf Takip
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Devam etmek için giriş yapın
          </p>

          {user && !isAllowed && (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-left text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-400">
              <ShieldAlert size={18} className="mt-0.5 shrink-0" />
              <span>Bu hesabın (<strong>{user.email}</strong>) erişim izni bulunmuyor.</span>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}

          <button
            type="button"
            onClick={user ? signOut : signInWithGoogle}
            className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            {user ? (
              <>
                <LogOut size={16} /> Çıkış Yap
              </>
            ) : (
              <>
                <GoogleIcon /> Google ile Giriş Yap
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
