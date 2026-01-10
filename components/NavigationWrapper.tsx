'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import { Locale } from '@/lib/i18n/messages';

interface NavigationWrapperProps {
  locale: Locale;
}

export default function NavigationWrapper({ locale }: NavigationWrapperProps) {
  const pathname = usePathname();

  return <Navigation locale={locale} currentPath={pathname} />;
}

