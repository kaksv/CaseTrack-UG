import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://casetrackug.duckdns.org'),
  title: {
    default: 'CaseTrack UG — Follow your Local Council case',
    template: '%s · CaseTrack UG',
  },
  description:
    'A civic-tech prototype for tracking Local Council Court cases in Uganda. Register a case, follow a clear timeline, and see hearing dates and updates. Synthetic demo data only.',
  keywords: [
    'Uganda',
    'Local Council Court',
    'LC court',
    'case tracking',
    'civic tech',
    'Hack4Justice',
    'access to justice',
  ],
  openGraph: {
    title: 'CaseTrack UG — Follow your Local Council case',
    description:
      'From filing to decision: one clear, shared record for citizens and LC court officers. Independent Hack4Justice 2026 prototype.',
    type: 'website',
    locale: 'en_UG',
    siteName: 'CaseTrack UG',
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2A003A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-cream"
        >
          Skip to main content
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
