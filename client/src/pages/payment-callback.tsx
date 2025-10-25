import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Flame, ArrowRight, AlertCircle, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function PaymentCallbackPage() {
  const [, setLocation] = useLocation();
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref");
    setReference(ref);
  }, []);

  const { data, isLoading, error } = useQuery<{
    status: string;
    orderId: string;
    message: string;
  }>({
    queryKey: ["/api/payments/verify", reference],
    enabled: !!reference,
    retry: false,
  });

  // Redirect to order success page after verification
  useEffect(() => {
    if (data?.status === "success" && data?.orderId) {
      // Order is completed immediately after payment verification
      // Small delay to show success message before redirect
      const redirectTimer = setTimeout(() => {
        setLocation(`/order/success?orderId=${data.orderId}`);
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }
  }, [data, setLocation]);

  // Loading/Verifying State
  if (isLoading || !reference) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3" data-testid="text-verifying-title">
              Verifying Your Payment
            </h2>
            <p className="text-muted-foreground text-lg mb-2" data-testid="text-verifying-message">
              Please wait while we confirm your payment with Paystack
            </p>
            <p className="text-sm text-muted-foreground" data-testid="text-verifying-subtitle">
              This usually takes just a few seconds...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Error/Failed State
  if (error || data?.status !== "success") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="p-8 md:p-12">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-destructive" data-testid="text-failed-title">
                  Payment Failed
                </h2>
                <p className="text-muted-foreground text-lg mb-4" data-testid="text-failed-message">
                  {error 
                    ? "We couldn't verify your payment. This might be a temporary issue." 
                    : data?.message || "Your payment was not successful."}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-6 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">What should you do?</p>
                    <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Check if you were charged and contact support</li>
                      <li>Ensure you have sufficient funds in your account</li>
                      <li>Try again with a different payment method</li>
                      <li>Contact your bank if the issue persists</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => setLocation("/pricing")} 
                  data-testid="button-try-again"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLocation("/")} 
                  data-testid="button-home"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background -z-10" />
      
      <div className="max-w-2xl w-full">
        <Card className="p-8 md:p-12 relative overflow-hidden">
          {/* Success Animation Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl -z-10" />
          
          <div className="text-center space-y-6">
            {/* Success Icon with Animation */}
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto relative">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Flame className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3" data-testid="text-success-title">
                Payment Successful!
              </h2>
              <p className="text-muted-foreground text-lg" data-testid="text-success-message">
                Your CV order has been received and is being processed
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-muted rounded-lg p-6 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1" data-testid="text-order-id-label">Order ID</p>
                  <p className="font-mono text-sm font-medium" data-testid="text-order-id">
                    {data.orderId}
                  </p>
                </div>
                <Badge 
                  className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                  data-testid="badge-payment-status"
                >
                  Paid
                </Badge>
              </div>
              
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Your CV is being processed</li>
                      <li>• You'll receive an email with your CV download link</li>
                      <li>• Track your order status on the dashboard</li>
                      <li>• Access your CV anytime from your account</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                className="flex-1"
                size="lg"
                onClick={() => setLocation("/dashboard")} 
                data-testid="button-view-dashboard"
              >
                View Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => setLocation("/")} 
                data-testid="button-home"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>

            {/* Footer Message */}
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Need help? Contact our support team at{" "}
                <a 
                  href="mailto:support@devignite.com" 
                  className="text-primary hover:underline"
                  data-testid="link-support-email"
                >
                  support@devignite.com
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
