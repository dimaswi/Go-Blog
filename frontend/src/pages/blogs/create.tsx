import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { blogsApi, blogCategoriesApi, blogTagsApi, type BlogCategory, type BlogTag } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Tag, Plus, X } from 'lucide-react';
import { setPageTitle } from '@/lib/page-title';

export default function BlogCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', content: '', featured_image: '',
    status: 'published', category_id: '', tag_ids: [] as number[],
    meta_title: '', meta_description: '', meta_keywords: '', og_image: '',
  });

  useEffect(() => {
    setPageTitle('Create Blog Post');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        blogCategoriesApi.getAll(),
        blogTagsApi.getAll(),
      ]);
      setCategories(catRes.data.data || []);
      setTags(tagRes.data.data || []);
    } catch {}
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (value: string) => {
    setFormData({ ...formData, title: value, slug: generateSlug(value), meta_title: formData.meta_title || value });
  };

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
      toast({ variant: 'success', title: 'Image uploaded' });
    } catch {
      toast({ variant: 'destructive', title: 'Upload failed' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await blogsApi.create({ ...formData, category_id: formData.category_id ? parseInt(formData.category_id) : null });
      toast({ variant: 'success', title: 'Success!', description: 'Blog post created successfully.' });
      setTimeout(() => navigate('/blogs'), 500);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error!', description: error.response?.data?.error || 'Failed to create blog post.' });
    } finally {
      setLoading(false);
    }
  };

  const BASE_URL = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  return (
    <div className="flex flex-1 flex-col gap-4 p-6 max-w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/blogs')} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-base font-semibold">Create Blog Post</h2>
            <p className="text-sm text-muted-foreground">Write a new blog article</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/blogs')} className="h-9 text-sm">Cancel</Button>
          <Button type="submit" form="blog-create-form" disabled={loading} className="h-9 text-sm min-w-28">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish Post
          </Button>
        </div>
      </div>

      <form id="blog-create-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">

          {/* ── Main column ── */}
          <div className="space-y-5">
            <div className="rounded-lg border bg-card p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-medium">Title <span className="text-destructive">*</span></Label>
                <Input id="title" required placeholder="Enter blog title" value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs font-medium">Slug</Label>
                <Input id="slug" required placeholder="blog-post-slug" value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-xs font-medium">Excerpt</Label>
                <Textarea id="excerpt" placeholder="Brief summary of the post..." value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={2} className="text-sm" />
              </div>
            </div>

            <div className="rounded-lg border bg-card p-5 space-y-2">
              <Label htmlFor="content" className="text-xs font-medium">Content</Label>
              <Textarea id="content" placeholder="Write your blog content here..." value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={20} className="text-sm font-mono" />
            </div>

            <div className="rounded-lg border bg-card p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SEO</h3>
              <div className="space-y-2">
                <Label htmlFor="meta_title" className="text-xs font-medium">Meta Title</Label>
                <Input id="meta_title" placeholder="SEO title" value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} className="h-9 text-sm" />
                <p className="text-xs text-muted-foreground">{formData.meta_title.length}/60</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description" className="text-xs font-medium">Meta Description</Label>
                <Textarea id="meta_description" placeholder="SEO description..." value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} rows={2} className="text-sm" />
                <p className="text-xs text-muted-foreground">{formData.meta_description.length}/160</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_keywords" className="text-xs font-medium">Meta Keywords</Label>
                <Input id="meta_keywords" placeholder="keyword1, keyword2" value={formData.meta_keywords}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })} className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</h3>
              <select id="status" value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="rounded-lg border bg-card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</h3>
              <select value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">— No category —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {showNewCat ? (
                <div className="flex gap-2 items-center">
                  <Input autoFocus placeholder="Category name" value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                    className="h-8 text-xs" />
                  <Button type="button" size="icon" className="h-8 w-8 shrink-0" onClick={handleAddCategory} disabled={addingCat}>
                    {addingCat ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0"
                    onClick={() => { setShowNewCat(false); setNewCatName(''); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <button type="button" onClick={() => setShowNewCat(true)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Add new category
                </button>
              )}
            </div>

            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Tags
                </h3>
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
                          : formData.tag_ids.filter((id) => id !== tag.id),
                      })} className="rounded" />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured Image</h3>
              {formData.featured_image && (
                <img src={formData.featured_image.startsWith('http') ? formData.featured_image : `${BASE_URL}${formData.featured_image}`}
                  alt="Featured" className="w-full aspect-video object-cover rounded-md border" />
              )}
              <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'featured_image')} className="h-9 text-sm" />
            </div>

            <div className="rounded-lg border bg-card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">OG Image (Social)</h3>
              {formData.og_image && (
                <img src={formData.og_image.startsWith('http') ? formData.og_image : `${BASE_URL}${formData.og_image}`}
                  alt="OG" className="w-full aspect-video object-cover rounded-md border" />
              )}
              <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'og_image')} className="h-9 text-sm" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
