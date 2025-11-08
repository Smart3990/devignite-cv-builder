import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const PLAN_FEATURES = {
  basic: {
    name: "Basic",
    price: "Free",
    color: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
    features: [
      "1 CV per month",
      "Basic templates",
      "PDF download",
      "1 AI optimization",
    ],
  },
  pro: {
    name: "Pro",
    price: "GHS 50",
    popular: true,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100",
    features: [
      "10 CVs per month",
      "All templates (including premium)",
      "PDF & Word downloads",
      "5 AI optimizations",
      "Cover letter generation",
      "ATS compatibility check",
    ],
  },
  premium: {
    name: "Premium",
    price: "GHS 99",
    color: "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-900 dark:text-purple-100",
    features: [
      "Unlimited CVs",
      "All premium templates",
      "All file formats",
      "Unlimited AI optimizations",
      "Unlimited cover letters",
      "LinkedIn profile optimization",
      "ATS compatibility check",
      "Priority support",
    ],
  },
};

export default function UpgradePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const upgradeMutation = useMutation({
    mutationFn: async (plan: string) => {
      const res = await apiRequest("POST", "/api/user/upgrade-plan", { plan });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/plan-status"] });
      
      toast({
        title: "Plan Upgraded!",
        description: `You're now on the ${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} plan.`,
      });
      
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    const currentPlan = (user as any).currentPlan || 'basic';
    
    // Validate upgrade path
    const planOrder = ['basic', 'pro', 'premium'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(planId);
    
    if (targetIndex <= currentIndex) {
      toast({
        title: "Invalid Upgrade",
        description: targetIndex === currentIndex 
          ? "You're already on this plan." 
          : "You can only upgrade to a higher plan.",
        variant: "destructive",
      });
      return;
    }

    upgradeMutation.mutate(planId);
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your account...</p>
        </Card>
      </div>
    );
  }

  const currentPlan = user ? (user as any).currentPlan : 'basic';

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild data-testid="button-back">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Upgrade Your Plan</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-upgrade-title">
            Choose the Perfect Plan
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock more features, increase your limits, and take your career to the next level
          </p>
        </div>

        {/* Current Plan Badge */}
        {currentPlan && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-lg border">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm">
                Current Plan: <span className="font-semibold">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</span>
              </span>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(PLAN_FEATURES).map(([planId, plan]) => {
            const isCurrentPlan = currentPlan === planId;
            const canUpgrade = ['basic', 'pro', 'premium'].indexOf(planId) > ['basic', 'pro', 'premium'].indexOf(currentPlan);
            const isProcessing = upgradeMutation.isPending && upgradeMutation.variables === planId;

            return (
              <Card
                key={planId}
                className={`p-6 relative ${
                  'popular' in plan && plan.popular ? 'border-primary border-2 shadow-lg scale-105' : ''
                } ${isCurrentPlan ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                data-testid={`card-plan-${planId}`}
              >
                {'popular' in plan && plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-4 ${plan.color}`}>
                    <Crown className="h-5 w-5" />
                    <span className="font-bold">{plan.name}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {planId !== 'basic' && <span className="text-muted-foreground ml-2">/month</span>}
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleUpgrade(planId)}
                  className="w-full"
                  size="lg"
                  variant={isCurrentPlan ? "outline" : ('popular' in plan && plan.popular) ? "default" : "secondary"}
                  disabled={isCurrentPlan || !canUpgrade || isProcessing}
                  data-testid={`button-upgrade-${planId}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : !canUpgrade ? (
                    "Lower Plan"
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* FAQ/Info Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Upgrade Benefits
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Instant activation - Start using new features immediately</li>
              <li>✅ No hidden fees - One simple monthly price</li>
              <li>✅ Cancel anytime - No long-term commitment required</li>
              <li>✅ All data preserved - Keep all your existing CVs and documents</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
