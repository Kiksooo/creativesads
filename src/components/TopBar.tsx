'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type Locale, locales, t } from '@/lib/i18n/messages';
import Button from './ui/Button';

interface TopBarProps {
  locale: Locale;
}

export default function TopBar({ locale }: TopBarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  // Extract path without locale
  let pathWithoutLocale = pathname?.replace(`/${locale}`, '') || '/';
  if (pathWithoutLocale === '') {
    pathWithoutLocale = '/';
  }

  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-50 relative">
      {/* Mobile: Show menu button or logo */}
      <div className="md:hidden">
        <Link href={`/${locale}/app`} className="text-lg font-bold text-gray-900">
          Creo
        </Link>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(locale, 'common.search')}
            className="block w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all sm:text-sm relative z-10"
          />
        </div>
      </div>

      {/* Upload Button */}
      <Link href={`/${locale}/app/upload`} className="relative z-10">
        <Button variant="primary" size="sm" className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">{t(locale, 'common.upload')}</span>
        </Button>
      </Link>

      {/* Language Switch */}
      <div className="flex items-center gap-1 border-l border-gray-200 pl-3 md:pl-4 relative z-10">
        {locales.map((loc) => (
          <Link
            key={loc}
            href={`/${loc}${pathWithoutLocale}`}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
              locale === loc
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            {loc.toUpperCase()}
          </Link>
        ))}
      </div>
    </header>
  );
}

