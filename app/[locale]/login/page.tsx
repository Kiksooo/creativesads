'use client';

import { useState, useId } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { isValidLocale, type Locale, t } from '@/lib/i18n/messages';
import { Card, CardContent } from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import Alert from '@/src/components/ui/Alert';
import Spinner from '@/src/components/ui/Spinner';
import { notFound } from 'next/navigation';
import { parseApiError } from '@/src/lib/http';
import { setToken } from '@/src/lib/auth';

export default function LoginPage() {
  const params = useParams();
  const locale = params.locale as string;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError(await parseApiError(res));
        setLoading(false);
        return;
      }

      const data = await res.json();
      
      // Extract token from different response formats
      const token = data?.token || data?.data?.token;
      
      if (token) {
        setToken(token);
        // Redirect to dashboard
        window.location.href = `/${locale}/app`;
      } else {
        setError('Token not found in response');
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          Sign In
        </h1>
        <p className="text-lg text-gray-600">Welcome back</p>
      </div>

      <Card className="max-w-md mx-auto shadow-lg">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id={emailId}
              type="email"
              label={t(locale, 'common.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              autoComplete="email"
            />

            <Input
              id={passwordId}
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              autoComplete="current-password"
            />

            {error && (
              <Alert variant="error">
                <p className="text-sm font-medium">{error}</p>
              </Alert>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href={`/${locale}/register`}
                  className="text-black font-medium hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

