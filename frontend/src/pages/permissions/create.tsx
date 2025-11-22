import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { setPageTitle } from '@/lib/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { permissionsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Lock, FileText } from 'lucide-react';

export default function PermissionCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    setPageTitle('Create Permission');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await permissionsApi.create(formData);
      toast({
        variant: "success",
        title: "Success!",
        description: "Permission created successfully.",
      });
      setTimeout(() => navigate('/permissions'), 500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.response?.data?.error || "Failed to create permission.",
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
          onClick={() => navigate('/permissions')}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create Permission</h1>
          <p className="text-sm text-muted-foreground">Add a new permission to the system</p>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-base font-semibold">Permission Information</CardTitle>
          <CardDescription>Define the permission name and description</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 group">
              <Label htmlFor="name" className="text-xs font-medium flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                Permission Name
              </Label>
              <Input
                id="name"
                required
                placeholder="e.g., users.create"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-9 text-sm font-mono transition-all focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">Use dot notation (e.g., resource.action)</p>
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="description" className="text-xs font-medium flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what this permission allows..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-sm min-h-[80px] transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/permissions')}
                className="h-9 hover:bg-accent transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="h-9 min-w-[140px] hover:scale-105 transition-all"
              >
                {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Create Permission
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
