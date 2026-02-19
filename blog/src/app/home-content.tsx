'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Calendar, Clock, ExternalLink } from 'lucide-react';
import { FadeInUp, FadeIn } from '@/components/motion';
import { formatDate, readingTime } from '@/lib/utils';
import { getImageUrl, type Blog, type Portfolio, type SiteSettings } from '@/lib/api';
import { InteractiveGrid } from '@/components/interactive-grid';

interface HomeContentProps {
  blogs: Blog[];
  portfolios: Portfolio[];
  settings?: SiteSettings;
}

function PortfolioTrack({ portfolios }: { portfolios: Portfolio[] }) {
  // Duplicate for seamless infinite loop
  const items = [...portfolios, ...portfolios, ...portfolios];
  const baseSpeed = portfolios.length > 0 ? portfolios.length * 6 : 24;

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none" />

      <div
        className="flex gap-5 animate-marquee"
        style={{ width: 'max-content', '--marquee-duration': `${baseSpeed}s` } as React.CSSProperties}
      >
        {items.map((p, i) => (
          <Link
            key={`${p.id}-${i}`}
            href={`/portfolio/${p.slug}`}
            className="group relative flex-shrink-0 w-72 rounded-2xl overflow-hidden border border-white/5 bg-white/5 hover:border-[var(--primary)]/50 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative aspect-video bg-[var(--muted)] overflow-hidden">
              {p.featured_image ? (
                <Image
                  src={getImageUrl(p.featured_image)}
                  alt={p.title}
                  fill
                  sizes="288px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5">
                  <span className="text-3xl font-bold text-white/10">{p.title.charAt(0)}</span>
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="flex items-center gap-2 text-sm font-medium text-white">
                  View Project <ExternalLink className="w-4 h-4" />
                </span>
              </div>
            </div>
            {/* Info */}
            <div className="p-4">
              {p.category && (
                <span className="text-xs font-mono text-[var(--primary)] mb-1 block">{p.category.name}</span>
              )}
              <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                {p.title}
              </h3>
              {p.description && (
                <p className="text-xs text-white/40 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function HomeContent({ blogs, portfolios, settings }: HomeContentProps) {
  const contactEmail = settings?.contact_email || 'hello@example.com';
  const heroTitle = settings?.home_hero_title || 'Crafting Digital\nExperiences';
  const heroSubtitle = settings?.home_hero_subtitle || 'Available for freelance work';
  const heroDescription = settings?.home_hero_description || 'Sharing my journey in software development — projects, tutorials, and thoughts on modern technology.';
  const heroBadge = settings?.home_hero_badge || heroSubtitle;
  return (
    <div className="min-h-screen">
      {/* Hero Section - Centered with gradient blobs + InteractiveGrid */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Blobs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--secondary)]/20 rounded-full blur-[128px]" />

        <div className="relative z-10 container mx-auto px-6  text-center">
          <FadeIn delay={0.2}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-primary mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {heroBadge}
            </span>
          </FadeIn>

          <FadeInUp delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 gradient-text">
              {heroTitle.split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-10 max-w-2xl mx-auto">
              {heroDescription}
            </p>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--primary)] text-black font-semibold hover:bg-[var(--primary)]/90 transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]"
              >
                Read Blog <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                View Projects
              </Link>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Latest Articles */}
      {blogs.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-6 ">
            <FadeInUp>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Latest <span className="text-[var(--secondary)]">Articles</span>
                  </h2>
                  <p className="text-white/40">Thoughts and insights on development</p>
                </div>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-white/40 hover:text-[var(--primary)] transition-colors flex items-center gap-1.5"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeInUp>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog, i) => (
                <FadeInUp key={blog.id} delay={0.05 * i}>
                  <Link href={`/blog/${blog.slug}`} className="group block h-full">
                    <article className="h-full rounded-2xl border border-white/5 bg-white/5 hover:border-[var(--secondary)]/50 hover:bg-white/10 transition-all duration-300 overflow-hidden">
                      {/* Image */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--muted)]">
                        {blog.featured_image ? (
                          <Image
                            src={getImageUrl(blog.featured_image)}
                            alt={blog.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
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
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-3 text-xs text-white/30 font-mono mb-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(blog.published_at || blog.created_at)}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readingTime(blog.content)}</span>
                        </div>
                        <h3 className="text-lg font-semibold leading-snug mb-2 group-hover:text-[var(--primary)] transition-colors">
                          {blog.title}
                        </h3>
                        {blog.excerpt && (
                          <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                        )}
                      </div>
                    </article>
                  </Link>
                </FadeInUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects - Auto-scrolling Carousel */}
      {portfolios.length > 0 && (
        <section className="py-20 border-t border-white/5 overflow-hidden">
          <div className="container mx-auto px-6  mb-10">
            <FadeInUp>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Featured <span className="text-[var(--primary)]">Projects</span>
                  </h2>
                  <p className="text-white/40">Things I&apos;ve built and shipped</p>
                </div>
                <Link
                  href="/portfolio"
                  className="text-sm font-medium text-white/40 hover:text-[var(--primary)] transition-colors flex items-center gap-1.5"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeInUp>
          </div>

          {/* Infinite scrolling track — full viewport width */}
          <FadeInUp delay={0.1}>
            <PortfolioTrack portfolios={portfolios} />
          </FadeInUp>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 ">
          <FadeInUp>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--secondary)]/5 px-8 py-16 md:px-16 text-center">
              <div className="absolute inset-0">
                <InteractiveGrid />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                  Want to work together?
                </h2>
                <p className="text-white/40 text-lg mb-8 max-w-lg mx-auto">
                  Open to new projects, collaborations, and creative ideas.
                </p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--primary)] text-black font-semibold hover:bg-[var(--primary)]/90 transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]"
                >
                  Get in touch <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
}
