import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function DevToolsPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMakeAdmin = async () => {
    if (import.meta.env.PROD) {
      toast({
        title: "Not Available",
        description: "This feature is only available in development mode",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest("/api/dev/make-me-admin", {
        method: "POST",
      });

      toast({
        title: "Success!",
        description: response.message || "You are now an admin. Refresh the page to access admin routes.",
      });

      // Refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to promote to admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (import.meta.env.PROD) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Development Tools Not Available</CardTitle>
            <CardDescription>
              This page is only available in development mode
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Development Tools</h1>
        <p className="text-muted-foreground">
          Testing utilities for development environment only
        </p>
      </div>

      <div className="space-y-6">
        {/* Admin Access Card */}
        <Card className="border-amber-500/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <CardTitle>Admin Access</CardTitle>
            </div>
            <CardDescription>
              Promote your current user to admin role for testing admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Development Only
                </p>
                <p className="text-amber-800 dark:text-amber-200">
                  This endpoint is disabled in production. It will promote your currently logged-in user to admin role.
                </p>
              </div>
            </div>

            <Button
              onClick={handleMakeAdmin}
              disabled={loading}
              size="lg"
              className="w-full"
              data-testid="button-make-admin"
            >
              <Shield className="h-4 w-4 mr-2" />
              {loading ? "Promoting..." : "Make Me Admin"}
            </Button>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>After becoming admin, you can access:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>/admin/sales - Sales overview</li>
                <li>/admin/users - User management</li>
                <li>/admin/analytics - Analytics dashboard</li>
                <li>/admin/emails - Email logs</li>
                <li>/admin/api-keys - API key management</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Environment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode:</span>
                <span className="font-mono">{import.meta.env.MODE}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Production:</span>
                <span className="font-mono">{import.meta.env.PROD ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Development:</span>
                <span className="font-mono">{import.meta.env.DEV ? "Yes" : "No"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
