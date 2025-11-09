import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Loader2, X, Crown, Sparkles } from "lucide-react";
import { PRICING_TIERS } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import pricingConfig from "../../../config/pricing.json";

export default function PricingPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [processingPackage, setProcessingPackage] = useState<string | null>(null);

  // Check if user has used premium features
  const usedCoverLetter = localStorage.getItem('used-cover-letter') === 'true';
  const usedLinkedIn = localStorage.getItem('used-linkedin') === 'true';
  const needsPremiumPackage = usedCoverLetter || usedLinkedIn;

  // Check authentication status
  const { data: user, isLoading: isLoadingAuth, error: authError } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Save CV mutation - saves CV to database before payment
  const saveCVMutation = useMutation({
    mutationFn: async (cvData: any) => {
      const res = await apiRequest("POST", "/api/cvs", cvData);
      return await res.json();
    },
  });

  const initializePayment = useMutation({
    mutationFn: async (data: { cvId: string; packageType: string; email: string }) => {
      const res = await apiRequest("POST", "/api/payments/initialize", data);
      return await res.json();
    },
    onSuccess: (data) => {
      // Redirect to Paystack payment page
      window.location.href = data.authorizationUrl;
    },
    onError: (error) => {
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setProcessingPackage(null);
    },
  });

  const handleSelectPackage = async (packageType: string) => {
    setProcessingPackage(packageType);
    
    // Wait for auth to resolve if still loading
    if (isLoadingAuth) {
      toast({
        title: "Please Wait",
        description: "Verifying authentication status...",
      });
      setProcessingPackage(null);
      return;
    }

    // Check if user is authenticated (after loading has completed)
    if (!user || authError) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your purchase.",
        variant: "destructive",
      });
      setProcessingPackage(null);
      // Redirect to login
      setLocation("/");
      return;
    }

    // Get CV data from localStorage
    const pendingCV = localStorage.getItem('pending-cv');
    if (!pendingCV) {
      toast({
        title: "Error",
        description: "No CV data found. Please create your CV first.",
        variant: "destructive",
      });
      setProcessingPackage(null);
      setLocation("/create");
      return;
    }

    const cvData = JSON.parse(pendingCV);

    try {
      // Save CV to database first (if it doesn't have an ID yet)
      let cvId = cvData.id;
      if (!cvId) {
        const savedCV = await saveCVMutation.mutateAsync(cvData);
        cvId = savedCV.id;
        // Update localStorage with saved CV ID
        localStorage.setItem('pending-cv', JSON.stringify(savedCV));
      }

      // Initialize payment with saved CV ID
      initializePayment.mutate({
        cvId,
        packageType,
        email: (user as any)?.email || cvData.email,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save CV. Please try again.",
        variant: "destructive",
      });
      setProcessingPackage(null);
    }
  };

  // Show loading state while checking auth
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-muted/30 py-12 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Loading Payment Options</h2>
          <p className="text-sm text-muted-foreground">Verifying your account...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-4">
          <Button variant="ghost" asChild data-testid="button-back">
            <Link href="/preview">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Preview
            </Link>
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-pricing-title">
            Choose Your Package
          </h1>
          <p className="text-muted-foreground text-lg">
            Select the perfect plan for your career needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {Object.entries(pricingConfig.plans).map(([key, plan]: [string, any]) => {
            // Hide Basic package if user has used premium features
            const isBasicPackage = key === 'basic';
            const shouldBlurBasic = needsPremiumPackage && isBasicPackage;
            
            return (
              <div key={key} className={`${plan.popular ? 'md:scale-105 md:-my-4' : ''}`}>
              <Card
                className={`relative transition-all duration-200 ${
                  plan.popular ? 'border-primary border-2 shadow-lg' : ''
                } ${shouldBlurBasic ? 'opacity-40 blur-sm pointer-events-none' : 'hover-elevate active-elevate-2'}`}
                data-testid={`card-package-${key}`}
              >
              {shouldBlurBasic && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-muted/90 backdrop-blur-sm px-4 py-2 rounded-lg text-center">
                    <p className="text-sm font-semibold">Not available</p>
                    <p className="text-xs text-muted-foreground">Premium features required</p>
                  </div>
                </div>
              )}
              
              {plan.popular && !shouldBlurBasic && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              {plan.badge && key === 'premium' && !shouldBlurBasic && (
                <div className="absolute -top-3 right-4 z-10">
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <div className="mb-1">
                      <span className="text-4xl font-bold">{plan.displayPrice}</span>
                      {plan.price > 0 && <span className="text-muted-foreground ml-2">/month</span>}
                    </div>
                    {plan.price > 0 && (
                      <p className="text-xs text-muted-foreground">Monthly subscription, cancel anytime</p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">What's Included</p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations && plan.limitations.length > 0 && plan.limitations[0] !== "None - Full access to all platform features!" && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Limitations</p>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {key === 'premium' && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <span className="font-medium text-amber-900 dark:text-amber-100">Full platform access with no restrictions!</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handleSelectPackage(key)}
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={processingPackage === key || initializePayment.isPending}
                  data-testid={`button-pay-${key}`}
                >
                  {processingPackage === key ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue to Payment"
                  )}
                </Button>
              </CardContent>
            </Card>
            </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Compare Plans</h2>
            <p className="text-muted-foreground">
              See which plan is right for you
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {pricingConfig.comparisonTable.headers.map((header: string, i: number) => (
                      <th key={i} className={`p-4 text-left font-semibold ${i === 0 ? 'sticky left-0 bg-muted/50' : 'text-center'}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricingConfig.comparisonTable.rows.map((row: any, i: number) => (
                    <tr key={i} className="border-t hover-elevate">
                      <td className="p-4 font-medium sticky left-0 bg-background">
                        {row.feature}
                      </td>
                      <td className="p-4 text-center">
                        {typeof row.basic === 'boolean' ? (
                          row.basic ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className="text-sm">{row.basic}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-medium">{row.pro}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof row.premium === 'boolean' ? (
                          row.premium ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-semibold text-primary">{row.premium}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="p-6 bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Secure Payment with Paystack</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  All payments are processed securely through Paystack with 256-bit SSL encryption.
                  We accept all major payment methods including cards, bank transfers, and mobile money.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-background rounded text-xs font-medium">
                    🔒 SSL Encrypted
                  </span>
                  <span className="px-2 py-1 bg-background rounded text-xs font-medium">
                    💳 Card Payments
                  </span>
                  <span className="px-2 py-1 bg-background rounded text-xs font-medium">
                    🏦 Bank Transfer
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
