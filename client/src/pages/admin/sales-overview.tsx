import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Users, TrendingUp, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SalesData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  planDistribution: {
    basic: number;
    pro: number;
    premium: number;
  };
}

export default function SalesOverviewPage() {
  const { data: salesData, isLoading } = useQuery({
    queryKey: ["/api/admin/sales"],
    queryFn: async () => {
      const response = await fetch("/api/admin/sales");
      if (!response.ok) throw new Error("Failed to fetch sales data");
      return await response.json() as SalesData;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sales data...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: `GHS ${salesData?.totalRevenue || 0}`,
      icon: DollarSign,
      description: "All-time revenue",
      color: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: `GHS ${salesData?.monthlyRevenue || 0}`,
      icon: TrendingUp,
      description: "This month",
      color: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: salesData?.totalOrders || 0,
      icon: CreditCard,
      description: "Successful payments",
      color: "text-purple-600",
    },
    {
      title: "Active Users",
      value: 
        (salesData?.planDistribution.basic || 0) +
        (salesData?.planDistribution.pro || 0) +
        (salesData?.planDistribution.premium || 0),
      icon: Users,
      description: "All plan tiers",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sales Overview</h1>
        <p className="text-muted-foreground">
          Monitor revenue, orders, and plan distribution
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`value-${stat.title.toLowerCase().replace(' ', '-')}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
          <CardDescription>
            Number of users on each pricing tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Basic</Badge>
                <span className="text-sm text-muted-foreground">Free plan</span>
              </div>
              <span className="text-2xl font-bold" data-testid="count-basic-users">
                {salesData?.planDistribution.basic || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Pro</Badge>
                <span className="text-sm text-muted-foreground">GHS 50/month</span>
              </div>
              <span className="text-2xl font-bold" data-testid="count-pro-users">
                {salesData?.planDistribution.pro || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Premium</Badge>
                <span className="text-sm text-muted-foreground">GHS 99/month</span>
              </div>
              <span className="text-2xl font-bold" data-testid="count-premium-users">
                {salesData?.planDistribution.premium || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
