import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { createPortfolioColumns } from './columns';
import { portfoliosApi, type Portfolio } from '@/lib/api';
import { usePermission } from '@/hooks/usePermission';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { setPageTitle } from '@/lib/page-title';
import { Loader2, Plus } from 'lucide-react';

export default function PortfoliosPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await portfoliosApi.getAll();
      setPortfolios(res.data.data);
    } catch {
      toast({ variant: "destructive", title: "Error!", description: "Failed to load portfolios." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setPageTitle('Portfolios');
    loadData();
  }, [loadData]);

  const confirmDelete = async () => {
    if (!portfolioToDelete) return;
    try {
      await portfoliosApi.delete(portfolioToDelete);
      toast({ variant: "success", title: "Success!", description: "Portfolio deleted." });
      loadData();
    } catch {
      toast({ variant: "destructive", title: "Error!", description: "Failed to delete portfolio." });
    } finally {
      setDeleteDialogOpen(false);
      setPortfolioToDelete(null);
    }
  };

  const handleTogglePublish = async (portfolio: Portfolio) => {
    const newStatus = portfolio.status === 'published' ? 'draft' : 'published';
    try {
      await portfoliosApi.update(portfolio.id, { ...portfolio, status: newStatus });
      toast({
        variant: 'success',
        title: newStatus === 'published' ? 'Published!' : 'Unpublished',
        description: `"${portfolio.title}" is now ${newStatus}.`,
      });
      loadData();
    } catch {
      toast({ variant: 'destructive', title: 'Error!', description: 'Failed to update status.' });
    }
  };

  const columns = createPortfolioColumns({
    onView: (id) => navigate(`/portfolios/${id}`),
    onEdit: (id) => navigate(`/portfolios/${id}/edit`),
    onDelete: (id) => { setPortfolioToDelete(id); setDeleteDialogOpen(true); },
    onTogglePublish: handleTogglePublish,
    hasViewPermission: hasPermission('portfolios.view'),
    hasEditPermission: hasPermission('portfolios.update'),
    hasDeletePermission: hasPermission('portfolios.delete'),
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
          <h2 className="text-base font-semibold">Portfolios</h2>
          <p className="text-sm text-muted-foreground">Manage your portfolio projects</p>
        </div>
        {hasPermission('portfolios.create') && (
          <Button onClick={() => navigate('/portfolios/create')} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>
      <DataTable columns={columns} data={portfolios} searchPlaceholder="Search portfolios..." pageSize={10} />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Portfolio"
        description="Are you sure you want to delete this portfolio? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
