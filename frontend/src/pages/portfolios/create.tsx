import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { portfoliosApi, portfolioCategoriesApi, BASE_URL, type PortfolioCategory } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { setPageTitle } from '@/lib/page-title';

export default function PortfolioCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', content: '', featured_image: '',
    images: '', project_url: '', github_url: '', tech_stack: '',
    category_id: '', status: 'published', sort_order: 0,
    meta_title: '', meta_description: '', meta_keywords: '', og_image: '',
  });

  useEffect(() => {
    setPageTitle('Create Portfolio');
    portfolioCategoriesApi.getAll().then(res => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (value: string) => {
    setFormData({ ...formData, title: value, slug: generateSlug(value), meta_title: formData.meta_title || value });
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const res = await portfolioCategoriesApi.create({ name: newCatName.trim(), slug: generateSlug(newCatName.trim()), description: '' });
      const created: PortfolioCategory = res.data.data;
      setCategories((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, category_id: String(created.id) }));
      setNewCatName('');
      setShowNewCat(false);
      toast({ variant: 'success', title: 'Category created!' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to create category' });
    } finally {
      setAddingCat(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await portfoliosApi.uploadImage(file);
      setFormData(prev => ({ ...prev, [field]: res.data.url }));
      toast({ variant: "success", title: "Image uploaded" });
    } catch {
      toast({ variant: "destructive", title: "Upload failed" });
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const current: string[] = formData.images ? (() => { try { return JSON.parse(formData.images); } catch { return []; } })() : [];
    let added = 0;
    for (const file of files) {
      try {
        const res = await portfoliosApi.uploadImage(file);
        current.push(res.data.url);
        added++;
      } catch { /* skip */ }
    }
    setFormData(prev => ({ ...prev, images: JSON.stringify(current) }));
    if (added) toast({ variant: "success", title: `${added} image(s) uploaded` });
    e.target.value = '';
  };

  const handleRemoveGalleryImage = (idx: number) => {
    const arr: string[] = formData.images ? (() => { try { return JSON.parse(formData.images); } catch { return []; } })() : [];
    arr.splice(idx, 1);
    setFormData(prev => ({ ...prev, images: JSON.stringify(arr) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portfoliosApi.create({
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        sort_order: Number(formData.sort_order),
      });
      toast({ variant: "success", title: "Success!", description: "Portfolio created." });
      setTimeout(() => navigate('/portfolios'), 500);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error!", description: error.response?.data?.error || "Failed to create portfolio." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/portfolios')} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-base font-semibold">Create Portfolio</h2>
            <p className="text-xs text-muted-foreground">Add a new portfolio project</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/portfolios')} className="h-9 text-sm">Cancel</Button>
          <Button type="submit" form="portfolio-create-form" disabled={loading} className="h-9 text-sm min-w-24">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <form id="portfolio-create-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── Main column ── */}
        <div className="space-y-5">

          {/* Title + Slug + Description */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-medium">Title <span className="text-destructive">*</span></Label>
              <Input id="title" required placeholder="Project name" value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-xs font-medium">Slug <span className="text-destructive">*</span></Label>
              <Input id="slug" required value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-medium">Short Description</Label>
              <Textarea id="description" placeholder="Brief project description" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="text-sm" />
            </div>
          </div>

          {/* Full Content */}
          <div className="rounded-lg border bg-card p-5 space-y-2">
            <Label htmlFor="content" className="text-xs font-medium">Full Content</Label>
            <Textarea id="content" placeholder="Detailed project description, challenges, solutions..." value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={12} className="text-sm font-mono" />
          </div>

          {/* URLs */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Links</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_url" className="text-xs font-medium">Project URL</Label>
                <Input id="project_url" placeholder="https://example.com" value={formData.project_url}
                  onChange={(e) => setFormData({ ...formData, project_url: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_url" className="text-xs font-medium">GitHub URL</Label>
                <Input id="github_url" placeholder="https://github.com/..." value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="rounded-lg border bg-card p-5 space-y-2">
            <Label htmlFor="tech_stack" className="text-xs font-medium">Tech Stack</Label>
            <Input id="tech_stack" placeholder='["React", "Go", "PostgreSQL"]' value={formData.tech_stack}
              onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })} className="h-9 text-sm font-mono" />
            <p className="text-xs text-muted-foreground">JSON array of technologies used</p>
          </div>

          {/* SEO */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SEO</p>
            <div className="space-y-2">
              <Label htmlFor="meta_title" className="text-xs font-medium">Meta Title</Label>
              <Input id="meta_title" value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} className="h-9 text-sm" />
              <p className="text-xs text-muted-foreground">{formData.meta_title.length}/60 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_description" className="text-xs font-medium">Meta Description</Label>
              <Textarea id="meta_description" value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} rows={3} className="text-sm" />
              <p className="text-xs text-muted-foreground">{formData.meta_description.length}/160 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_keywords" className="text-xs font-medium">Meta Keywords</Label>
              <Input id="meta_keywords" value={formData.meta_keywords}
                onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })} className="h-9 text-sm" />
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Status */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
            <select id="status" value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Category */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</p>
              <button type="button" onClick={() => setShowNewCat((v) => !v)}
                className="text-muted-foreground hover:text-foreground transition-colors">
                {showNewCat ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </button>
            </div>
            <select value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {showNewCat && (
              <div className="flex gap-1.5 pt-1">
                <Input placeholder="Category name" value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                  className="h-8 text-xs" />
                <Button type="button" size="sm" onClick={handleAddCategory} disabled={addingCat || !newCatName.trim()}
                  className="h-8 px-2">
                  {addingCat ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                </Button>
              </div>
            )}
          </div>

          {/* Sort Order */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <Label htmlFor="sort_order" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sort Order</Label>
            <Input id="sort_order" type="number" value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} className="h-9 text-sm" />
          </div>

          {/* Gallery Images */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gallery Images</p>
            {(() => {
              const imgs: string[] = formData.images ? (() => { try { return JSON.parse(formData.images); } catch { return []; } })() : [];
              return imgs.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {imgs.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url.startsWith('http') ? url : `${BASE_URL}${url}`}
                        alt={`Gallery ${i + 1}`} className="w-full aspect-square object-cover rounded-md border" />
                      <button type="button" onClick={() => handleRemoveGalleryImage(i)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-muted-foreground">No images yet</p>;
            })()}
            <label className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border border-dashed text-xs text-muted-foreground hover:text-foreground hover:border-foreground cursor-pointer transition-colors w-full">
              <Plus className="h-3.5 w-3.5" /> Add Images
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
            </label>
          </div>

          {/* Featured Image */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured Image</p>
            {formData.featured_image && (
              <img src={formData.featured_image.startsWith('http') ? formData.featured_image : `${BASE_URL}${formData.featured_image}`}
                alt="Featured" className="w-full aspect-video object-cover rounded-md border" />
            )}
            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'featured_image')} className="h-9 text-sm" />
          </div>

          {/* OG Image */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">OG Image</p>
            {formData.og_image && (
              <img src={formData.og_image.startsWith('http') ? formData.og_image : `${BASE_URL}${formData.og_image}`}
                alt="OG" className="w-full aspect-video object-cover rounded-md border" />
            )}
            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'og_image')} className="h-9 text-sm" />
          </div>
        </div>
      </form>
    </div>
  );
}
