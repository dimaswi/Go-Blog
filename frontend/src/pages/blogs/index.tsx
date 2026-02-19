import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { createBlogColumns } from './columns';
import { blogsApi, type Blog } from '@/lib/api';
import { usePermission } from '@/hooks/usePermission';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { setPageTitle } from '@/lib/page-title';
import { Loader2, Plus } from 'lucide-react';

export default function BlogsPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await blogsApi.getAll();
      setBlogs(res.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to load blogs.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setPageTitle('Blog Posts');
    loadData();
  }, [loadData]);

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    try {
      await blogsApi.delete(blogToDelete);
      toast({ variant: "success", title: "Success!", description: "Blog deleted successfully." });
      loadData();
    } catch {
      toast({ variant: "destructive", title: "Error!", description: "Failed to delete blog." });
    } finally {
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const handleTogglePublish = async (blog: Blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      await blogsApi.update(blog.id, { ...blog, status: newStatus });
      toast({
        variant: 'success',
        title: newStatus === 'published' ? 'Published!' : 'Unpublished',
        description: `"${blog.title}" is now ${newStatus}.`,
      });
      loadData();
    } catch {
      toast({ variant: 'destructive', title: 'Error!', description: 'Failed to update status.' });
    }
  };

  const columns = createBlogColumns({
    onView: (id) => navigate(`/blogs/${id}`),
    onEdit: (id) => navigate(`/blogs/${id}/edit`),
    onDelete: (id) => { setBlogToDelete(id); setDeleteDialogOpen(true); },
    onTogglePublish: handleTogglePublish,
    hasViewPermission: hasPermission('blogs.view'),
    hasEditPermission: hasPermission('blogs.update'),
    hasDeletePermission: hasPermission('blogs.delete'),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Blog Posts</h2>
          <p className="text-sm text-muted-foreground">Manage your blog articles and content</p>
        </div>
        {hasPermission('blogs.create') && (
          <Button onClick={() => navigate('/blogs/create')} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        )}
      </div>
      <DataTable columns={columns} data={blogs} searchPlaceholder="Search blogs..." pageSize={10} />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Blog Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
