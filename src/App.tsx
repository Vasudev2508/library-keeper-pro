import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { AuthPage } from '@/components/auth/AuthPage';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Books from '@/pages/Books';
import Transactions from '@/pages/Transactions';
import Notifications from '@/pages/Notifications';
import Reports from '@/pages/Reports';
import UsersPage from '@/pages/UsersPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function AuthGate() {
  const { user, loading, setUser, fetchProfile, fetchRoles } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(async () => {
          await Promise.all([fetchProfile(), fetchRoles()]);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        Promise.all([fetchProfile(), fetchRoles()]).finally(() => setInitializing(false));
      } else {
        setInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthGate />
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;