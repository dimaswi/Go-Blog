import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { setPageTitle } from '@/lib/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { rolesApi, permissionsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Shield, FileText, Lock } from 'lucide-react';

export default function RoleCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permission_ids: [] as number[],
  });

  useEffect(() => {
    setPageTitle('Create Role');
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const response = await permissionsApi.getAll();
      setPermissions(response.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to load permissions.",
      });
    }
  };

  const handlePermissionToggle = (permId: number) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permId)
        ? prev.permission_ids.filter(id => id !== permId)
        : [...prev.permission_ids, permId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await rolesApi.create(formData);
      toast({
        variant: "success",
        title: "Success!",
        description: "Role created successfully.",
      });
      setTimeout(() => navigate('/roles'), 500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.response?.data?.error || "Failed to create role.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/roles')}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Role</h1>
          <p className="text-sm text-muted-foreground">Define a new role with permissions</p>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-base font-semibold">Role Information</CardTitle>
          <CardDescription>Fill in the role details and assign permissions</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 group">
              <Label htmlFor="name" className="text-xs font-medium flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                Role Name
              </Label>
              <Input
                id="name"
                required
                placeholder="e.g., Administrator, Manager"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-9 text-sm transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="description" className="text-xs font-medium flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the role's purpose and responsibilities..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-sm min-h-[80px] transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-3 group">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Permissions
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {formData.permission_ids.length} selected
                  </Badge>
                </Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                {permissions.map((perm) => (
                  <div 
                    key={perm.id} 
                    className="flex items-start space-x-3 p-2.5 rounded-md hover:bg-background transition-colors border border-transparent hover:border-border"
                  >
                    <Checkbox
                      id={`perm-${perm.id}`}
                      checked={formData.permission_ids.includes(perm.id)}
                      onCheckedChange={() => handlePermissionToggle(perm.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-0.5">
                      <label
                        htmlFor={`perm-${perm.id}`}
                        className="text-sm font-medium leading-none cursor-pointer hover:text-primary transition-colors font-mono"
                      >
                        {perm.name}
                      </label>
                      {perm.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {perm.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/roles')}
                className="h-9 hover:bg-accent transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="h-9 min-w-[120px] hover:scale-105 transition-all"
              >
                {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Create Role
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
