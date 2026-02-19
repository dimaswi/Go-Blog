'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Clock, Eye, ArrowUpRight } from 'lucide-react';
import { formatDate, readingTime, cn } from '@/lib/utils';
import { getImageUrl, type Blog } from '@/lib/api';

interface BlogCardProps {
  blog: Blog;
  index?: number;
  featured?: boolean;
}

export function BlogCard({ blog, index = 0, featured = false }: BlogCardProps) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/blog/${blog.slug}`} className="block h-full">
        <div className={cn(
          'h-full rounded-2xl border border-white/5 bg-white/5 hover:border-[var(--secondary)]/50 hover:bg-white/10 transition-all duration-300 overflow-hidden',
          featured && 'md:col-span-2'
        )}>
          {/* Image */}
          <div className={cn(
            'relative overflow-hidden bg-[var(--muted)]',
            featured ? 'aspect-[16/9]' : 'aspect-[16/9]'
          )}>
            {blog.featured_image ? (
              <Image
                src={getImageUrl(blog.featured_image)}
                alt={blog.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5">
                <span className="text-4xl font-bold text-white/10">{blog.title.charAt(0)}</span>
              </div>
            )}
            {blog.category && (
              <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 backdrop-blur-sm">
                {blog.category.name}
              </span>
            )}
            {/* Hover arrow */}
            <div className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-md opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-white/30 font-mono mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {blog.published_at ? formatDate(blog.published_at) : formatDate(blog.created_at)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime(blog.content)}
              </span>
              {blog.view_count > 0 && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {blog.view_count}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h3 className={cn(
              'font-semibold leading-snug mb-2 group-hover:text-[var(--primary)] transition-colors',
              featured ? 'text-lg' : 'text-base'
            )}>
              {blog.title}
            </h3>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-white/40 text-sm leading-relaxed line-clamp-2 mb-4">
                {blog.excerpt}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-white/60">{blog.author?.full_name?.charAt(0) || 'A'}</span>
                </div>
                <span className="text-xs text-white/40">{blog.author?.full_name || 'Author'}</span>
              </div>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex gap-1.5">
                  {blog.tags.slice(0, 2).map((tag) => (
                    <span key={tag.id} className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--secondary)]/5 text-[var(--secondary)]/60 border border-[var(--secondary)]/10">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
