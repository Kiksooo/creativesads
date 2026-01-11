'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isValidLocale, t } from '@/lib/i18n/messages';
import { notFound } from 'next/navigation';
import { apiGet } from '@/src/lib/api';
import { clearToken, getToken } from '@/src/lib/auth';
import { mapErrorMessageToKey } from '@/lib/i18n/errorMapper';
import { Card, CardContent } from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import Alert from '@/src/components/ui/Alert';
import Spinner from '@/src/components/ui/Spinner';
import EmptyState from '@/src/components/EmptyState';
import Badge from '@/src/components/ui/Badge';

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [usage, setUsage] = useState<{ count: number; limit: number } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);

      try {
        const response = await apiGet<{ user: { id: string; email: string } }>('/auth/me');

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

        if (response.data?.user) {
          setUser(response.data.user);
        }

        // Get daily usage (simplified - in real app, fetch from API)
        const today = new Date().toISOString().split('T')[0];
        const token = getToken();
        if (token) {
          try {
            // This is a placeholder - in real app, fetch from API
            setUsage({ count: 0, limit: 3 });
          } catch {
            // Ignore
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load settings';
        const errorKey = mapErrorMessageToKey(errorMsg);
        setError(t(locale, errorKey));
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleLogout = () => {
    clearToken();
    router.push(`/${locale}/login`);
  };

  if (sessionExpired) {
    return (
      <EmptyState
        title={t(locale, 'auth.sessionExpired')}
        description={t(locale, 'auth.pleaseLoginAgain')}
        actionLabel={t(locale, 'auth.login')}
        actionHref={`/${locale}/login`}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !user) {
    return (
        <EmptyState
          title={t(locale, 'errors.failedToLoadSettings')}
          description={error}
          actionLabel={t(locale, 'common.retry')}
          onClick={() => router.refresh()}
        />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t(locale, 'settings.title')}</h1>
        <p className="text-gray-600">{t(locale, 'settings.description')}</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t(locale, 'settings.profile')}</h2>
            {user && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t(locale, 'settings.email')}</label>
                  <Input
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">{t(locale, 'settings.emailCannotChanged')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t(locale, 'settings.userId')}</label>
                  <Input
                    type="text"
                    value={user.id}
                    disabled
                    className="bg-gray-50 font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t(locale, 'settings.account')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t(locale, 'settings.accountType')}</p>
                  <p className="text-xs text-gray-500">{t(locale, 'settings.freeTier')}</p>
                </div>
                <Badge variant="blue">{t(locale, 'settings.free')}</Badge>
              </div>
              {usage && (
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t(locale, 'settings.dailyAnalysisLimit')}</p>
                    <p className="text-xs text-gray-500">
                      {usage.count} {t(locale, 'settings.of')} {usage.limit} {t(locale, 'settings.analysesUsedToday')}
                    </p>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        usage.count >= usage.limit
                          ? 'bg-red-500'
                          : usage.count / usage.limit > 0.8
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (usage.count / usage.limit) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Limits */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t(locale, 'settings.limits')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{t(locale, 'settings.freeTierIncludes')}</span>
              </div>
              <ul className="space-y-2 ml-4">
                <li className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {t(locale, 'settings.upTo3Analyses')}
                </li>
                <li className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {t(locale, 'settings.imageVideoUploads')}
                </li>
                <li className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {t(locale, 'settings.basicInsights')}
                </li>
                <li className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-gray-400">○</span>
                  {t(locale, 'settings.advancedAnalytics')}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-4">{t(locale, 'settings.dangerZone')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="text-sm font-medium text-red-900">{t(locale, 'settings.signOut')}</p>
                  <p className="text-xs text-red-700 mt-1">{t(locale, 'settings.signOutDescription')}</p>
                </div>
                <Button variant="secondary" onClick={handleLogout}>
                  {t(locale, 'settings.signOutButton')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

