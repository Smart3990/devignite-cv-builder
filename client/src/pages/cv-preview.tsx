import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Sparkles, Info, Wand2 } from "lucide-react";
import type { Cv, Template } from "@shared/schema";
import { CVTemplate } from "@/components/cv-templates";
import { enhanceCVContent, suggestATSImprovements } from "@/lib/cv-enhancer";
import { AIFeaturesPanel } from "@/components/ai-features-panel";

export default function CVPreviewPage() {
  const [, setLocation] = useLocation();
  const [cvData, setCvData] = useState<Cv | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("azurill");
  const [enhanceContent, setEnhanceContent] = useState(true);

  // Fetch templates
  const { data: templates } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  useEffect(() => {
    const pendingCV = localStorage.getItem('pending-cv');
    if (pendingCV) {
      const parsedCV = JSON.parse(pendingCV);
      setCvData(parsedCV);
      
      // Set template from CV data if available
      if (parsedCV.templateId) {
        setSelectedTemplate(parsedCV.templateId);
      }
    } else {
      setLocation('/create');
    }
  }, [setLocation]);

  // Enhanced CV data with professional formatting
  const enhancedCV = useMemo(() => {
    if (!cvData) return null;
    if (!enhanceContent) return cvData;
    return enhanceCVContent(cvData);
  }, [cvData, enhanceContent]);

  // ATS suggestions
  const atssuggestions = useMemo(() => {
    if (!cvData) return [];
    return suggestATSImprovements(cvData);
  }, [cvData]);

  // Save selected template to localStorage
  useEffect(() => {
    if (cvData && selectedTemplate) {
      const updatedCV = { ...cvData, templateId: selectedTemplate };
      setCvData(updatedCV);
      localStorage.setItem('pending-cv', JSON.stringify(updatedCV));
    }
  }, [selectedTemplate]);

  if (!cvData || !enhancedCV) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation('/create')}
              data-testid="button-back-to-edit"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Edit
            </Button>
            <Button asChild data-testid="button-finalize-pay">
              <a href="/pricing">Finalize & Pay</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          {/* CV Preview - Uses dynamic template */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm overflow-hidden" data-testid="card-cv-preview">
              <CVTemplate data={enhancedCV} templateId={selectedTemplate} />
            </div>
          </div>

          {/* Customization Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Tabs defaultValue="customize" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="customize" data-testid="tab-customize">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Customize
                  </TabsTrigger>
                  <TabsTrigger value="ai-tools" data-testid="tab-ai-tools">
                    <Wand2 className="h-4 w-4 mr-2" />
                    AI Tools
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="customize" className="space-y-6 mt-6">
                  {/* Content Enhancement */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Professional Enhancement</h3>
                      <Button
                        variant={enhanceContent ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEnhanceContent(!enhanceContent)}
                        data-testid="button-toggle-enhancement"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {enhanceContent ? "ON" : "OFF"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically improves formatting, capitalization, and ATS compatibility
                    </p>
                  </Card>

                  {/* Template Selection */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Template Style</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template-select">Choose Design</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                          <SelectTrigger id="template-select" className="mt-2" data-testid="select-template">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {templates?.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                                {template.isPremium === 1 && " ⭐"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2">
                          {templates?.find(t => t.id === selectedTemplate)?.description}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* ATS Suggestions */}
                  {atssuggestions.length > 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-semibold mb-2">ATS Optimization Tips:</p>
                        <ul className="text-sm space-y-1">
                          {atssuggestions.slice(0, 3).map((suggestion, index) => (
                            <li key={index} className="text-muted-foreground">• {suggestion}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Quick Actions */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Next Steps</h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setLocation('/create')}
                        data-testid="button-edit-content"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Edit Content
                      </Button>
                      <Button
                        className="w-full"
                        asChild
                        data-testid="button-proceed-payment"
                      >
                        <a href="/pricing">Proceed to Payment</a>
                      </Button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Your CV will be formatted and ready for download after payment
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="ai-tools" className="mt-6">
                  <AIFeaturesPanel 
                    cvData={cvData} 
                    onCVUpdate={(updatedCV) => {
                      setCvData(updatedCV);
                      localStorage.setItem('pending-cv', JSON.stringify(updatedCV));
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
