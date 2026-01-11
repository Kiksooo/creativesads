'use client';

import { useEffect } from 'react';
import Button from '@/src/components/ui/Button';
import { Card, CardContent } from '@/src/components/ui/Card';
import { t, type Locale, isValidLocale } from '@/lib/i18n/messages';
import { mapErrorMessageToKey } from '@/lib/i18n/errorMapper';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // Default locale for root error page
  const locale: Locale = 'en';
  const errorKey = error.message ? mapErrorMessageToKey(error.message) : 'errors.anErrorOccurred';
  const errorMessage = error.message ? t(locale, errorKey) : t(locale, 'errors.anErrorOccurred');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative z-10">
      <Card className="max-w-md w-full shadow-lg relative z-10">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-600"
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t(locale, 'errors.serverError')}
          </h1>
          <p className="text-gray-600 mb-8">
            {errorMessage}
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="primary" size="lg" onClick={reset}>
              {t(locale, 'common.retry')}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => (window.location.href = '/en')}
            >
              {t(locale, 'nav.home')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

