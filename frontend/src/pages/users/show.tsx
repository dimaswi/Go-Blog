import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usersApi } from '@/lib/api';
import { usePermission } from '@/hooks/usePermission';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ArrowLeft, Loader2, Edit, Trash2, User, Mail, Shield } from 'lucide-react';
import { setPageTitle } from '@/lib/page-title';

export default function UserShow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { hasPermission } = usePermission();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setPageTitle('User Details');
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await usersApi.getById(Number(id));
      setUser(response.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to load user data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteDialogOpen(false);
    try {
      await usersApi.delete(parseInt(id!));
      toast({
        variant: "success",
        title: "Success!",
        description: "User deleted successfully.",
      });
      setTimeout(() => navigate('/users'), 500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.response?.data?.error || "Failed to delete user.",
      });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-semibold">User not found</p>
          <Button onClick={() => navigate('/users')} className="mt-4">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/users')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">User Details</h1>
            <p className="text-sm text-muted-foreground">View user information</p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasPermission('users.update') && (
            <Button 
              onClick={() => navigate(`/users/${id}/edit`)}
              size="sm"
              className="h-9"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {hasPermission('users.delete') && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              size="sm"
              className="h-9"
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              )}
              Delete
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-base font-semibold">User Information</CardTitle>
          <CardDescription>Details about this user</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 group">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Full Name</p>
              </div>
              <p className="text-sm font-medium bg-muted/30 px-3 py-2 rounded-md">{user.full_name}</p>
            </div>
            <div className="space-y-2 group">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Username</p>
              </div>
              <p className="text-sm font-medium bg-muted/30 px-3 py-2 rounded-md">{user.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 group">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Email Address</p>
              </div>
              <p className="text-sm font-medium bg-muted/30 px-3 py-2 rounded-md">{user.email}</p>
            </div>
            <div className="space-y-2 group">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Role</p>
              </div>
              <p className="text-sm font-medium bg-muted/30 px-3 py-2 rounded-md">{user.role?.name || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-2 group">
            <p className="text-xs font-medium text-muted-foreground">Account Status</p>
            <Badge
              variant={user.is_active ? "default" : "secondary"}
              className="text-xs"
            >
              {user.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {user.role?.permissions && user.role.permissions.length > 0 && (
            <div className="space-y-3 group">
              <p className="text-xs font-medium text-muted-foreground">
                Permissions ({user.role.permissions.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {user.role.permissions.map((perm: any) => (
                  <Badge
                    key={perm.id}
                    variant="outline"
                    className="text-xs font-mono"
                  >
                    {perm.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
