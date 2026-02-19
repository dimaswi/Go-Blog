import { cache } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
export const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:8080';

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  status: string;
  author_id: number;
  author?: {
    id: number;
    full_name: string;
    username: string;
    avatar?: string;
  };
  category_id?: number;
  category?: BlogCategory;
  tags?: BlogTag[];
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  published_at?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface Portfolio {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  featured_image: string;
  images: string;
  project_url: string;
  github_url: string;
  tech_stack: string;
  category_id?: number;
  category?: PortfolioCategory;
  status: string;
  sort_order: number;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface SiteSettings {
  app_name?: string;
  app_subtitle?: string;
  app_logo?: string;
  app_favicon?: string;
  contact_email?: string;
  contact_location?: string;
  contact_location_detail?: string;
  social_github?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_instagram?: string;
  home_meta_title?: string;
  home_meta_description?: string;
  home_meta_keywords?: string;
  home_og_image?: string;
  home_hero_title?: string;
  home_hero_subtitle?: string;
  home_hero_description?: string;
  home_hero_badge?: string;
  [key: string]: string | undefined;
}

// ============ Fetch Functions ============

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    cache: 'no-store',
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

// Blog API
export async function getPublishedBlogs(params?: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
}): Promise<{ data: Blog[]; total: number; page: number; limit: number; total_pages: number }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  return fetchAPI(`/public/blogs${query ? `?${query}` : ''}`);
}

export async function getBlogBySlug(slug: string): Promise<{ data: Blog }> {
  return fetchAPI(`/public/blogs/${slug}`, { cache: 'no-store' });
}

export async function getBlogCategories(): Promise<{ data: BlogCategory[] }> {
  return fetchAPI('/public/blog-categories');
}

export async function getBlogTags(): Promise<{ data: BlogTag[] }> {
  return fetchAPI('/public/blog-tags');
}

// Portfolio API
export async function getPublishedPortfolios(params?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<{ data: Portfolio[]; total: number; page: number; limit: number; total_pages: number }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.category) searchParams.set('category', params.category);

  const query = searchParams.toString();
  return fetchAPI(`/public/portfolios${query ? `?${query}` : ''}`);
}

export async function getPortfolioBySlug(slug: string): Promise<{ data: Portfolio }> {
  return fetchAPI(`/public/portfolios/${slug}`, { cache: 'no-store' });
}

export async function getPortfolioCategories(): Promise<{ data: PortfolioCategory[] }> {
  return fetchAPI('/public/portfolio-categories');
}

// Settings API — wrapped in React cache() to deduplicate calls within a single render
// (layout + page both call this; only 1 HTTP request is made per request cycle)
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const res = await fetchAPI<{ data: SiteSettings }>('/settings');
  return res.data;
});

// Helper
export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${UPLOAD_URL}${path}`;
}
