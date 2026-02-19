'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ExternalLink, Github, Calendar, Layers, Globe, Tag } from 'lucide-react';
import { FadeInUp, FadeIn, PageTransition } from '@/components/motion';
import { getImageUrl } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Portfolio {
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
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  status: string;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface PortfolioDetailContentProps {
  portfolio: Portfolio;
}

export function PortfolioDetailContent({ portfolio }: PortfolioDetailContentProps) {
  let techStack: string[] = [];
  try {
    techStack = JSON.parse(portfolio.tech_stack || '[]');
  } catch {
    techStack = portfolio.tech_stack ? portfolio.tech_stack.split(',').map((s) => s.trim()) : [];
  }

  let galleryImages: string[] = [];
  try {
    galleryImages = JSON.parse(portfolio.images || '[]');
  } catch {
    galleryImages = [];
  }

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || galleryImages.length <= 1) return;
    let frame: number;
    const step = () => {
      if (!pauseRef.current) {
        el.scrollLeft += 0.6;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) el.scrollLeft = 0;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [galleryImages.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIdx === null) return;
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx(i => i! < galleryImages.length - 1 ? i! + 1 : 0);
      if (e.key === 'ArrowLeft') setLightboxIdx(i => i! > 0 ? i! - 1 : galleryImages.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, galleryImages.length]);

  return (
    <>
    <PageTransition>
      <div className="min-h-screen">
        {/* Header */}
        <div className="container mx-auto px-6 max-w-5xl pt-28 pb-8">
          {/* Back link */}
          <FadeIn>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-[var(--primary)] transition-colors mb-8"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Back to Projects
            </Link>
          </FadeIn>

          {/* Category + Date */}
          <FadeInUp delay={0.05}>
            <div className="flex items-center gap-3 text-sm font-mono text-[var(--primary)] mb-4">
              {portfolio.category && (
                <Link href={`/portfolio?category=${portfolio.category.slug}`} className="hover:underline">
                  {portfolio.category.name}
                </Link>
              )}
              {portfolio.category && <span className="text-white/20">·</span>}
              <span className="text-white/50 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <time dateTime={portfolio.published_at || portfolio.created_at}>
                  {formatDate(portfolio.published_at || portfolio.created_at)}
                </time>
              </span>
            </div>
          </FadeInUp>

          {/* Title */}
          <FadeInUp delay={0.1}>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              {portfolio.title}
            </h1>
          </FadeInUp>

          {/* Description */}
          {portfolio.description && (
            <FadeInUp delay={0.15}>
              <p className="text-lg text-white/60 leading-relaxed mb-6 max-w-3xl">
                {portfolio.description}
              </p>
            </FadeInUp>
          )}

          {/* Action buttons + Tech Stack */}
          <FadeInUp delay={0.2}>
            <div className="flex flex-wrap items-center gap-3 pb-8 border-b border-white/10">
              {portfolio.project_url && (
                <a
                  href={portfolio.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${portfolio.title} live demo (opens in new tab)`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-black font-semibold text-sm hover:bg-[var(--primary)]/90 transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]"
                >
                  <Globe className="w-4 h-4" aria-hidden="true" />
                  Live Demo
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
              {portfolio.github_url && (
                <a
                  href={portfolio.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${portfolio.title} source code on GitHub (opens in new tab)`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  <Github className="w-4 h-4" aria-hidden="true" />
                  Source Code
                </a>
              )}
            </div>
          </FadeInUp>
        </div>

        {/* Featured Image — no animation wrapper so LCP image is visible immediately */}
        {portfolio.featured_image && (
          <div className="container mx-auto px-6 max-w-5xl mb-12">
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-[var(--muted)]">
              <Image
                src={getImageUrl(portfolio.featured_image)}
                alt={portfolio.title}
                fill
                className="object-cover"
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          </div>
        )}

        {/* Content + Sidebar */}
        <div className="container mx-auto px-6 max-w-5xl pb-16">
          <div className="grid lg:grid-cols-4 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <FadeInUp>
                <article
                  className="prose prose-lg prose-invert max-w-none
                    prose-headings:font-semibold prose-headings:tracking-tight
                    prose-a:text-[var(--primary)] prose-a:underline prose-a:underline-offset-3 prose-a:decoration-[var(--primary)]/30
                    prose-img:rounded-xl
                    prose-code:text-[var(--primary)] prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                    prose-pre:bg-[#0d0d15] prose-pre:rounded-xl prose-pre:border prose-pre:border-white/5"
                  dangerouslySetInnerHTML={{ __html: portfolio.content }}
                />
              </FadeInUp>

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div className="mt-12">
                  <FadeInUp>
                    <h2 className="text-2xl font-bold mb-6">
                      Screen<span className="text-[var(--primary)]">shots</span>
                    </h2>
                  </FadeInUp>

                  {/* Scrolling strip */}
                  <FadeInUp delay={0.05}>
                    <div
                      ref={scrollRef}
                      onMouseEnter={() => { pauseRef.current = true; }}
                      onMouseLeave={() => { pauseRef.current = false; }}
                      className="flex gap-4 overflow-x-auto scrollbar-none pb-2"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      {galleryImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setLightboxIdx(i)}
                          aria-label={`View ${portfolio.title} screenshot ${i + 1} fullscreen`}
                          className="relative flex-none w-72 aspect-video rounded-xl overflow-hidden bg-[var(--muted)] border border-white/5 hover:border-[var(--primary)]/50 transition-all group cursor-zoom-in"
                        >
                          <Image
                            src={getImageUrl(img)}
                            alt={`${portfolio.title} screenshot ${i + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-2" aria-hidden="true">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </FadeInUp>

                  {/* Dot indicators */}
                  {galleryImages.length > 1 && (
                    <div className="flex justify-center gap-2.5 mt-4" role="tablist" aria-label="Gallery navigation">
                      {galleryImages.map((_, i) => (
                        <button key={i} onClick={() => setLightboxIdx(i)}
                          aria-label={`Go to screenshot ${i + 1}`}
                          className="w-2 h-2 rounded-full bg-white/20 hover:bg-[var(--primary)] transition-colors" />
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Tech Stack */}
                {techStack.length > 0 && (
                  <FadeInUp delay={0.1}>
                    <div className="glass-panel p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4 flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                        Tech Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-xs rounded-full bg-[var(--primary)]/5 border border-[var(--primary)]/20 text-[var(--primary)]/80 font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </FadeInUp>
                )}

                {/* Project Info */}
                <FadeInUp delay={0.15}>
                  <div className="glass-panel p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Details</h3>
                    <dl className="space-y-3 text-sm">
                      {portfolio.category && (
                        <div>
                          <dt className="text-white/50 flex items-center gap-1.5 text-xs">
                            <Tag className="w-3 h-3" aria-hidden="true" /> Category
                          </dt>
                          <dd className="font-medium mt-0.5">{portfolio.category.name}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-white/50 flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3 h-3" aria-hidden="true" /> Published
                        </dt>
                        <dd className="font-medium mt-0.5 font-mono text-xs">
                          <time dateTime={portfolio.published_at || portfolio.created_at}>
                            {formatDate(portfolio.published_at || portfolio.created_at)}
                          </time>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </FadeInUp>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PageTransition>

      {/* Lightbox — rendered via portal to avoid parent transform breaking fixed positioning */}
      {lightboxIdx !== null && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Screenshot ${lightboxIdx! + 1} of ${galleryImages.length}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIdx(null)}
            aria-label="Close lightbox"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Prev */}
          {galleryImages.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i! > 0 ? i! - 1 : galleryImages.length - 1); }}
              aria-label="Previous screenshot"
              className="absolute left-5 p-3 rounded-full bg-white/10 hover:bg-[var(--primary)]/30 text-white transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6" aria-hidden="true" />
            </button>
          )}

          {/* Image */}
          <div
            onClick={e => e.stopPropagation()}
            className="max-w-5xl max-h-[88vh] w-full mx-20 flex flex-col items-center gap-3"
          >
            <div className="relative w-full" style={{ maxHeight: '80vh' }}>
              <img
                src={getImageUrl(galleryImages[lightboxIdx!])}
                alt={`${portfolio.title} screenshot ${lightboxIdx! + 1}`}
                className="max-h-[80vh] max-w-full mx-auto object-contain rounded-xl shadow-2xl block"
              />
            </div>
            <p className="text-white/40 text-sm font-mono">{lightboxIdx! + 1} / {galleryImages.length}</p>
          </div>

          {/* Next */}
          {galleryImages.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i! < galleryImages.length - 1 ? i! + 1 : 0); }}
              aria-label="Next screenshot"
              className="absolute right-5 p-3 rounded-full bg-white/10 hover:bg-[var(--primary)]/30 text-white transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6" aria-hidden="true" />
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
