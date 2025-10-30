import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Download, Clock, CheckCircle, AlertCircle, RefreshCw, Edit, Mail, FileText, Crown } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

export default function DashboardPage() {
  const { toast } = useToast();
  const { data: orders = [], isLoading, error, refetch } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    refetchInterval: (data) => {
      // Auto-refresh if any order is still processing
      if (!Array.isArray(data)) return false;
      const hasProcessing = data.some((order: Order) => order.status === "processing");
      return hasProcessing ? 3000 : false; // Refresh every 3 seconds if processing
    },
  });

  const handleDownload = async (orderId: string, fileName: string, type: string = 'cv') => {
    try {
      const response = await fetch(`/api/orders/${orderId}/download/${type}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      const typeLabel = type === 'cv' ? 'CV' : type === 'cover-letter' ? 'Cover Letter' : 'LinkedIn Profile';
      toast({
        title: "Download Started",
        description: `Your ${typeLabel} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-24 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Failed to load orders</h3>
            <p className="text-muted-foreground mb-4">Please try again</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-dashboard-title">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">
            View and manage your CV orders
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No Orders Yet</h3>
              <p className="text-muted-foreground">
                Start creating your professional CV today
              </p>
              <Button asChild data-testid="button-create-first-cv">
                <Link href="/create">Create Your First CV</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 hover-elevate transition-all" data-testid={`card-order-${order.id}`}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold capitalize">
                            {order.packageType.replace('_', ' ')} Package
                          </h3>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Order #{order.id} • Created{' '}
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          GHS {(order.amount / 100).toFixed(0)}
                        </p>
                      </div>
                    </div>

                    {order.status === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Processing</span>
                          <span className="font-medium">{order.progress}%</span>
                        </div>
                        <Progress value={order.progress} className="h-2" data-testid={`progress-order-${order.id}`} />
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Estimated completion: 2-3 minutes
                        </p>
                      </div>
                    )}

                    {order.status === 'completed' && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Completed on{' '}
                          {order.completedAt ? new Date(order.completedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          }) : 'N/A'}
                        </div>
                        
                        <Separator className="my-3" />
                        
                        {/* Package Features */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Templates</p>
                            <p className="font-semibold">{order.templateCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Edits Left</p>
                            <p className="font-semibold">
                              {order.editsRemaining === 999 ? "Unlimited" : order.editsRemaining}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-muted-foreground mb-1">Includes</p>
                            <div className="flex flex-wrap gap-1">
                              {order.hasCoverLetter === 1 && (
                                <Badge variant="secondary" className="text-xs">Cover Letter</Badge>
                              )}
                              {order.hasLinkedInOptimization === 1 && (
                                <Badge variant="secondary" className="text-xs">LinkedIn</Badge>
                              )}
                              {order.hasCoverLetter === 0 && order.hasLinkedInOptimization === 0 && (
                                <span className="text-muted-foreground text-xs">CV Only</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex md:flex-col gap-2">
                    {order.status === 'completed' && (
                      <>
                        <Button 
                          className="w-full md:w-auto" 
                          onClick={() => handleDownload(order.id, order.pdfFileName || 'CV.pdf', 'cv')}
                          data-testid={`button-download-cv-${order.id}`}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download CV
                        </Button>
                        
                        {order.hasCoverLetter === 1 && (
                          <Button 
                            variant="outline"
                            className="w-full md:w-auto" 
                            onClick={() => handleDownload(order.id, `Cover_Letter_${order.id}.pdf`, 'cover-letter')}
                            data-testid={`button-download-cover-letter-${order.id}`}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Cover Letter
                          </Button>
                        )}
                        
                        {order.hasLinkedInOptimization === 1 && (
                          <Button 
                            variant="outline"
                            className="w-full md:w-auto" 
                            onClick={() => handleDownload(order.id, `LinkedIn_Profile_${order.id}.pdf`, 'linkedin')}
                            data-testid={`button-download-linkedin-${order.id}`}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            LinkedIn Profile
                          </Button>
                        )}
                        
                        {order.editsRemaining > 0 && (
                          <Button
                            variant="outline"
                            className="w-full md:w-auto"
                            asChild
                            data-testid={`button-edit-${order.id}`}
                          >
                            <Link href={`/cv/${order.cvId}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit CV
                            </Link>
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          className="w-full md:w-auto"
                          asChild
                          data-testid={`button-view-details-${order.id}`}
                        >
                          <Link href={`/order/success?orderId=${order.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Details
                          </Link>
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'processing' && (
                      <Button
                        variant="outline"
                        className="w-full md:w-auto"
                        disabled
                        data-testid={`button-processing-${order.id}`}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Processing...
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="outline" asChild data-testid="button-create-another">
            <Link href="/create">Create Another CV</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: any; label: string }> = {
    pending: { variant: "secondary", label: "Pending" },
    processing: { variant: "default", label: "Processing" },
    completed: { variant: "default", label: "Completed" },
    failed: { variant: "destructive", label: "Failed" },
  };

  const config = variants[status] || variants.pending;

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}
