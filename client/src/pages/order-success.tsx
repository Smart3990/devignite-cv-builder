import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Download, 
  Mail, 
  FileText, 
  Flame,
  Crown,
  Loader2,
  ChevronRight,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function OrderSuccessPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);

  // Get order ID from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get("orderId");

  // Fetch order details
  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      return response.json();
    },
    enabled: !!orderId,
  });

  // Set email from order data
  useEffect(() => {
    if (order) {
      // Fetch CV data to get user email
      fetch(`/api/cvs/${order.cvId}`)
        .then(res => res.json())
        .then(cv => {
          if (cv.email) {
            setEmail(cv.email);
          }
        })
        .catch(console.error);
    }
  }, [order]);

  // Download PDF mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/orders/${orderId}/download`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = order?.pdfFileName || `CV_${order?.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Your CV PDF is being downloaded.",
      });
    },
    onError: () => {
      toast({
        title: "Download Failed",
        description: "Failed to download CV. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/orders/${orderId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Sent!",
        description: `Your CV has been sent to ${email}`,
      });
    },
    onError: () => {
      toast({
        title: "Email Failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!orderId) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground">No order ID provided</p>
          <Button 
            className="mt-4" 
            onClick={() => setLocation("/")}
            data-testid="button-go-home"
          >
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order || order.status !== "completed") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-4">
            {order?.status === "processing" 
              ? "Your order is still being processed. Please check your dashboard for updates."
              : "Order not found or not completed yet."
            }
          </p>
          <Button 
            onClick={() => setLocation("/dashboard")}
            data-testid="button-go-dashboard"
          >
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const packageType = order.packageType as "basic" | "standard" | "premium";
  const isPremium = packageType === "premium";
  const hasStandard = packageType === "standard" || packageType === "premium";

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-primary/5 to-background -z-10" />
      
      <div className="max-w-5xl mx-auto py-8 space-y-6">
        {/* Success Header */}
        <Card className="p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Flame className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-success-title">
                Your CV is Ready!
              </h1>
              <p className="text-muted-foreground text-lg" data-testid="text-success-message">
                Congratulations! Your professional CV has been generated successfully.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge 
                  className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  data-testid="badge-order-status"
                >
                  Completed
                </Badge>
                {isPremium && (
                  <Badge className="bg-primary" data-testid="badge-package-type">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium Package
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Download & Email Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Download PDF */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Download Your CV</h3>
                <p className="text-sm text-muted-foreground">
                  Get your professionally formatted CV as a PDF file
                </p>
              </div>
            </div>
            
            <Button
              className="w-full"
              onClick={() => downloadMutation.mutate()}
              disabled={downloadMutation.isPending}
              data-testid="button-download-pdf"
            >
              {downloadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </Card>

          {/* Send via Email */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Send via Email</h3>
                <p className="text-sm text-muted-foreground">
                  Receive your CV directly in your inbox
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>
              
              <Button
                className="w-full"
                variant="outline"
                onClick={() => sendEmailMutation.mutate()}
                disabled={sendEmailMutation.isPending || !email}
                data-testid="button-send-email"
              >
                {sendEmailMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Package Features */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Your Package Includes
          </h3>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Templates Available</p>
                <p className="text-2xl font-bold text-primary">{order.templateCount}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Edits Remaining</p>
                <p className="text-2xl font-bold text-primary">
                  {order.editsRemaining === 999 ? "Unlimited" : order.editsRemaining}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Additional Features</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {order.hasCoverLetter === 1 && (
                    <Badge variant="secondary">Cover Letter</Badge>
                  )}
                  {order.hasLinkedInOptimization === 1 && (
                    <Badge variant="secondary">LinkedIn</Badge>
                  )}
                </div>
              </div>
            </div>
            
            {hasStandard && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Available Now:</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {order.coverLetterUrl && (
                      <Button variant="outline" className="justify-between">
                        <span>Download Cover Letter</span>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {order.linkedinOptimizationUrl && (
                      <Button variant="outline" className="justify-between">
                        <span>Download LinkedIn Guide</span>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">What's Next?</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Access Your Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  View all your orders and manage your CVs in one place
                </p>
              </div>
            </div>
            
            {order.editsRemaining > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Edit Your CV Anytime</p>
                  <p className="text-sm text-muted-foreground">
                    You have {order.editsRemaining === 999 ? "unlimited" : order.editsRemaining} edits available
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">{order.editsRemaining > 0 ? "3" : "2"}</span>
              </div>
              <div>
                <p className="font-medium">Download Anytime</p>
                <p className="text-sm text-muted-foreground">
                  Your CV will always be available in your dashboard for download
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-view-dashboard"
          >
            View Dashboard
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          
          {order.editsRemaining > 0 && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation(`/cv/${order.cvId}/edit`)}
              data-testid="button-edit-cv"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit CV
            </Button>
          )}
        </div>

        {/* Support */}
        <p className="text-center text-sm text-muted-foreground">
          Need help? Contact us at{" "}
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
  );
}
