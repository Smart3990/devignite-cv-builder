import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Crown,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";

interface LimitInfo {
  label: string;
  current: number;
  limit: number;
  icon: React.ReactNode;
  color: "green" | "yellow" | "red";
}

interface UsageLimitsCardProps {
  planName: string;
  limits: LimitInfo[];
  showUpgradeButton?: boolean;
  compact?: boolean;
}

export function UsageLimitsCard({ 
  planName, 
  limits, 
  showUpgradeButton = true,
  compact = false
}: UsageLimitsCardProps) {
  const getColorClasses = (color: "green" | "yellow" | "red") => {
    switch (color) {
      case "green":
        return {
          badge: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
          icon: "text-green-600 dark:text-green-400",
          progress: "bg-green-500"
        };
      case "yellow":
        return {
          badge: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
          icon: "text-yellow-600 dark:text-yellow-400",
          progress: "bg-yellow-500"
        };
      case "red":
        return {
          badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
          icon: "text-red-600 dark:text-red-400",
          progress: "bg-red-500"
        };
    }
  };

  if (compact) {
    return (
      <Card className="p-4" data-testid="card-usage-limits-compact">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{planName} Plan</span>
          </div>
          {showUpgradeButton && planName !== "Premium" && (
            <Button size="sm" variant="outline" asChild data-testid="button-upgrade-compact">
              <Link href="/pricing">
                <TrendingUp className="h-3 w-3 mr-1" />
                Upgrade
              </Link>
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {limits.map((limit, index) => {
            const percentage = limit.limit === -1 ? 100 : (limit.current / limit.limit) * 100;
            const colors = getColorClasses(limit.color);
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{limit.label}</span>
                  <span className="font-medium">
                    {limit.current}/{limit.limit === -1 ? "∞" : limit.limit}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-1.5"
                  data-testid={`progress-${limit.label.toLowerCase().replace(/\s+/g, '-')}`}
                />
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" data-testid="card-usage-limits">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold" data-testid="text-plan-name">{planName} Plan</h3>
            <p className="text-sm text-muted-foreground">Your current usage</p>
          </div>
        </div>
        {showUpgradeButton && planName !== "Premium" && (
          <Button variant="outline" asChild data-testid="button-upgrade">
            <Link href="/pricing">
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Link>
          </Button>
        )}
      </div>

      {/* Usage Limits */}
      <div className="space-y-4">
        {limits.map((limit, index) => {
          const percentage = limit.limit === -1 ? 100 : (limit.current / limit.limit) * 100;
          const isAtLimit = limit.current >= limit.limit && limit.limit !== -1;
          const isNearLimit = percentage >= 80 && limit.limit !== -1;
          const colors = getColorClasses(limit.color);

          return (
            <div 
              key={index} 
              className="space-y-2"
              data-testid={`limit-${limit.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={colors.icon}>
                    {limit.icon}
                  </div>
                  <span className="text-sm font-medium">{limit.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {limit.current}/{limit.limit === -1 ? "Unlimited" : limit.limit}
                  </span>
                  {isAtLimit ? (
                    <AlertCircle className={`h-4 w-4 ${colors.icon}`} />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2"
                  data-testid={`progress-${limit.label.toLowerCase().replace(/\s+/g, '-')}`}
                />
                {(isAtLimit || isNearLimit) && (
                  <div className={`flex items-center gap-1 text-xs ${colors.icon}`}>
                    <AlertCircle className="h-3 w-3" />
                    <span data-testid={`warning-${limit.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {isAtLimit 
                        ? "Limit reached! Upgrade to continue." 
                        : "Approaching limit"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Message */}
      {limits.some(l => l.current >= l.limit && l.limit !== -1) && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                You've reached your plan limits
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Upgrade to a higher plan to unlock more features and increase your limits.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// Helper component for displaying usage in a banner format
export function UsageLimitBanner({ limit, showIcon = true }: { 
  limit: LimitInfo;
  showIcon?: boolean;
}) {
  const percentage = limit.limit === -1 ? 0 : (limit.current / limit.limit) * 100;
  const isAtLimit = limit.current >= limit.limit && limit.limit !== -1;
  const isNearLimit = percentage >= 80 && limit.limit !== -1;
  
  if (!isAtLimit && !isNearLimit) return null;

  const colors = isAtLimit ? {
    bg: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
    text: "text-red-900 dark:text-red-200",
    icon: "text-red-600 dark:text-red-400"
  } : {
    bg: "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-900 dark:text-yellow-200",
    icon: "text-yellow-600 dark:text-yellow-400"
  };

  return (
    <div 
      className={`p-3 rounded-lg border ${colors.bg} ${colors.text}`}
      data-testid="banner-usage-limit"
    >
      <div className="flex items-center gap-3">
        {showIcon && (
          <AlertCircle className={`h-5 w-5 flex-shrink-0 ${colors.icon}`} />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">
            {isAtLimit 
              ? `${limit.label} limit reached (${limit.current}/${limit.limit})`
              : `${limit.label}: ${limit.current}/${limit.limit} used`}
          </p>
          {isAtLimit && (
            <p className="text-xs mt-1 opacity-90">
              Upgrade your plan to continue using this feature.
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" asChild data-testid="button-upgrade-banner">
          <Link href="/pricing">Upgrade</Link>
        </Button>
      </div>
    </div>
  );
}

// Icon mapping helper
export const usageLimitIcons = {
  cvs: <FileText className="h-4 w-4" />,
  aiRuns: <Sparkles className="h-4 w-4" />,
  coverLetters: <FileText className="h-4 w-4" />,
  templates: <Crown className="h-4 w-4" />,
};
