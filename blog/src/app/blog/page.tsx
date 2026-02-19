import { Metadata } from 'next';
import { getPublishedBlogs, getBlogCategories, getBlogTags, type Blog, type BlogCategory, type BlogTag } from '@/lib/api';
import { BlogListContent } from './blog-list-content';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest articles about development, technology, and design.',
  openGraph: {
    title: 'Blog | Blog & Portfolio',
    description: 'Read our latest articles about development, technology, and design.',
  },
};

interface BlogPageProps {
  searchParams: { page?: string; category?: string; tag?: string; search?: string };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = Number(searchParams.page) || 1;

  let blogs: Blog[] = [];
  let total = 0;
  let categories: BlogCategory[] = [];
  let tags: BlogTag[] = [];

  try {
    const [blogsRes, categoriesRes, tagsRes] = await Promise.all([
      getPublishedBlogs({
        page,
        limit: 9,
        category: searchParams.category,
        tag: searchParams.tag,
        search: searchParams.search,
      }),
      getBlogCategories(),
      getBlogTags(),
    ]);
    blogs = blogsRes.data || [];
    total = blogsRes.total || 0;
    categories = categoriesRes.data || [];
    tags = tagsRes.data || [];
  } catch (error) {
    console.error('Failed to fetch blog data:', error);
  }

  return (
    <BlogListContent
      blogs={blogs}
      total={total}
      page={page}
      limit={9}
      categories={categories}
      tags={tags}
      currentCategory={searchParams.category}
      currentTag={searchParams.tag}
      searchQuery={searchParams.search}
    />
  );
}
