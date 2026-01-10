'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isValidLocale, t } from '@/lib/i18n/messages';
import { notFound } from 'next/navigation';
import { apiGet } from '@/src/lib/api';
import CreativeGrid from '@/src/components/CreativeGrid';
import LoadingGrid from '@/src/components/LoadingGrid';
import EmptyState from '@/src/components/EmptyState';
import { type Creative } from '@/src/components/CreativeCard';
import { clearToken } from '@/src/lib/auth';
import Link from 'next/link';
import Button from '@/src/components/ui/Button';

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    async function fetchCreatives() {
      setLoading(true);
      setError(null);

      try {
        const response = await apiGet<{ creatives?: Creative[]; data?: Creative[] }>(
          '/creatives',
          undefined,
          { requireAuth: true }
        );

        if (response.status === 401) {
          clearToken();
          setSessionExpired(true);
          setLoading(false);
          return;
        }

        if (response.error) {
          setError(response.error);
          setLoading(false);
          return;
        }

        // Handle different response formats
        const data = response.data;
        const items = data?.creatives || data?.data || (Array.isArray(data) ? data : []);
        setCreatives(items.slice(0, 8)); // Show only recent 8 on dashboard
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchCreatives();
  }, []);

  if (sessionExpired) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t(locale, 'dashboard.title')}</h1>
        </div>
        <EmptyState
          title={t(locale, 'auth.sessionExpired')}
          description="Please login again to continue."
          actionLabel="Login"
          actionHref={`/${locale}/login`}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t(locale, 'dashboard.title')}</h1>
          <p className="text-gray-600">{t(locale, 'dashboard.description')}</p>
        </div>
        <Link href={`/${locale}/app/upload`}>
          <Button variant="primary" size="md">
            {t(locale, 'common.upload')}
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingGrid count={8} />
      ) : error ? (
        <EmptyState
          title="Error loading dashboard"
          description={error}
          actionLabel={t(locale, 'common.retry')}
          onAction={() => router.refresh()}
        />
      ) : creatives.length === 0 ? (
        <EmptyState
          title="Welcome to Creo App"
          description="Get started by uploading your first creative for AI analysis."
          actionLabel={t(locale, 'common.upload')}
          actionHref={`/${locale}/app/upload`}
        />
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Creatives</h2>
            <Link
              href={`/${locale}/app/library`}
              className="text-sm text-gray-600 hover:text-black font-medium"
            >
              View all →
            </Link>
          </div>
          <CreativeGrid creatives={creatives} locale={locale} />
        </>
      )}
    </div>
  );
}

