'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { isValidLocale, t } from '@/lib/i18n/messages';
import { notFound } from 'next/navigation';
import { apiGet, apiPost } from '@/src/lib/api';
import { clearToken } from '@/src/lib/auth';
import { mapErrorMessageToKey } from '@/lib/i18n/errorMapper';
import { Card, CardContent } from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import StatusPill from '@/src/components/StatusPill';
import Alert from '@/src/components/ui/Alert';
import Spinner from '@/src/components/ui/Spinner';
import EmptyState from '@/src/components/EmptyState';
import Badge from '@/src/components/ui/Badge';

interface Creative {
  id: string;
  filename: string;
  type: 'image' | 'video';
  file_url: string | null;
  status: 'queued' | 'processing' | 'done' | 'failed';
  platform: string | null;
  vertical: string | null;
  country: string | null;
  language: string | null;
  goal: string | null;
  created_at: string;
}

interface Analysis {
  id: string;
  creative_id: string;
  score: number;
  hook_score: number;
  clarity_score: number;
  compliance_risk: number;
  strengths: string[];
  issues: string[];
  fixes: string[];
  hooks: string[];
  ctas: string[];
  script_15s: string | null;
  summary: string;
}

export default function CreativeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const id = params.id as string;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const [creative, setCreative] = useState<Creative | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    fetchCreative();
    
    // Poll for status updates if processing
    let pollInterval: NodeJS.Timeout | null = null;
    if (creative?.status === 'processing') {
      pollInterval = setInterval(() => {
        fetchCreative();
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [id, creative?.status]);

  async function fetchCreative() {
    try {
      const response = await apiGet<{ creative: Creative; analysis: Analysis | null }>(`/creatives/${id}`);

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

      const data = response.data;
      if (data?.creative) {
        setCreative(data.creative);
        if (data.analysis) {
          setAnalysis(data.analysis);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load creative';
      const errorKey = mapErrorMessageToKey(errorMsg);
      setError(t(locale, errorKey));
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!creative) return;

    setAnalyzing(true);
    setError(null);

    try {
      // Send language preference with the analyze request
      const response = await apiPost<{ analysis: Analysis }>(
        `/creatives/${id}/analyze`,
        { language: locale }
      );

      if (response.status === 401) {
        clearToken();
        setSessionExpired(true);
        setAnalyzing(false);
        return;
      }

      if (response.status === 429) {
        setError(t(locale, 'analysis.dailyLimitReached'));
        setAnalyzing(false);
        return;
      }

      if (response.error) {
        const errorKey = mapErrorMessageToKey(response.error);
        setError(t(locale, errorKey));
        setAnalyzing(false);
        return;
      }

      if (response.data?.analysis) {
        setAnalysis(response.data.analysis);
        // Refresh creative to get updated status
        await fetchCreative();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Analysis failed';
      const errorKey = mapErrorMessageToKey(errorMsg);
      setError(t(locale, errorKey));
    } finally {
      setAnalyzing(false);
    }
  }

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

  if (error && !creative) {
    return (
      <EmptyState
        title={t(locale, 'errors.failedToLoadCreative')}
        description={error}
        actionLabel={t(locale, 'common.back')}
        actionHref={`/${locale}/app`}
      />
    );
  }

  if (!creative) {
    return (
      <EmptyState
        title={t(locale, 'creative.notFound')}
        description={t(locale, 'creative.notFoundDescription')}
        actionLabel={t(locale, 'common.back')}
        actionHref={`/${locale}/app`}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${locale}/app`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t(locale, 'common.back')}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{creative.filename}</h1>
            <div className="flex items-center gap-3">
              <StatusPill status={creative.status} />
              {creative.type && (
                <Badge variant={creative.type === 'video' ? 'blue' : 'green'}>
                  {creative.type.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
          {creative.status !== 'processing' && creative.status !== 'done' && (
            <Button
              variant="primary"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  {t(locale, 'analysis.analyzing')}
                </span>
              ) : (
                t(locale, 'analysis.startAnalysis')
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" className="mb-6">
          <p className="text-sm font-medium">{error}</p>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t(locale, 'creative.preview')}</h2>
              {creative.file_url ? (
                creative.type === 'video' ? (
                  <video
                    src={creative.file_url}
                    controls
                    className="w-full rounded-lg"
                    preload="metadata"
                    onError={(e) => {
                      console.error('[Preview] Video load error:', e);
                      setError(t(locale, 'errors.failedToLoadVideoPreview'));
                    }}
                  >
                    {t(locale, 'creative.videoNotSupported')}
                  </video>
                ) : creative.type === 'image' ? (
                  <img
                    src={creative.file_url}
                    alt={creative.filename || t(locale, 'creative.preview')}
                    className="w-full rounded-lg object-contain"
                    onError={(e) => {
                      console.error('[Preview] Image load error:', e);
                      setError(t(locale, 'errors.failedToLoadImagePreview'));
                    }}
                  />
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-4 p-6">
                    <p className="text-gray-500 text-center">{t(locale, 'errors.fileNotFound')}</p>
                    <Button
                      variant="primary"
                      onClick={() => {
                        window.location.reload();
                      }}
                    >
                      {t(locale, 'common.refresh')}
                    </Button>
                  </div>
                )
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-4 p-6">
                  <p className="text-gray-500 text-center">{t(locale, 'errors.fileNotFound')}</p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      fetchCreative();
                    }}
                  >
                    {t(locale, 'common.refresh')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t(locale, 'creative.metadata')}</h2>
              <dl className="grid grid-cols-2 gap-4">
                {creative.platform && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">{t(locale, 'creative.platform')}</dt>
                    <dd className="text-sm text-gray-900">{creative.platform}</dd>
                  </>
                )}
                {creative.vertical && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">{t(locale, 'creative.vertical')}</dt>
                    <dd className="text-sm text-gray-900">{creative.vertical}</dd>
                  </>
                )}
                {creative.country && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">{t(locale, 'creative.country')}</dt>
                    <dd className="text-sm text-gray-900">{creative.country}</dd>
                  </>
                )}
                {creative.language && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">{t(locale, 'creative.language')}</dt>
                    <dd className="text-sm text-gray-900">{creative.language}</dd>
                  </>
                )}
                {creative.goal && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">{t(locale, 'creative.goal')}</dt>
                    <dd className="text-sm text-gray-900">{creative.goal}</dd>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Sidebar */}
        <div className="space-y-6">
          {creative.status === 'processing' && (
            <Card>
              <CardContent className="p-6 text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-sm text-gray-600">{t(locale, 'analysis.analyzingCreative')}</p>
              </CardContent>
            </Card>
          )}

          {creative.status === 'done' && analysis && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t(locale, 'analysis.title')}</h2>
                
                {/* Scores */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{t(locale, 'creative.analysis.score')}</span>
                      <span className="font-semibold">{analysis.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${analysis.score}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{t(locale, 'creative.analysis.hookScore')}</span>
                      <span className="font-semibold">{analysis.hook_score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${analysis.hook_score}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{t(locale, 'creative.analysis.clarityScore')}</span>
                      <span className="font-semibold">{analysis.clarity_score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${analysis.clarity_score}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{t(locale, 'creative.analysis.complianceRisk')}</span>
                      <span className="font-semibold">{analysis.compliance_risk}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${analysis.compliance_risk > 50 ? 'bg-red-600' : analysis.compliance_risk > 25 ? 'bg-yellow-600' : 'bg-green-600'}`}
                        style={{ width: `${analysis.compliance_risk}%` }}
                      />
                    </div>
                  </div>
          </div>
          
                {/* Summary */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{t(locale, 'creative.analysis.summary')}</h3>
                  <p className="text-sm text-gray-600">{analysis.summary}</p>
          </div>

                {/* Strengths */}
                {analysis.strengths.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{t(locale, 'creative.analysis.strengths')}</h3>
                    <ul className="space-y-1">
                      {analysis.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Issues */}
                {analysis.issues.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{t(locale, 'creative.analysis.issues')}</h3>
                    <ul className="space-y-1">
                      {analysis.issues.map((issue, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">⚠</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fixes */}
                {analysis.fixes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{t(locale, 'creative.analysis.fixes')}</h3>
                    <ul className="space-y-1">
                      {analysis.fixes.map((fix, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">→</span>
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Hooks */}
                {analysis.hooks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{t(locale, 'creative.analysis.hooks')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.hooks.map((hook, idx) => (
                        <Badge key={idx} variant="blue">{hook}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTAs */}
                {analysis.ctas.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{t(locale, 'creative.analysis.ctas')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.ctas.map((cta, idx) => (
                        <Badge key={idx} variant="green">{cta}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Script */}
                {analysis.script_15s && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{t(locale, 'creative.analysis.script15s')}</h3>
                    <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {analysis.script_15s}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {creative.status === 'queued' && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-600 mb-4">{t(locale, 'analysis.readyToAnalyze')}</p>
                <Button variant="primary" onClick={handleAnalyze} disabled={analyzing}>
                  {analyzing ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" />
                      {t(locale, 'analysis.analyzing')}
                    </span>
                  ) : (
                    t(locale, 'analysis.startAnalysis')
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {creative.status === 'failed' && (
            <Card>
              <CardContent className="p-6">
                <Alert variant="error">
                  <p className="text-sm font-medium">{t(locale, 'analysis.failed')}</p>
                </Alert>
                <Button
                  variant="primary"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="mt-4 w-full"
                >
                  {analyzing ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" />
                      {t(locale, 'analysis.retrying')}
                    </span>
                  ) : (
                    t(locale, 'analysis.retryAnalysis')
                  )}
              </Button>
        </CardContent>
      </Card>
          )}
        </div>
      </div>
    </div>
  );
}
