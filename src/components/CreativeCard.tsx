import Link from 'next/link';
import StatusPill from './StatusPill';
import { t, type Locale, isValidLocale } from '@/lib/i18n/messages';

export interface Creative {
  id: string;
  name?: string;
  title?: string;
  thumbnail?: string;
  status?: string;
  hook?: string;
  angle?: string;
  format?: string;
  workspace_id?: string;
  [key: string]: unknown;
}

interface CreativeCardProps {
  creative: Creative;
  locale: string;
}

export default function CreativeCard({ creative, locale }: CreativeCardProps) {
  const localeValid: Locale = isValidLocale(locale) ? locale : 'en';
  const name = creative.name || creative.title || t(localeValid, 'creative.untitled');
  const thumbnail = creative.thumbnail;
  const status = creative.status || 'draft';

  return (
    <Link
      href={`/${locale}/app/creatives/${creative.id}`}
      className="block bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200 group relative z-10"
    >
      {thumbnail ? (
        <div className="aspect-video bg-gray-100 overflow-hidden rounded-t-2xl">
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center rounded-t-2xl">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <StatusPill status={status} />
        </div>
        {(creative.hook || creative.angle || creative.format) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {creative.hook && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 shadow-sm">
                {creative.hook}
              </span>
            )}
            {creative.angle && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-purple-50 text-purple-700 shadow-sm">
                {creative.angle}
              </span>
            )}
            {creative.format && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-green-50 text-green-700 shadow-sm">
                {creative.format}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

