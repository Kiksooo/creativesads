import { notFound } from 'next/navigation';
import { isValidLocale } from '@/lib/i18n/messages';
import AppShell from '@/src/components/AppShell';
import AuthGuard from '@/src/components/AuthGuard';

export default async function AppLayout({
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
    <AuthGuard locale={locale}>
      <AppShell locale={locale}>{children}</AppShell>
    </AuthGuard>
  );
}

