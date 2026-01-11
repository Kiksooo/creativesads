"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useMemo, useState, useId } from "react";

import { setToken } from "@/src/lib/auth";
import { isValidLocale, t } from "@/lib/i18n/messages";
import { notFound } from "next/navigation";

function authErrorKey(status?: number): string {
  if (status === 409) return "auth.emailExists";
  if (status === 401) return "auth.invalidCredentials";
  if (status === 400) return "auth.invalidForm";
  return "auth.genericError";
}

export default function RegisterPage() {
  const params = useParams();
  const locale = params.locale as string;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email.includes("@")) return false;
    if (password.length < 8) return false;
    if (password !== confirm) return false;
    return true;
  }, [email, password, confirm]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError(t(locale, authErrorKey(res.status)));
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data?.token) setToken(data.token);

      window.location.href = `/${locale}/app`;
    } catch (e: any) {
      const status = e?.response?.status ?? e?.status;
      setError(t(locale, authErrorKey(status)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">{t(locale, 'auth.createAccount')}</h1>
        <p className="mt-2 text-black/60">{t(locale, 'auth.signUpToGetStarted')}</p>

        <form onSubmit={onSubmit} className="mt-10 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <label htmlFor={emailId} className="block text-sm font-medium text-black/70">{t(locale, 'common.email')}</label>
          <input
            id={emailId}
            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black/30"
            placeholder={t(locale, 'common.email')}
            // Placeholder не переводим, т.к. это пример email адреса
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <p className="mt-2 text-xs text-black/45">{t(locale, 'auth.emailNeverShared')}</p>

          <label htmlFor={passwordId} className="mt-6 block text-sm font-medium text-black/70">{t(locale, 'common.password')}</label>
          <input
            id={passwordId}
            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black/30"
            placeholder={t(locale, 'auth.passwordMinLength')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <p className="mt-2 text-xs text-black/45">{t(locale, 'auth.passwordMinLength')}</p>

          <label htmlFor={confirmId} className="mt-6 block text-sm font-medium text-black/70">{t(locale, 'common.confirmPassword')}</label>
          <input
            id={confirmId}
            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black/30"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="mt-6 w-full rounded-xl bg-black px-4 py-3 font-medium text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? t(locale, 'auth.creating') : t(locale, 'auth.createAccount')}
          </button>

          <div className="mt-6 text-center text-sm text-black/60">
            {t(locale, 'auth.alreadyHaveAccount')}{" "}
            <Link className="font-medium text-black underline underline-offset-4" href={`/${locale}/login`}>
              {t(locale, 'auth.signIn')}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
