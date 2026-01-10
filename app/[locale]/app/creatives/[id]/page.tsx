'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { isValidLocale } from '@/lib/i18n/messages';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';

export default function CreativeDetailPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/${locale}/app`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Library
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Creative {id}
        </h1>
        <p className="text-gray-600">Creative details and processing status</p>
      </div>

      <Card className="shadow-lg relative z-10">
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Creative ID</h2>
            <p className="text-lg font-mono text-gray-900">{id}</p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Processing Status</h2>
            <p className="text-gray-700">
              Processing status will appear here
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Link href={`/${locale}/app`} className="inline-block">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Back to Library
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

