import { Metadata } from 'next';
import { getPublishedPortfolios, getPortfolioCategories, type Portfolio, type PortfolioCategory } from '@/lib/api';
import { PortfolioListContent } from './portfolio-list-content';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Explore my projects and work. Web applications, mobile apps, and more.',
};

interface PortfolioPageProps {
  searchParams: {
    page?: string;
    category?: string;
  };
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const page = parseInt(searchParams.page || '1');
  const category = searchParams.category || '';

  let portfolios: Portfolio[] = [];
  let totalPages = 1;
  let categories: PortfolioCategory[] = [];

  try {
    const res = await getPublishedPortfolios({ page, limit: 9, category });
    portfolios = res.data || [];
    totalPages = res.total_pages || 1;
  } catch {}

  try {
    const catRes = await getPortfolioCategories();
    categories = catRes.data || [];
  } catch {}

  return (
    <PortfolioListContent
      portfolios={portfolios}
      categories={categories}
      totalPages={totalPages}
      currentPage={page}
      currentCategory={category}
    />
  );
}
