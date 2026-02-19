import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Moon, Sun, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1),
    path: `/${pathSegments.slice(0, index + 1).join('/')}`,
  }));

  return (
    <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="size-7" />
        <Separator orientation="vertical" className="h-4" />

        <nav className="flex items-center gap-1 min-w-0">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center gap-1 min-w-0">
              {index > 0 && (
                <ChevronRight className="size-3.5 text-muted-foreground/50 shrink-0" />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-sm font-medium text-foreground truncate">
                  {crumb.label}
                </span>
              ) : (
                <button
                  onClick={() => navigate(crumb.path)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  {crumb.label}
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="size-8"
      >
        {theme === 'light' ? (
          <Moon className="size-4" />
        ) : (
          <Sun className="size-4" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  );
}
