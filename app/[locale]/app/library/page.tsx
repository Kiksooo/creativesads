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

export default function LibraryPage() {
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
          '/creatives'
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
        setCreatives(items);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t(locale, 'nav.library')}</h1>
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

  if (loading) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t(locale, 'nav.library')}</h1>
            <p className="text-gray-600">Your creative library</p>
          </div>
        </div>
        <LoadingGrid count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t(locale, 'nav.library')}</h1>
        </div>
        <EmptyState
          title="Error loading library"
          description={error}
          actionLabel={t(locale, 'common.retry')}
          onClick={() => router.refresh()}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t(locale, 'nav.library')}</h1>
          <p className="text-gray-600">
            {creatives.length > 0
              ? `${creatives.length} creative${creatives.length !== 1 ? 's' : ''}`
              : 'Your creative library'}
          </p>
        </div>
        <Link href={`/${locale}/app/upload`}>
          <Button variant="primary" size="md">
            {t(locale, 'common.upload')}
          </Button>
        </Link>
      </div>

      {creatives.length === 0 ? (
        <EmptyState
          title="No creatives yet"
          description="Get started by uploading your first creative."
          actionLabel={t(locale, 'common.upload')}
          actionHref={`/${locale}/app/upload`}
        />
      ) : (
        <CreativeGrid creatives={creatives} locale={locale} />
      )}
    </div>
  );
}

