import { Switch, Route, Redirect, useLocation } from "wouter";
import * as React from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { NavHeader } from "@/components/nav-header";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import CreateCVPage from "@/pages/create-cv";
import CVPreviewPage from "@/pages/cv-preview";
import DashboardPage from "@/pages/dashboard";
import PricingPage from "@/pages/pricing";
import PaymentCallbackPage from "@/pages/payment-callback";
import OrderSuccessPage from "@/pages/order-success";
import CoverLetterPage from "@/pages/cover-letter";
import UpgradePage from "@/pages/upgrade";
import AdminLayout from "@/pages/admin/admin-layout";
import SalesOverviewPage from "@/pages/admin/sales-overview";
import UserManagementPage from "@/pages/admin/user-management";
import AnalyticsPage from "@/pages/admin/analytics";
import EmailLogsPage from "@/pages/admin/email-logs";
import ApiKeysPage from "@/pages/admin/api-keys";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Check if user is admin by fetching user info
      fetch('/api/auth/user')
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch user');
          }
          return res.json();
        })
        .then(user => setIsAdmin(user.role === 'admin'))
        .catch(() => setIsAdmin(false));
    } else if (!isAuthenticated && !isLoading) {
      // Not authenticated, set isAdmin to false to trigger redirect
      setIsAdmin(false);
    }
  }, [isAuthenticated, isLoading]);

  // Show loading only while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users immediately
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  // Show loading while checking admin status
  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect non-admin users to dashboard
  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/create">
        <ProtectedRoute component={CreateCVPage} />
      </Route>
      <Route path="/cover-letter">
        <ProtectedRoute component={CoverLetterPage} />
      </Route>
      <Route path="/preview">
        <ProtectedRoute component={CVPreviewPage} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/upgrade">
        <ProtectedRoute component={UpgradePage} />
      </Route>
      <Route path="/payment/callback">
        <ProtectedRoute component={PaymentCallbackPage} />
      </Route>
      <Route path="/order/success">
        <ProtectedRoute component={OrderSuccessPage} />
      </Route>
      <Route path="/pricing" component={PricingPage} />
      <Route path="/admin/sales">
        <AdminRoute component={() => <AdminLayout><SalesOverviewPage /></AdminLayout>} />
      </Route>
      <Route path="/admin/users">
        <AdminRoute component={() => <AdminLayout><UserManagementPage /></AdminLayout>} />
      </Route>
      <Route path="/admin/analytics">
        <AdminRoute component={() => <AdminLayout><AnalyticsPage /></AdminLayout>} />
      </Route>
      <Route path="/admin/emails">
        <AdminRoute component={() => <AdminLayout><EmailLogsPage /></AdminLayout>} />
      </Route>
      <Route path="/admin/api-keys">
        <AdminRoute component={() => <AdminLayout><ApiKeysPage /></AdminLayout>} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <NavHeader />
            <main className="flex-1">
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
