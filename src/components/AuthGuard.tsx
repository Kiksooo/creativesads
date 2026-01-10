'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { getToken } from '@/src/lib/auth';
import { type Locale, t } from '@/lib/i18n/messages';
import { Card, CardContent } from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';

interface AuthGuardProps {
  children: ReactNode;
  locale: Locale;
}

export default function AuthGuard({ children, locale }: AuthGuardProps) {
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setToken(getToken());
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative z-10">
        <Card className="max-w-md w-full shadow-lg relative z-10">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t(locale, 'auth.pleaseRegister')}
          </h2>
          <p className="text-gray-600 mb-6">
            You need to login to access this page.
          </p>
          <Link href={`/${locale}/login`} className="inline-block relative z-10">
            <Button variant="primary" size="lg">
              Login
            </Button>
          </Link>
        </CardContent>
      </Card>
      </div>
    );
  }

  return <>{children}</>;
}

