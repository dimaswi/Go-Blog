'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Calendar, Clock, Eye, User, Tag, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { FadeInUp, FadeIn, PageTransition } from '@/components/motion';
import { BlogCard } from '@/components/blog-card';
import { formatDate, readingTime } from '@/lib/utils';
import { getImageUrl, type Blog } from '@/lib/api';
import { useState } from 'react';

interface BlogDetailContentProps {
  blog: Blog;
  relatedBlogs: Blog[];
}

export function BlogDetailContent({ blog, relatedBlogs }: BlogDetailContentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(blog.title);

  return (
    <PageTransition>
      <article className="min-h-screen">
        {/* Back link + Meta */}
        <div className="container mx-auto px-6 pt-28 pb-8">
          <FadeIn>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-[var(--primary)] transition-colors mb-8"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </FadeIn>

          {/* Category + Meta */}
          <FadeInUp delay={0.05}>
            <div className="flex items-center gap-3 text-sm font-mono text-[var(--secondary)] mb-4">
              {blog.category && (
                <Link href={`/blog?category=${blog.category.slug}`} className="hover:underline">
                  {blog.category.name}
                </Link>
              )}
              {blog.category && <span className="text-white/20">·</span>}
              <span className="text-white/30">{formatDate(blog.published_at || blog.created_at)}</span>
              <span className="text-white/20">·</span>
              <span className="text-white/30">{readingTime(blog.content)}</span>
              {blog.view_count > 0 && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-white/30 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {blog.view_count}</span>
                </>
              )}
            </div>
          </FadeInUp>

          {/* Title */}
          <FadeInUp delay={0.1}>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              {blog.title}
            </h1>
          </FadeInUp>

          {/* Excerpt */}
          {blog.excerpt && (
            <FadeInUp delay={0.15}>
              <p className="text-lg text-white/40 leading-relaxed mb-6">
                {blog.excerpt}
              </p>
            </FadeInUp>
          )}

          {/* Author + Share */}
          <FadeInUp delay={0.2}>
            <div className="flex items-center justify-between pb-8 border-b border-white/10">
              {blog.author && (
                <div className="flex items-center gap-3">
                  {blog.author.avatar ? (
                    <Image
                      src={getImageUrl(blog.author.avatar)}
                      alt={blog.author.full_name}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white/60">{blog.author.full_name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{blog.author.full_name}</p>
                    <p className="text-xs text-white/30">Author</p>
                  </div>
                </div>
              )}

              {/* Share buttons */}
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-[var(--primary)]/30 hover:text-[var(--primary)] transition-all text-white/40"
                  title="Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-[var(--primary)]/30 hover:text-[var(--primary)] transition-all text-white/40"
                  title="Twitter"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-[var(--primary)]/30 hover:text-[var(--primary)] transition-all text-white/40"
                  title="LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-[var(--primary)]/30 hover:text-[var(--primary)] transition-all text-white/40"
                  title="Copy link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </FadeInUp>
        </div>

        {/* Featured Image */}
        {blog.featured_image && (
          <FadeInUp delay={0.1}>
            <div className="container mx-auto px-6 max-w-5xl mb-10">
              <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-[var(--muted)]">
                <Image
                  src={getImageUrl(blog.featured_image)}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Content */}
        <div className="container mx-auto px-6 pb-12">
          <FadeInUp delay={0.15}>
            <div
              className="prose prose-lg prose-invert max-w-none
                prose-headings:font-semibold prose-headings:tracking-tight
                prose-a:text-[var(--primary)] prose-a:underline prose-a:underline-offset-3 prose-a:decoration-[var(--primary)]/30 hover:prose-a:decoration-[var(--primary)]
                prose-img:rounded-xl
                prose-code:text-[var(--primary)] prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-[#0d0d15] prose-pre:rounded-xl prose-pre:border prose-pre:border-white/5
                prose-blockquote:border-[var(--primary)] prose-blockquote:bg-[var(--primary)]/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:not-italic"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </FadeInUp>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <FadeInUp delay={0.1}>
              <div className="flex items-center gap-2 flex-wrap mt-12 pt-8 border-t border-white/10">
                <Tag className="w-4 h-4 text-white/20" />
                {blog.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="px-3 py-1 text-xs rounded-full bg-[var(--secondary)]/5 text-[var(--secondary)]/60 border border-[var(--secondary)]/10 hover:bg-[var(--secondary)]/10 hover:text-[var(--secondary)] transition-all"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </FadeInUp>
          )}
        </div>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <section className="border-t border-white/5 py-16">
            <div className="container mx-auto px-6 ">
              <FadeInUp>
                <h2 className="text-2xl font-bold mb-8">
                  Related <span className="text-[var(--secondary)]">Articles</span>
                </h2>
              </FadeInUp>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedBlogs.map((relBlog, i) => (
                  <FadeInUp key={relBlog.id} delay={i * 0.05}>
                    <BlogCard blog={relBlog} />
                  </FadeInUp>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </PageTransition>
  );
}
