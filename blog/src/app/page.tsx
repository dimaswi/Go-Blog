import type { Metadata } from 'next';
import { getPublishedBlogs, getPublishedPortfolios, getSiteSettings, type Blog, type Portfolio, type SiteSettings } from '@/lib/api';
import { HomeContent } from './home-content';

const UPLOAD_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api').replace('/api', '');

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    const title = settings.home_meta_title || settings.app_name || 'Blog & Portfolio';
    const description = settings.home_meta_description || settings.app_subtitle || 'A modern blog and portfolio.';
    return {
      title,
      description,
      keywords: settings.home_meta_keywords,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: settings.app_name,
        images: settings.home_og_image ? [{ url: `${UPLOAD_URL}${settings.home_og_image}` }] : [],
      },
      twitter: { card: 'summary_large_image', title, description },
    };
  } catch {
    return { title: 'Blog & Portfolio' };
  }
}

export default async function HomePage() {
  let blogs: Blog[] = [];
  let portfolios: Portfolio[] = [];
  let settings: SiteSettings = {};

  try {
    const [blogsRes, portfoliosRes, settingsRes] = await Promise.all([
      getPublishedBlogs({ limit: 6 }),
      getPublishedPortfolios({ limit: 12 }),
      getSiteSettings(),
    ]);
    blogs = blogsRes.data || [];
    portfolios = portfoliosRes.data || [];
    settings = settingsRes || {};
  } catch (error) {
    console.error('Failed to fetch homepage data:', error);
  }

  return <HomeContent blogs={blogs} portfolios={portfolios} settings={settings} />;
}
