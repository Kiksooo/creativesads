'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Locale, t, locales } from '@/lib/i18n/messages';
import { getToken, clearToken } from '@/src/lib/auth';

interface NavigationProps {
  locale: Locale;
  currentPath: string;
}

export default function Navigation({ locale, currentPath }: NavigationProps) {
  const router = useRouter();
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
  let pathWithoutLocale = currentPath.replace(`/${locale}`, '');
  if (pathWithoutLocale === '') {
    pathWithoutLocale = '/';
  }

  if (!mounted) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href={`/${locale}`}
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Creo App
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                href={`/${locale}`}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {t(locale, 'nav.home')}
              </Link>
              {token ? (
                <Link
                  href={`/${locale}/app`}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  {t(locale, 'nav.dashboard')}
                </Link>
              ) : (
                <>
                  <Link
                    href={`/${locale}/login`}
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href={`/${locale}/register`}
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    {t(locale, 'nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {token ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
            )}
            
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
              {locales.map((loc) => (
                <Link
                  key={loc}
                  href={`/${loc}${pathWithoutLocale}`}
                  className={`
                    px-3 py-1 rounded-md text-sm font-medium transition-colors
                    ${locale === loc
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
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
    </nav>
  );
}

