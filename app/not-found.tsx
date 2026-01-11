import Link from 'next/link';
import { Card, CardContent } from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import { t, type Locale } from '@/lib/i18n/messages';

export default function NotFound() {
  const locale: Locale = 'en';
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative z-10">
      <Card className="max-w-md w-full shadow-lg relative z-10">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {t(locale, 'errors.notFound')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t(locale, 'creative.notFoundDescription')}
          </p>
          <Link href="/en" className="inline-block relative z-10">
            <Button variant="primary" size="lg">
              {t(locale, 'nav.home')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

