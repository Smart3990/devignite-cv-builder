import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { FileText, Mail, Sparkles, TrendingUp } from "lucide-react";

interface AnalyticsData {
  totalCVs: number;
  totalCoverLetters: number;
  totalAIRuns: number;
  activeUsersToday: number;
  cvGeneratedThisMonth: number;
  coverLettersThisMonth: number;
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return await response.json() as AnalyticsData;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total CVs",
      value: analytics?.totalCVs || 0,
      icon: FileText,
      description: "All-time CV generations",
      color: "text-blue-600",
    },
    {
      title: "Total Cover Letters",
      value: analytics?.totalCoverLetters || 0,
      icon: Mail,
      description: "All-time cover letter generations",
      color: "text-green-600",
    },
    {
      title: "AI Runs",
      value: analytics?.totalAIRuns || 0,
      icon: Sparkles,
      description: "Total AI feature usage",
      color: "text-purple-600",
    },
    {
      title: "Active Users Today",
      value: analytics?.activeUsersToday || 0,
      icon: TrendingUp,
      description: "Users active in last 24 hours",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Track platform usage and user activity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`value-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Monthly generation statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CVs Generated</span>
              <span className="text-2xl font-bold" data-testid="value-cvs-this-month">
                {analytics?.cvGeneratedThisMonth || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cover Letters Generated</span>
              <span className="text-2xl font-bold" data-testid="value-cover-letters-this-month">
                {analytics?.coverLettersThisMonth || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>System performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg. CVs per User</span>
              <span className="text-2xl font-bold">
                {analytics?.totalCVs && analytics?.activeUsersToday 
                  ? (analytics.totalCVs / Math.max(analytics.activeUsersToday, 1)).toFixed(1)
                  : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg. AI Runs per User</span>
              <span className="text-2xl font-bold">
                {analytics?.totalAIRuns && analytics?.activeUsersToday 
                  ? (analytics.totalAIRuns / Math.max(analytics.activeUsersToday, 1)).toFixed(1)
                  : '0'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
