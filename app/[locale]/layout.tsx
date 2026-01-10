import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isValidLocale, type Locale } from '@/lib/i18n/messages';
import AppHeader from '@/src/components/AppHeader';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: 'Creo App - Creative Analytics',
    description: 'Upload → Analyze → Export your creative content',
    openGraph: {
      title: 'Creo App - Creative Analytics',
      description: 'Upload → Analyze → Export your creative content',
      type: 'website',
      locale: locale === 'ru' ? 'ru_RU' : locale === 'es' ? 'es_ES' : 'en_US',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader locale={locale} />
      <main className="flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}

