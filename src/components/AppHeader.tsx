'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Locale, t, locales } from '@/lib/i18n/messages';
import { getToken, clearToken } from '@/src/lib/auth';
import Button from './ui/Button';

interface AppHeaderProps {
  locale: Locale;
}

export default function AppHeader({ locale }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setToken(getToken());
  }, []);

  const handleLogout = () => {
    clearToken();
    setToken(null);
    router.push(`/${locale}/login`);
  };

  // Extract path without locale (handle root and nested paths)
  let pathWithoutLocale = pathname?.replace(`/${locale}`, '') || '/';
  if (pathWithoutLocale === '') {
    pathWithoutLocale = '/';
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center" />
      </header>
    );
  }

  const isAppRoute = pathname?.startsWith(`/${locale}/app`);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Nav */}
          <div className="flex items-center space-x-8">
            <Link
              href={`/${locale}`}
              className="text-xl font-bold text-gray-900 hover:text-black transition-colors"
            >
              Creo App
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href={`/${locale}`}
                className={`text-sm font-medium transition-colors ${
                  pathname === `/${locale}`
                    ? 'text-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {t(locale, 'nav.home')}
              </Link>
              
              {token && (
                <>
                  <Link
                    href={`/${locale}/app`}
                    className={`text-sm font-medium transition-colors ${
                      pathname?.startsWith(`/${locale}/app`) && !pathname?.includes('/upload')
                        ? 'text-black'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {t(locale, 'nav.dashboard')}
                  </Link>
                  <Link
                    href={`/${locale}/app/upload`}
                    className={`text-sm font-medium transition-colors ${
                      pathname?.includes('/upload')
                        ? 'text-black'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {t(locale, 'nav.upload')}
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right: Auth + Language */}
          <div className="flex items-center space-x-4">
            {token ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-sm"
              >
                Logout
              </Button>
            ) : (
              <>
                <Link href={`/${locale}/login`}>
                  <Button variant="ghost" size="sm" className="text-sm">
                    Login
                  </Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button variant="primary" size="sm" className="text-sm">
                    {t(locale, 'nav.register')}
                  </Button>
                </Link>
              </>
            )}

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 border-l border-gray-200 pl-4 ml-2">
              {locales.map((loc) => (
                <Link
                  key={loc}
                  href={`/${loc}${pathWithoutLocale}`}
                  className={`
                    px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                    ${locale === loc
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100'
                    }
                  `}
                >
                  {loc.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
