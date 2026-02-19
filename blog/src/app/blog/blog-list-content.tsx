'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Tag, FolderOpen } from 'lucide-react';
import { FadeInUp, StaggerContainer, PageTransition } from '@/components/motion';
import { BlogCard } from '@/components/blog-card';
import type { Blog, BlogCategory, BlogTag } from '@/lib/api';
import { cn } from '@/lib/utils';

interface BlogListContentProps {
  blogs: Blog[];
  total: number;
  page: number;
  limit: number;
  categories: BlogCategory[];
  tags: BlogTag[];
  currentCategory?: string;
  currentTag?: string;
  searchQuery?: string;
}

export function BlogListContent({
  blogs,
  total,
  page,
  limit,
  categories,
  tags,
  currentCategory,
  currentTag,
  searchQuery,
}: BlogListContentProps) {
  const router = useRouter();
  const totalPages = Math.ceil(total / limit);

  const clearFilters = () => {
    router.push('/blog');
  };

  const hasFilters = currentCategory || currentTag || searchQuery;

  return (
    <PageTransition>
      <div className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-6 ">
          {/* Header */}
          <FadeInUp>
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                The <span className="text-[var(--secondary)]">Blog</span>
              </h1>
              <p className="text-lg text-white/40">
                {total} article{total !== 1 ? 's' : ''} on development & technology
              </p>
            </div>
          </FadeInUp>

          {/* Category & Tag Filters */}
          <FadeInUp delay={0.1}>
            <div className="flex flex-wrap items-center gap-3 mb-10 pb-8 border-b border-white/5">
              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <FolderOpen className="w-4 h-4 text-white/20 shrink-0" />
                  <Link
                    href="/blog"
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-full font-medium transition-all',
                      !currentCategory
                        ? 'bg-[var(--primary)] text-black'
                        : 'bg-white/5 text-white/40 border border-white/10 hover:text-white hover:border-white/20'
                    )}
                  >
                    All
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/blog?category=${cat.slug}`}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-full font-medium transition-all',
                        currentCategory === cat.slug
                          ? 'bg-[var(--primary)] text-black'
                          : 'bg-white/5 text-white/40 border border-white/10 hover:text-white hover:border-white/20'
                      )}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-white/20 shrink-0" />
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/blog?tag=${tag.slug}`}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-full font-medium transition-all',
                        currentTag === tag.slug
                          ? 'bg-[var(--secondary)] text-white'
                          : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                      )}
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </FadeInUp>

          {/* Blog Grid */}
          {blogs.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog, i) => (
                <BlogCard key={blog.id} blog={blog} index={i} featured={i === 0 && page === 1 && !hasFilters} />
              ))}
            </StaggerContainer>
          ) : (
            <FadeInUp>
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p className="text-white/40 mb-4">
                  {hasFilters ? 'Try adjusting your filters.' : 'No posts published yet.'}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-sm font-medium text-[var(--primary)] hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            </FadeInUp>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <FadeInUp>
              <div className="flex items-center justify-center gap-2 mt-12">
                {page > 1 && (
                  <Link
                    href={`/blog?page=${page - 1}${currentCategory ? `&category=${currentCategory}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                    className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/blog?page=${p}${currentCategory ? `&category=${currentCategory}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                    className={cn(
                      'w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all',
                      p === page
                        ? 'bg-[var(--primary)] text-black'
                        : 'border border-white/10 hover:bg-white/5 text-white/40'
                    )}
                  >
                    {p}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link
                    href={`/blog?page=${page + 1}${currentCategory ? `&category=${currentCategory}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                    className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </FadeInUp>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
