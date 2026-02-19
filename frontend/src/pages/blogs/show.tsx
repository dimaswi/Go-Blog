import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { blogsApi, type Blog } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Calendar, Eye, Tag, User } from 'lucide-react';
import { setPageTitle } from '@/lib/page-title';

export default function BlogShow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle('Blog Detail');
    loadBlog();
  }, [id]);

  const loadBlog = async () => {
    try {
      const res = await blogsApi.getById(Number(id));
      setBlog(res.data.data);
    } catch {
      toast({ variant: "destructive", title: "Error!", description: "Failed to load blog." });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/blogs')} className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-base font-semibold">{blog.title}</h2>
          <p className="text-sm text-muted-foreground">/{blog.slug}</p>
        </div>
        <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>{blog.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {blog.featured_image && (
            <img src={blog.featured_image.startsWith('http') ? blog.featured_image : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${blog.featured_image}`}
              alt={blog.title} className="w-full h-48 object-cover rounded-lg border" />
          )}
          {blog.excerpt && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Excerpt</p>
              <p className="text-sm text-muted-foreground">{blog.excerpt}</p>
            </div>
          )}
          <div className="prose dark:prose-invert max-w-none">
            <div className="text-sm whitespace-pre-wrap">{blog.content}</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold">Details</h3>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{blog.author?.full_name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(blog.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>{blog.view_count} views</span>
            </div>
            {blog.category && (
              <div className="text-sm">
                <span className="text-muted-foreground">Category: </span>
                <Badge variant="outline">{blog.category.name}</Badge>
              </div>
            )}
            {blog.tags && blog.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <Tag className="h-3.5 w-3.5" /> Tags
                </div>
                <div className="flex flex-wrap gap-1">
                  {blog.tags.map(tag => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">{tag.name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          {(blog.meta_title || blog.meta_description || blog.meta_keywords) && (
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold">SEO Info</h3>
              {blog.meta_title && <p className="text-xs"><strong>Title:</strong> {blog.meta_title}</p>}
              {blog.meta_description && <p className="text-xs"><strong>Description:</strong> {blog.meta_description}</p>}
              {blog.meta_keywords && <p className="text-xs"><strong>Keywords:</strong> {blog.meta_keywords}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
