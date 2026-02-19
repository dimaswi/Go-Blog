import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPortfolioBySlug } from '@/lib/api';
import { PortfolioDetailContent } from './portfolio-detail-content';

interface PortfolioDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PortfolioDetailPageProps): Promise<Metadata> {
  try {
    const { data: portfolio } = await getPortfolioBySlug(params.slug);
    return {
      title: portfolio.meta_title || portfolio.title,
      description: portfolio.meta_description || portfolio.description,
      keywords: portfolio.meta_keywords?.split(',').map((k: string) => k.trim()),
      openGraph: {
        title: portfolio.meta_title || portfolio.title,
        description: portfolio.meta_description || portfolio.description,
        type: 'article',
        images: portfolio.og_image || portfolio.featured_image
          ? [{ url: portfolio.og_image || portfolio.featured_image, width: 1200, height: 630 }]
          : [],
      },
    };
  } catch {
    return { title: 'Project Not Found' };
  }
}

export default async function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  let portfolio;

  try {
    const res = await getPortfolioBySlug(params.slug);
    portfolio = res.data;
  } catch {
    notFound();
  }

  if (!portfolio) notFound();

  return <PortfolioDetailContent portfolio={portfolio} />;
}
