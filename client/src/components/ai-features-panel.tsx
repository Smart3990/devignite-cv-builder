import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  FileText,
  Linkedin,
  TrendingUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Crown,
} from "lucide-react";
import type { Cv } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIFeaturesPanelProps {
  cvData: Cv;
  onCVUpdate?: (updatedCV: Cv) => void;
}

export function AIFeaturesPanel({ cvData, onCVUpdate }: AIFeaturesPanelProps) {
  const { toast } = useToast();
  const [optimizedCV, setOptimizedCV] = useState<Cv | null>(null);
  const [coverLetterData, setCoverLetterData] = useState<any>(null);
  const [linkedInProfile, setLinkedInProfile] = useState<any>(null);
  const [atsAnalysis, setATSAnalysis] = useState<any>(null);

  // Cover letter form state
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // CV Optimization
  const optimizeCVMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/optimize-cv", cvData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to optimize CV");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      setOptimizedCV(data);
      if (onCVUpdate) {
        onCVUpdate(data);
      }
      toast({
        title: "CV Optimized!",
        description: "Your CV has been enhanced with professional language and ATS improvements.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Optimization Failed",
        description: error.message || "Could not optimize CV. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Cover Letter Generation
  const generateCoverLetterMutation = useMutation({
    mutationFn: async () => {
      if (!jobTitle || !companyName) {
        throw new Error("Job title and company name are required");
      }
      const res = await apiRequest("POST", "/api/ai/generate-cover-letter", {
        cv: cvData,
        jobTitle,
        companyName,
        jobDescription,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate cover letter");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      setCoverLetterData(data);
      // Track premium feature usage
      localStorage.setItem('used-cover-letter', 'true');
      toast({
        title: "Cover Letter Generated!",
        description: "Your professional cover letter is ready to preview. Purchase a package to download.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate cover letter. Please try again.",
        variant: "destructive",
      });
    },
  });

  // LinkedIn Optimization
  const optimizeLinkedInMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/optimize-linkedin", cvData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to optimize LinkedIn profile");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      setLinkedInProfile(data);
      // Track premium feature usage
      localStorage.setItem('used-linkedin', 'true');
      toast({
        title: "LinkedIn Profile Optimized!",
        description: "Your LinkedIn content is ready to copy.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Optimization Failed",
        description: error.message || "Could not optimize LinkedIn profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // ATS Analysis
  const analyzeATSMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/analyze-ats", cvData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to analyze CV for ATS");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      setATSAnalysis(data);
      toast({
        title: "ATS Analysis Complete!",
        description: `Your CV scored ${data.score}/100 for ATS compatibility.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not analyze CV. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const viewCoverLetterPDF = async () => {
    if (!coverLetterData) return;
    
    try {
      const res = await apiRequest("POST", "/api/ai/cover-letter-pdf", coverLetterData);
      if (!res.ok) throw new Error("Failed to generate PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: "Could not preview PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const viewLinkedInPDF = async () => {
    if (!linkedInProfile) return;
    
    try {
      const res = await apiRequest("POST", "/api/ai/linkedin-pdf", linkedInProfile);
      if (!res.ok) throw new Error("Failed to generate PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: "Could not preview PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Enhancement Header */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI-Powered Enhancements</h3>
            <p className="text-sm text-muted-foreground">Free professional tools powered by Groq AI</p>
          </div>
        </div>
      </Card>

      {/* CV Optimization */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-medium">CV Optimization</h4>
              <p className="text-sm text-muted-foreground">Enhance with professional language</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => optimizeCVMutation.mutate()}
            disabled={optimizeCVMutation.isPending}
            data-testid="button-optimize-cv"
          >
            {optimizeCVMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Optimize
              </>
            )}
          </Button>
        </div>
        {optimizedCV && (
          <Alert className="mt-3">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              CV optimized! Summary and experience descriptions have been enhanced.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Cover Letter Generation */}
      <Dialog>
        <DialogTrigger asChild>
          <Card className="p-6 hover-elevate cursor-pointer border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20" data-testid="card-cover-letter">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Cover Letter Generator</h4>
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                      <Crown className="h-3 w-3" />
                      PREMIUM
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Create personalized cover letters</p>
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Cover Letter</DialogTitle>
            <DialogDescription>
              Enter job details to create a personalized cover letter based on your CV.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="job-title">Job Title *</Label>
              <Input
                id="job-title"
                placeholder="e.g., Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                data-testid="input-job-title"
              />
            </div>
            <div>
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                placeholder="e.g., Tech Corp Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                data-testid="input-company-name"
              />
            </div>
            <div>
              <Label htmlFor="job-description">Job Description (Optional)</Label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here for better customization..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                data-testid="input-job-description"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => generateCoverLetterMutation.mutate()}
              disabled={generateCoverLetterMutation.isPending || !jobTitle || !companyName}
              data-testid="button-generate-cover-letter"
            >
              {generateCoverLetterMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </Button>
            {coverLetterData && (
              <div className="mt-4 space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Professional cover letter generated! Preview below. Purchase a package to download.
                  </AlertDescription>
                </Alert>
                
                <Button
                  className="w-full"
                  onClick={viewCoverLetterPDF}
                  data-testid="button-preview-cover-letter-pdf"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Preview PDF
                </Button>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Cover Letter Preview</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(coverLetterData.content, "Cover letter")}
                      data-testid="button-copy-cover-letter"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                  </div>
                  <div className="text-sm whitespace-pre-wrap max-h-96 overflow-y-auto" data-testid="text-cover-letter">
                    <p className="font-semibold mb-2">{coverLetterData.fullName}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {coverLetterData.email} • {coverLetterData.phone}
                      {coverLetterData.location && ` • ${coverLetterData.location}`}
                    </p>
                    <p className="mb-2 text-xs">{coverLetterData.date}</p>
                    <p className="mb-4">
                      Hiring Manager<br/>
                      {coverLetterData.companyName}<br/>
                      {coverLetterData.jobTitle} Position
                    </p>
                    <p className="mb-4">Dear Hiring Manager,</p>
                    {coverLetterData.content}
                    <p className="mt-4">Sincerely,</p>
                    <p className="mt-2 font-semibold">{coverLetterData.fullName}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* LinkedIn Optimization */}
      <Dialog>
        <DialogTrigger asChild>
          <Card className="p-6 hover-elevate cursor-pointer border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20" data-testid="card-linkedin">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Linkedin className="h-5 w-5 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">LinkedIn Optimizer</h4>
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                      <Crown className="h-3 w-3" />
                      PREMIUM
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Enhance your LinkedIn profile</p>
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>LinkedIn Profile Optimization</DialogTitle>
            <DialogDescription>
              Generate optimized content for your LinkedIn profile based on your CV.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Button
              className="w-full"
              onClick={() => optimizeLinkedInMutation.mutate()}
              disabled={optimizeLinkedInMutation.isPending}
              data-testid="button-optimize-linkedin"
            >
              {optimizeLinkedInMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate LinkedIn Content
                </>
              )}
            </Button>
            {linkedInProfile && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    LinkedIn profile optimized! Preview the comprehensive guide below. Purchase a package to download.
                  </AlertDescription>
                </Alert>
                
                <Button
                  className="w-full"
                  onClick={viewLinkedInPDF}
                  data-testid="button-preview-linkedin-pdf"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Preview PDF
                </Button>
                
                <div className="p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Optimized Headline</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(linkedInProfile.headline, "Headline")}
                      data-testid="button-copy-headline"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm mb-4 p-3 bg-primary/10 rounded" data-testid="text-linkedin-headline">
                    {linkedInProfile.headline}
                  </p>
                  
                  <div className="flex items-center justify-between mb-2 mt-4">
                    <h4 className="font-medium">About Section</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(linkedInProfile.about, "About section")}
                      data-testid="button-copy-about"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap mb-4" data-testid="text-linkedin-about">
                    {linkedInProfile.about}
                  </p>
                  
                  <h4 className="font-medium mb-2 mt-4">Profile Enhancement Suggestions</h4>
                  <ul className="space-y-2">
                    {linkedInProfile.suggestions.map((suggestion: string, idx: number) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Full optimization guide includes experience summary, skills optimization, and accomplishments sections. Purchase a package to download the complete PDF.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ATS Analysis */}
      <Dialog>
        <DialogTrigger asChild>
          <Card className="p-6 hover-elevate cursor-pointer" data-testid="card-ats-analysis">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">ATS Compatibility Check</h4>
                  <p className="text-sm text-muted-foreground">Score your CV for job applications</p>
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ATS Compatibility Analysis</DialogTitle>
            <DialogDescription>
              Check how well your CV performs with Applicant Tracking Systems.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Button
              className="w-full"
              onClick={() => analyzeATSMutation.mutate()}
              disabled={analyzeATSMutation.isPending}
              data-testid="button-analyze-ats"
            >
              {analyzeATSMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze CV
                </>
              )}
            </Button>
            {atsAnalysis && (
              <div className="space-y-4">
                <div className="p-6 bg-muted rounded-lg text-center">
                  <div className="text-5xl font-bold text-primary mb-2" data-testid="text-ats-score">
                    {atsAnalysis.score}/100
                  </div>
                  <p className="text-sm text-muted-foreground">ATS Compatibility Score</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {atsAnalysis.strengths.map((strength: string, idx: number) => (
                      <li key={idx} className="text-sm text-green-800 dark:text-green-200">• {strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Areas to Improve
                  </h4>
                  <ul className="space-y-1">
                    {atsAnalysis.weaknesses.map((weakness: string, idx: number) => (
                      <li key={idx} className="text-sm text-orange-800 dark:text-orange-200">• {weakness}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-2">
                    {atsAnalysis.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-primary font-medium mt-0.5">{idx + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
