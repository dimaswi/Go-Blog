'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Github, ExternalLink } from 'lucide-react';
import { getImageUrl, type Portfolio } from '@/lib/api';

interface PortfolioCardProps {
  portfolio: Portfolio;
  index?: number;
}

export function PortfolioCard({ portfolio, index = 0 }: PortfolioCardProps) {
  let techList: string[] = [];
  try {
    techList = portfolio.tech_stack ? JSON.parse(portfolio.tech_stack) : [];
  } catch {
    techList = portfolio.tech_stack ? portfolio.tech_stack.split(',').map(s => s.trim()) : [];
  }

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <div className="h-full rounded-xl bg-[var(--card)] border border-white/5 hover:border-[var(--primary)]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.1)] overflow-hidden">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-[var(--muted)]">
          <Link href={`/portfolio/${portfolio.slug}`} className="absolute inset-0 z-10" />
          {portfolio.featured_image ? (
            <Image
              src={getImageUrl(portfolio.featured_image)}
              alt={portfolio.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5">
              <span className="text-4xl font-bold text-white/10">{portfolio.title.charAt(0)}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick action buttons on hover */}
          <div className="absolute bottom-3 right-3 flex gap-2 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            {portfolio.project_url && (
              <a
                href={portfolio.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-all"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {portfolio.github_url && (
              <a
                href={portfolio.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
          </div>

          {portfolio.category && (
            <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 backdrop-blur-sm">
              {portfolio.category.name}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <Link href={`/portfolio/${portfolio.slug}`}>
            <h3 className="font-semibold text-base mb-2 group-hover:text-[var(--primary)] transition-colors flex items-center gap-1.5">
              {portfolio.title}
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
          </Link>

          {portfolio.description && (
            <p className="text-sm text-white/40 line-clamp-2 mb-4 leading-relaxed">
              {portfolio.description}
            </p>
          )}

          {/* Tech Stack Badges */}
          {techList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {techList.slice(0, 4).map((tech, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 text-[11px] rounded-full bg-[var(--primary)]/5 border border-[var(--primary)]/20 text-[var(--primary)]/80 font-medium"
                >
                  {tech}
                </span>
              ))}
              {techList.length > 4 && (
                <span className="px-2.5 py-0.5 text-[11px] rounded-full bg-white/5 text-white/30 border border-white/10">
                  +{techList.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
