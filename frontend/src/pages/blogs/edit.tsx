import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { blogsApi, blogCategoriesApi, blogTagsApi, type BlogCategory, type BlogTag } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Tag, Plus, X } from 'lucide-react';
import { setPageTitle } from '@/lib/page-title';

export default function BlogEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft',
    category_id: '',
    tag_ids: [] as number[],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image: '',
  });

  useEffect(() => {
    setPageTitle('Edit Blog Post');
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [blogRes, catRes, tagRes] = await Promise.all([
        blogsApi.getById(Number(id)),
        blogCategoriesApi.getAll(),
        blogTagsApi.getAll(),
      ]);
      const blog = blogRes.data.data;
      setFormData({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        featured_image: blog.featured_image || '',
        status: blog.status,
        category_id: blog.category_id ? String(blog.category_id) : '',
        tag_ids: blog.tags?.map(t => t.id) || [],
        meta_title: blog.meta_title || '',
        meta_description: blog.meta_description || '',
        meta_keywords: blog.meta_keywords || '',
        og_image: blog.og_image || '',
      });
      setCategories(catRes.data.data || []);
      setTags(tagRes.data.data || []);
    } catch {
      toast({ variant: "destructive", title: "Error!", description: "Failed to load blog data." });
    } finally {
      setFetching(false);
    }
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const res = await blogCategoriesApi.create({ name: newCatName.trim(), slug: generateSlug(newCatName.trim()), description: '' });
      const created: BlogCategory = res.data.data;
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

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    setAddingTag(true);
    try {
      const res = await blogTagsApi.create({ name: newTagName.trim(), slug: generateSlug(newTagName.trim()), description: '' });
      const created: BlogTag = res.data.data;
      setTags((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, tag_ids: [...prev.tag_ids, created.id] }));
      setNewTagName('');
      setShowNewTag(false);
      toast({ variant: 'success', title: 'Tag created!' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to create tag' });
    } finally {
      setAddingTag(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'featured_image' | 'og_image') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await blogsApi.uploadImage(file);
      setFormData({ ...formData, [field]: res.data.url });
      toast({ variant: "success", title: "Image uploaded" });
    } catch {
      toast({ variant: "destructive", title: "Upload failed" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await blogsApi.update(Number(id), {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      });
      toast({ variant: "success", title: "Success!", description: "Blog post updated successfully." });
      setTimeout(() => navigate('/blogs'), 500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.response?.data?.error || "Failed to update blog post.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/blogs')} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-base font-semibold">Edit Blog Post</h2>
            <p className="text-xs text-muted-foreground">Update your blog article</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/blogs')} className="h-9 text-sm">Cancel</Button>
          <Button type="submit" form="blog-edit-form" disabled={loading} className="h-9 text-sm min-w-24">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Post
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <form id="blog-edit-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── Main column ── */}
        <div className="space-y-5">

          {/* Title + Slug + Excerpt */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-medium">Title <span className="text-destructive">*</span></Label>
              <Input id="title" required value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-xs font-medium">Slug <span className="text-destructive">*</span></Label>
              <Input id="slug" required value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-xs font-medium">Excerpt</Label>
              <Textarea id="excerpt" value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={2} className="text-sm" />
            </div>
          </div>

          {/* Content */}
          <div className="rounded-lg border bg-card p-5 space-y-2">
            <Label htmlFor="content" className="text-xs font-medium">Content</Label>
            <Textarea id="content" value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={18} className="text-sm font-mono" />
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
            <select value={formData.status}
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

          {/* Tags */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Tags
              </p>
              <button type="button" onClick={() => setShowNewTag((v) => !v)}
                className="text-muted-foreground hover:text-foreground transition-colors">
                {showNewTag ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </button>
            </div>
            {showNewTag && (
              <div className="flex gap-1.5">
                <Input placeholder="Tag name" value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  className="h-8 text-xs" />
                <Button type="button" size="sm" onClick={handleAddTag} disabled={addingTag || !newTagName.trim()}
                  className="h-8 px-2">
                  {addingTag ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                </Button>
              </div>
            )}
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {tags.length === 0 ? (
                <p className="text-xs text-muted-foreground">No tags yet — add one above</p>
              ) : tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                  <input type="checkbox" checked={formData.tag_ids.includes(tag.id)}
                    onChange={(e) => setFormData({
                      ...formData,
                      tag_ids: e.target.checked
                        ? [...formData.tag_ids, tag.id]
                        : formData.tag_ids.filter((i) => i !== tag.id),
                    })} className="rounded" />
                  {tag.name}
                </label>
              ))}
            </div>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">OG Image (Social)</p>
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
