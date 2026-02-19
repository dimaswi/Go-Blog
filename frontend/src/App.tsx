import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './lib/store';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute as PermissionGuard } from './components/protected-route';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/auth/login'));
const DashboardPage = lazy(() => import('./pages/dashboard/index'));
const AccountPage = lazy(() => import('./pages/account/index'));
const SettingsPage = lazy(() => import('./pages/settings/index'));

// Users
const UsersIndex = lazy(() => import('./pages/users/index'));
const UsersCreate = lazy(() => import('./pages/users/create'));
const UsersEdit = lazy(() => import('./pages/users/edit'));
const UsersShow = lazy(() => import('./pages/users/show'));

// Roles
const RolesIndex = lazy(() => import('./pages/roles/index'));
const RolesCreate = lazy(() => import('./pages/roles/create'));
const RolesEdit = lazy(() => import('./pages/roles/edit'));
const RolesShow = lazy(() => import('./pages/roles/show'));

// Permissions
const PermissionsIndex = lazy(() => import('./pages/permissions/index'));
const PermissionsCreate = lazy(() => import('./pages/permissions/create'));
const PermissionsEdit = lazy(() => import('./pages/permissions/edit'));
const PermissionsShow = lazy(() => import('./pages/permissions/show'));

// Blogs
const BlogsIndex = lazy(() => import('./pages/blogs/index'));
const BlogsCreate = lazy(() => import('./pages/blogs/create'));
const BlogsEdit = lazy(() => import('./pages/blogs/edit'));
const BlogsShow = lazy(() => import('./pages/blogs/show'));

// Portfolios
const PortfoliosIndex = lazy(() => import('./pages/portfolios/index'));
const PortfoliosCreate = lazy(() => import('./pages/portfolios/create'));
const PortfoliosEdit = lazy(() => import('./pages/portfolios/edit'));
const PortfoliosShow = lazy(() => import('./pages/portfolios/show'));

// Messages
const MessagesIndex = lazy(() => import('./pages/messages/index'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <AppLayout>{children}</AppLayout>;
}

function App() {
  // Load theme on app start
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          
          {/* Users */}
          <Route path="/users" element={<ProtectedRoute><UsersIndex /></ProtectedRoute>} />
          <Route path="/users/create" element={
            <ProtectedRoute>
              <PermissionGuard permission="users.create">
                <UsersCreate />
              </PermissionGuard>
            </ProtectedRoute>
          } />
          <Route path="/users/:id" element={<ProtectedRoute><UsersShow /></ProtectedRoute>} />
          <Route path="/users/:id/edit" element={
            <ProtectedRoute>
              <PermissionGuard permission="users.update">
                <UsersEdit />
              </PermissionGuard>
            </ProtectedRoute>
          } />
          
          {/* Roles */}
          <Route path="/roles" element={<ProtectedRoute><RolesIndex /></ProtectedRoute>} />
          <Route path="/roles/create" element={
            <ProtectedRoute>
              <PermissionGuard permission="roles.create">
                <RolesCreate />
              </PermissionGuard>
            </ProtectedRoute>
          } />
          <Route path="/roles/:id" element={<ProtectedRoute><RolesShow /></ProtectedRoute>} />
          <Route path="/roles/:id/edit" element={
            <ProtectedRoute>
              <PermissionGuard permission="roles.update">
                <RolesEdit />
              </PermissionGuard>
            </ProtectedRoute>
          } />
          
          {/* Permissions */}
          <Route path="/permissions" element={<ProtectedRoute><PermissionsIndex /></ProtectedRoute>} />
          <Route path="/permissions/create" element={
            <ProtectedRoute>
              <PermissionGuard permission="permissions.create">
                <PermissionsCreate />
              </PermissionGuard>
            </ProtectedRoute>
          } />
          <Route path="/permissions/:id" element={<ProtectedRoute><PermissionsShow /></ProtectedRoute>} />
          <Route path="/permissions/:id/edit" element={
            <ProtectedRoute>
              <PermissionGuard permission="permissions.update">
                <PermissionsEdit />
              </PermissionGuard>
            </ProtectedRoute>
          } />
          
          {/* Blogs */}
          <Route path="/blogs" element={<ProtectedRoute><BlogsIndex /></ProtectedRoute>} />
          <Route path="/blogs/create" element={
            <ProtectedRoute>
              <PermissionGuard permission="blogs.create"><BlogsCreate /></PermissionGuard>
            </ProtectedRoute>
          } />
          <Route path="/blogs/:id" element={<ProtectedRoute><BlogsShow /></ProtectedRoute>} />
          <Route path="/blogs/:id/edit" element={
            <ProtectedRoute>
              <PermissionGuard permission="blogs.update"><BlogsEdit /></PermissionGuard>
            </ProtectedRoute>
          } />

          {/* Portfolios */}
          <Route path="/portfolios" element={<ProtectedRoute><PortfoliosIndex /></ProtectedRoute>} />
          <Route path="/portfolios/create" element={
            <ProtectedRoute>
              <PermissionGuard permission="portfolios.create"><PortfoliosCreate /></PermissionGuard>
            </ProtectedRoute>
          } />
          <Route path="/portfolios/:id" element={<ProtectedRoute><PortfoliosShow /></ProtectedRoute>} />
          <Route path="/portfolios/:id/edit" element={
            <ProtectedRoute>
              <PermissionGuard permission="portfolios.update"><PortfoliosEdit /></PermissionGuard>
            </ProtectedRoute>
          } />

          {/* Messages */}
          <Route path="/messages" element={<ProtectedRoute><MessagesIndex /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
