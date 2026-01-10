'use client';

import { ReactNode } from 'react';
import { type Locale } from '@/lib/i18n/messages';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AppShellProps {
  children: ReactNode;
  locale: Locale;
}

export default function AppShell({ children, locale }: AppShellProps) {
  return (
    <div className="flex h-screen bg-gray-50 relative z-10">
      {/* Sidebar - Desktop */}
      <Sidebar locale={locale} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* TopBar */}
        <TopBar locale={locale} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}

