import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Moon, Sun, Building2, Save, Loader2 } from 'lucide-react';
import { settingsApi } from '@/lib/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [appName, setAppName] = useState('StarterKits');
  const [appSubtitle, setAppSubtitle] = useState('Hospital System');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Set page title
  useEffect(() => {
    const savedAppName = localStorage.getItem('appName') || 'StarterKits';
    document.title = `Settings - ${savedAppName}`;
  }, []);

  // Load settings from API and localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load from API
      const response = await settingsApi.getAll();
      const settings = response.data.data;
      
      if (settings.app_name) {
        setAppName(settings.app_name);
        localStorage.setItem('appName', settings.app_name);
      }
      if (settings.app_subtitle) {
        setAppSubtitle(settings.app_subtitle);
        localStorage.setItem('appSubtitle', settings.app_subtitle);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setFetching(false);
    }

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const root = document.documentElement;
    
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else {
      root.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    toast({
      variant: "success",
      title: "Success!",
      description: `Theme changed to ${newTheme} mode.`,
    });
  };

  const handleSaveAppSettings = async () => {
    setLoading(true);
    try {
      // Save to API
      await settingsApi.update({
        app_name: appName,
        app_subtitle: appSubtitle,
      });

      // Save to localStorage
      localStorage.setItem('appName', appName);
      localStorage.setItem('appSubtitle', appSubtitle);
      
      // Trigger storage event to update sidebar immediately
      window.dispatchEvent(new Event('storage'));
      
      toast({
        variant: "success",
        title: "Success!",
        description: "Application settings saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to save settings. Please try again.",
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
          onClick={() => navigate(-1)}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage application preferences</p>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl">
        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Application Settings */}
            <Card className="shadow-md">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-base font-semibold">Application</CardTitle>
                <CardDescription>Customize application name and branding</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="appName" className="text-xs font-medium flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      Application Name
                    </Label>
                    <Input
                      id="appName"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="StarterKits"
                      className="max-w-md"
                    />
                    <p className="text-xs text-muted-foreground">
                      This name will appear in the sidebar and page titles
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appSubtitle" className="text-xs font-medium flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      Application Subtitle
                    </Label>
                    <Input
                      id="appSubtitle"
                      value={appSubtitle}
                      onChange={(e) => setAppSubtitle(e.target.value)}
                      placeholder="Hospital System"
                      className="max-w-md"
                    />
                    <p className="text-xs text-muted-foreground">
                      Subtitle text shown below the application name
                    </p>
                  </div>

                  <Button onClick={handleSaveAppSettings} className="mt-2" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card className="shadow-md">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-base font-semibold">Appearance</CardTitle>
                <CardDescription>Choose your preferred theme</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Label className="text-xs font-medium flex items-center gap-2">
                    <Moon className="h-3.5 w-3.5 text-muted-foreground" />
                    Theme
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => handleThemeChange('light')}
                      className="h-24 flex flex-col gap-2"
                    >
                      <Sun className="h-6 w-6" />
                      <span className="text-sm font-medium">Light</span>
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => handleThemeChange('dark')}
                      className="h-24 flex flex-col gap-2"
                    >
                      <Moon className="h-6 w-6" />
                      <span className="text-sm font-medium">Dark</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
