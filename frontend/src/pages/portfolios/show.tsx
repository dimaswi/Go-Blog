import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { portfoliosApi, BASE_URL, type Portfolio } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, ExternalLink, Github, Calendar, X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { setPageTitle } from '@/lib/page-title';

export default function PortfolioShow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    setPageTitle('Portfolio Detail');
    portfoliosApi.getById(Number(id))
      .then(res => setPortfolio(res.data.data))
      .catch(() => toast({ variant: "destructive", title: "Error!", description: "Failed to load portfolio." }))
      .finally(() => setLoading(false));
  }, [id]);

  const galleryImages: string[] = (() => { try { return JSON.parse(portfolio?.images || '[]'); } catch { return []; } })();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIdx === null || !galleryImages.length) return;
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx(i => i! < galleryImages.length - 1 ? i! + 1 : 0);
      if (e.key === 'ArrowLeft') setLightboxIdx(i => i! > 0 ? i! - 1 : galleryImages.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx]);

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!portfolio) return null;

  let techStack: string[] = [];
  try { techStack = JSON.parse(portfolio.tech_stack || '[]'); } catch { }

  const imgSrc = (url: string) => url.startsWith('http') ? url : `${BASE_URL}${url}`;

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/portfolios')} className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-base font-semibold">{portfolio.title}</h2>
          <p className="text-sm text-muted-foreground">/{portfolio.slug}</p>
        </div>
        <Badge variant={portfolio.status === 'published' ? 'default' : 'secondary'}>{portfolio.status}</Badge>
        <Button onClick={() => navigate(`/portfolios/${id}/edit`)} size="sm">Edit</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main */}
        <div className="md:col-span-2 space-y-4">
          {portfolio.featured_image && (
            <img src={imgSrc(portfolio.featured_image)}
              alt={portfolio.title} className="w-full h-56 object-cover rounded-lg border" />
          )}
          {portfolio.description && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-sm text-muted-foreground">{portfolio.description}</p>
            </div>
          )}
          {portfolio.content && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Content</p>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">{portfolio.content}</div>
            </div>
          )}

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Images className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Gallery</h3>
                <span className="text-xs text-muted-foreground">({galleryImages.length} images)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.map((url, i) => (
                  <button key={i} onClick={() => setLightboxIdx(i)}
                    className="group relative aspect-video rounded-md overflow-hidden border hover:border-primary focus:outline-none transition-colors">
                    <img src={imgSrc(url)} alt={`Screenshot ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold">Details</h3>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(portfolio.created_at).toLocaleDateString()}</span>
            </div>
            {portfolio.category && (
              <div className="text-sm">
                <span className="text-muted-foreground">Category: </span>
                <Badge variant="outline">{portfolio.category.name}</Badge>
              </div>
            )}
            {portfolio.project_url && (
              <a href={portfolio.project_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="h-4 w-4" /> Live Demo
              </a>
            )}
            {portfolio.github_url && (
              <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Github className="h-4 w-4" /> Source Code
              </a>
            )}
          </div>
          {techStack.length > 0 && (
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold">Tech Stack</h3>
              <div className="flex flex-wrap gap-1">
                {techStack.map((tech, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                ))}
              </div>
            </div>
          )}
          {(portfolio.meta_title || portfolio.meta_description) && (
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold">SEO Info</h3>
              {portfolio.meta_title && <p className="text-xs"><strong>Title:</strong> {portfolio.meta_title}</p>}
              {portfolio.meta_description && <p className="text-xs"><strong>Description:</strong> {portfolio.meta_description}</p>}
              {portfolio.meta_keywords && <p className="text-xs"><strong>Keywords:</strong> {portfolio.meta_keywords}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIdx(null)}>
          {/* Close */}
          <button onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
            <X className="h-5 w-5" />
          </button>
          {/* Prev */}
          {galleryImages.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => i! > 0 ? i! - 1 : galleryImages.length - 1); }}
              className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {/* Image */}
          <div onClick={e => e.stopPropagation()}
            className="max-w-5xl max-h-[85vh] w-full mx-16 flex flex-col items-center gap-3">
            <img src={imgSrc(galleryImages[lightboxIdx])}
              alt={`Screenshot ${lightboxIdx + 1}`}
              className="max-h-[78vh] max-w-full object-contain rounded-lg shadow-2xl" />
            <p className="text-white/50 text-xs">{lightboxIdx + 1} / {galleryImages.length}</p>
          </div>
          {/* Next */}
          {galleryImages.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => i! < galleryImages.length - 1 ? i! + 1 : 0); }}
              className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
