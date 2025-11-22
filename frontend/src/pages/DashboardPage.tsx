import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store';
import { usersApi, rolesApi } from '@/lib/api';
import { Users, Shield, Activity, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setPageTitle } from '@/lib/page-title';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    newUsersThisMonth: 0,
  });

  useEffect(() => {
    setPageTitle('Dashboard');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        usersApi.getAll(),
        rolesApi.getAll(),
      ]);

      const users = usersRes.data.data;
      const roles = rolesRes.data.data;

      // Calculate stats
      const activeUsers = users.filter((u: any) => u.is_active).length;
      
      // Get new users this month (created in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsers = users.filter((u: any) => {
        const createdDate = new Date(u.created_at);
        return createdDate >= thirtyDaysAgo;
      }).length;

      setStats({
        totalUsers: users.length,
        activeUsers: activeUsers,
        totalRoles: roles.length,
        newUsersThisMonth: newUsers,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { 
      title: 'Total Users', 
      value: loading ? '...' : stats.totalUsers.toString(), 
      change: stats.activeUsers > 0 ? `${stats.activeUsers} active` : 'No data',
      icon: Users, 
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    { 
      title: 'Active Roles', 
      value: loading ? '...' : stats.totalRoles.toString(), 
      change: 'System roles',
      icon: Shield, 
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    { 
      title: 'System Status', 
      value: '99.9%', 
      change: 'Uptime',
      icon: Activity, 
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    { 
      title: 'New Users', 
      value: loading ? '...' : `+${stats.newUsersThisMonth}`, 
      change: 'Last 30 days',
      icon: UserPlus, 
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Page Content */}
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        {/* Main Card Container */}
        <Card className="flex-1 rounded-xl border bg-card shadow">
          <CardHeader>
            <div className="flex items-center justify-between ">
              <CardTitle className="text-3xl font-bold tracking-tight">Dashboard</CardTitle>
            </div>
            <div>
              <CardDescription className="text-base">
                Welcome back, {user?.full_name}! Here's what's happening today.
              </CardDescription>
            </div>
          </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </span>
                    <div className={cn(stat.bgColor, "p-2 rounded-lg")}>
                      <Icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.change}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Activity */}
            <div className="col-span-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">System Information</h3>
                <p className="text-sm text-muted-foreground">Quick overview of the system</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      User Management
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stats.totalUsers} total users with {stats.activeUsers} active accounts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Role Management
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stats.totalRoles} active roles configured in the system
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      System Health
                    </p>
                    <p className="text-sm text-muted-foreground">
                      All services running normally
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="col-span-3 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Your Profile</h3>
                <p className="text-sm text-muted-foreground">Account information</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{user?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <span className="text-sm font-medium">{user?.role?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-sm font-medium text-green-600">
                      {user?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-muted-foreground">User ID</span>
                    <span className="text-sm font-medium">#{user?.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
