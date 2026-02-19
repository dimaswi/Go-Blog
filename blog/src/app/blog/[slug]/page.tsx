import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogBySlug, getPublishedBlogs, type Blog } from '@/lib/api';
import { BlogDetailContent } from './blog-detail-content';

interface BlogDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  try {
    const { data: blog } = await getBlogBySlug(params.slug);
    return {
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.excerpt,
      keywords: blog.meta_keywords?.split(',').map((k: string) => k.trim()),
      openGraph: {
        title: blog.meta_title || blog.title,
        description: blog.meta_description || blog.excerpt,
        type: 'article',
        publishedTime: blog.published_at,
        modifiedTime: blog.updated_at,
        authors: [blog.author?.full_name || 'Author'],
        images: blog.og_image || blog.featured_image
          ? [{ url: blog.og_image || blog.featured_image, width: 1200, height: 630 }]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.meta_title || blog.title,
        description: blog.meta_description || blog.excerpt,
      },
    };
  } catch {
    return { title: 'Blog Post Not Found' };
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  let blog: Blog | null = null;
  let relatedBlogs: Blog[] = [];

  try {
    const res = await getBlogBySlug(params.slug);
    blog = res.data;
  } catch {
    notFound();
  }

  if (!blog) notFound();

  // Fetch related blogs (same category)
  try {
    if (blog.category?.slug) {
      const res = await getPublishedBlogs({ limit: 3, category: blog.category.slug });
      relatedBlogs = (res.data || []).filter((b) => b.id !== blog.id).slice(0, 2);
    }
  } catch {}

  return <BlogDetailContent blog={blog} relatedBlogs={relatedBlogs} />;
}
