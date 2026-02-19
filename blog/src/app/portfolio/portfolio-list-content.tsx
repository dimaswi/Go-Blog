'use client';

import { useRouter } from 'next/navigation';
import { FadeInUp, StaggerContainer, PageTransition } from '@/components/motion';
import { PortfolioCard } from '@/components/portfolio-card';
import { Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { type Portfolio, type PortfolioCategory } from '@/lib/api';
import { cn } from '@/lib/utils';

interface PortfolioListContentProps {
  portfolios: Portfolio[];
  categories: PortfolioCategory[];
  totalPages: number;
  currentPage: number;
  currentCategory: string;
}

export function PortfolioListContent({
  portfolios,
  categories,
  totalPages,
  currentPage,
  currentCategory,
}: PortfolioListContentProps) {
  const router = useRouter();

  const buildUrl = (params: Record<string, string | number>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, String(value));
    });
    const query = searchParams.toString();
    return `/portfolio${query ? `?${query}` : ''}`;
  };

  const handleCategoryChange = (category: string) => {
    router.push(buildUrl({ category, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ category: currentCategory, page }));
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-6 ">
          {/* Header */}
          <FadeInUp>
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                My <span className="text-[var(--primary)]">Projects</span>
              </h1>
              <p className="text-lg text-white/40">
                Web apps, tools, and experiments I&apos;ve built.
              </p>
            </div>
          </FadeInUp>

          {/* Category Filters */}
          <FadeInUp delay={0.05}>
            <div className="flex items-center gap-2 flex-wrap mb-10 pb-8 border-b border-white/5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    currentCategory === cat.slug
                      ? 'bg-[var(--primary)] text-black'
                      : 'bg-white/5 text-white/40 border border-white/10 hover:text-white hover:border-white/20'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </FadeInUp>

          {/* Portfolio Grid */}
          {portfolios.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio, i) => (
                <PortfolioCard key={portfolio.id} portfolio={portfolio} index={i} />
              ))}
            </StaggerContainer>
          ) : (
            <FadeInUp>
              <div className="text-center py-20">
                <Briefcase className="w-12 h-12 mx-auto text-white/10 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                <p className="text-white/40">
                  {currentCategory ? 'Try a different category.' : 'Projects coming soon.'}
                </p>
              </div>
            </FadeInUp>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <FadeInUp>
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-full border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      'w-10 h-10 rounded-full text-sm font-medium transition-all',
                      page === currentPage
                        ? 'bg-[var(--primary)] text-black'
                        : 'border border-white/10 hover:bg-white/5 text-white/40'
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-full border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </FadeInUp>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
