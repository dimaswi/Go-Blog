import type { MetadataRoute } from 'next';
import { getPublishedBlogs, getPublishedPortfolios } from '@/lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:2220';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/portfolio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const res = await getPublishedBlogs({ limit: 1000 });
    blogPages = (res.data || []).map((blog) => ({
      url: `${BASE_URL}/blog/${blog.slug}`,
      lastModified: new Date(blog.updated_at || blog.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {}

  // Portfolio
  let portfolioPages: MetadataRoute.Sitemap = [];
  try {
    const res = await getPublishedPortfolios({ limit: 1000 });
    portfolioPages = (res.data || []).map((p) => ({
      url: `${BASE_URL}/portfolio/${p.slug}`,
      lastModified: new Date(p.updated_at || p.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {}

  return [...staticPages, ...blogPages, ...portfolioPages];
}
