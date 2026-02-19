import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { InteractiveGrid } from '@/components/interactive-grid';
import { getSiteSettings, type SiteSettings } from '@/lib/api';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  let siteName = 'Blog & Portfolio';
  let description = 'A modern blog and portfolio showcasing projects, thoughts, and creative work.';
  try {
    const settings = await getSiteSettings();
    siteName = settings.app_name || siteName;
    description = settings.app_subtitle || description;
  } catch {}
  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: ['blog', 'portfolio', 'developer', 'projects', 'programming'],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName,
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings: SiteSettings = {};
  try {
    settings = await getSiteSettings();
  } catch {}

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-[var(--background)] text-[var(--foreground)]">
        {/* Global interactive grid background */}
        <div className="fixed inset-0 z-0">
          <InteractiveGrid />
        </div>
        <Header settings={settings} />
        <main className="relative z-10 flex-1">{children}</main>
        <div className="relative z-10"><Footer /></div>
      </body>
    </html>
  );
}
