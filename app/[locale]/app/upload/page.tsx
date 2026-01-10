'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { isValidLocale, t } from '@/lib/i18n/messages';
import { notFound } from 'next/navigation';
import { apiUpload, apiPost } from '@/src/lib/api';
import { clearToken } from '@/src/lib/auth';
import UploadDropzone from '@/src/components/UploadDropzone';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import { Card, CardContent } from '@/src/components/ui/Card';
import Alert from '@/src/components/ui/Alert';
import Spinner from '@/src/components/ui/Spinner';
import EmptyState from '@/src/components/EmptyState';

type UploadState = 'idle' | 'uploading' | 'processing' | 'error';

export default function UploadPage() {
  const params = useParams();
  const locale = params.locale as string;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const [file, setFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState('');
  const [geo, setGeo] = useState('');
  const [language, setLanguage] = useState('');
  const [vertical, setVertical] = useState('');
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setState('uploading');
    setError(null);
    setUploadProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      if (platform) formData.append('platform', platform);
      if (geo) formData.append('geo', geo);
      if (language) formData.append('language', language);
      if (vertical) formData.append('vertical', vertical);

      // Upload file
      const uploadResponse = await apiUpload<{ id?: string; creative?: { id?: string } }>(
        '/creatives/upload',
        formData
      );

      if (uploadResponse.status === 401) {
        clearToken();
        setSessionExpired(true);
        setState('error');
        return;
      }

      if (uploadResponse.error) {
        setError(uploadResponse.error);
        setState('error');
        return;
      }

      // Extract creative ID from different response formats
      const data = uploadResponse.data;
      const creativeId = data?.id || data?.creative?.id;

      if (!creativeId) {
        setError('Upload succeeded but no creative ID received');
        setState('error');
        return;
      }

      setUploadProgress(100);
      setState('processing');

      // Start processing
      const processResponse = await apiPost<{ success?: boolean }>(
        `/creatives/${creativeId}/process`,
        { mode: 'full' }
      );

      if (processResponse.status === 401) {
        clearToken();
        setSessionExpired(true);
        setState('error');
        return;
      }

      if (processResponse.error) {
        // Even if process fails, redirect to detail page
        console.warn('Process failed:', processResponse.error);
      }

      // Redirect to detail page
      window.location.href = `/${locale}/app/creatives/${creativeId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setState('error');
    }
  };

  if (sessionExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <EmptyState
          title={t(locale, 'auth.sessionExpired')}
          description="Please register again to continue."
          actionLabel={t(locale, 'auth.registerNow')}
          actionHref={`/${locale}/register`}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t(locale, 'nav.upload')}
        </h1>
        <p className="text-gray-600">Upload a video or image to get started</p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg relative z-10">
        <CardContent className="p-6 md:p-8 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File *
            </label>
            <UploadDropzone
              onFileSelect={setFile}
              selectedFile={file}
              disabled={state === 'uploading' || state === 'processing'}
            />
          </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            label="Platform (optional)"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="e.g. TikTok, Instagram"
            disabled={state === 'uploading' || state === 'processing'}
          />
          <Input
            type="text"
            label="Geo (optional)"
            value={geo}
            onChange={(e) => setGeo(e.target.value)}
            placeholder="e.g. US, UK"
            disabled={state === 'uploading' || state === 'processing'}
          />
          <Input
            type="text"
            label="Language (optional)"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="e.g. en, ru"
            disabled={state === 'uploading' || state === 'processing'}
          />
          <Input
            type="text"
            label="Vertical (optional)"
            value={vertical}
            onChange={(e) => setVertical(e.target.value)}
            placeholder="e.g. Fashion, Tech"
            disabled={state === 'uploading' || state === 'processing'}
          />
        </div>

          {/* Progress */}
          {state === 'uploading' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-black h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {state === 'processing' && (
            <div className="flex items-center gap-3 text-gray-700">
              <Spinner size="sm" />
              <span className="font-medium">Processing creative...</span>
            </div>
          )}

          {/* Error */}
          {error && state === 'error' && (
            <Alert variant="error">
              <p className="text-sm font-medium">{error}</p>
            </Alert>
          )}

          {/* Upload Button */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleUpload}
              disabled={!file || state === 'uploading' || state === 'processing'}
              className="flex-1"
            >
              {state === 'uploading' ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Uploading...
                </span>
              ) : state === 'processing' ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Processing...
                </span>
              ) : (
                t(locale, 'nav.upload')
              )}
            </Button>
            {(state === 'error' || state === 'idle') && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setFile(null);
                  setError(null);
                  setState('idle');
                  setUploadProgress(0);
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

