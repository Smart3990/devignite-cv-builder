import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Download, Sparkles } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const coverLetterFormSchema = z.object({
  cvId: z.string().optional(),
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  jobDescription: z.string().optional(),
  tone: z.enum(["formal", "friendly", "confident"]).default("formal"),
});

type CoverLetterForm = z.infer<typeof coverLetterFormSchema>;

interface GeneratedCoverLetter {
  content: string;
  greeting: string;
  opening: string;
  body: string[];
  closing: string;
  signature: string;
}

export default function CoverLetterPage() {
  const { toast } = useToast();
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedCoverLetter | null>(null);
  
  const form = useForm<CoverLetterForm>({
    resolver: zodResolver(coverLetterFormSchema),
    defaultValues: {
      jobTitle: "",
      companyName: "",
      jobDescription: "",
      tone: "formal",
    },
  });

  // Fetch user's CVs
  const { data: cvs = [], isLoading: cvsLoading } = useQuery({
    queryKey: ["/api/cvs"],
    queryFn: async () => {
      const response = await fetch("/api/cvs");
      if (!response.ok) throw new Error("Failed to fetch CVs");
      return await response.json();
    },
  });

  // Generate cover letter mutation
  const generateMutation = useMutation({
    mutationFn: async (data: CoverLetterForm) => {
      // Get the selected CV data
      let cvData = null;
      if (data.cvId && data.cvId !== "none") {
        const response = await fetch(`/api/cvs/${data.cvId}`);
        if (!response.ok) throw new Error("Failed to load CV");
        cvData = await response.json();
      }
      
      const response = await apiRequest("POST", "/api/ai/generate-cover-letter", {
        cv: cvData,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        jobDescription: data.jobDescription,
        tone: data.tone,
      });
      
      return await response.json() as GeneratedCoverLetter;
    },
    onSuccess: (data) => {
      setGeneratedLetter(data);
      toast({
        title: "Cover letter generated!",
        description: "Your cover letter has been created successfully.",
      });
    },
    onError: (error: any) => {
      // Handle quota exceeded errors
      if (error.message?.includes("limit reached") || error.message?.includes("usage limit")) {
        toast({
          title: "Usage limit reached",
          description: error.message || "You've reached your plan's limit. Please upgrade to continue.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation failed",
          description: error.message || "Failed to generate cover letter. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Download PDF mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!generatedLetter) throw new Error("No cover letter to download");
      
      const response = await fetch("/api/ai/cover-letter-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedLetter),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate PDF");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover-letter-${form.getValues("companyName")}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "PDF downloaded",
        description: "Your cover letter PDF has been downloaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download failed",
        description: error.message || "Failed to download PDF",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CoverLetterForm) => {
    generateMutation.mutate(data);
  };

  const toneDescriptions: Record<string, string> = {
    formal: "Professional and respectful, ideal for corporate positions",
    friendly: "Warm and approachable, great for startups and creative roles",
    confident: "Bold and assertive, perfect for leadership positions",
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Cover Letter Generator</h1>
        <p className="text-muted-foreground">
          Create personalized cover letters tailored to specific job applications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Cover Letter Details
            </CardTitle>
            <CardDescription>
              Fill in the job details and select your CV to generate a tailored cover letter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* CV Selection */}
                <FormField
                  control={form.control}
                  name="cvId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Your CV (Optional)</FormLabel>
                      <Select
                        disabled={cvsLoading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-cv">
                            <SelectValue placeholder={cvsLoading ? "Loading CVs..." : "Choose a CV or leave blank"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none" data-testid="cv-option-none">No CV (Manual)</SelectItem>
                          {Array.isArray(cvs) && cvs.map((cv: any) => (
                            <SelectItem key={cv.id} value={cv.id} data-testid={`cv-option-${cv.id}`}>
                              {cv.fullName} - {new Date(cv.createdAt).toLocaleDateString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a CV to auto-fill your information
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Job Title */}
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Senior Software Engineer" 
                          {...field} 
                          data-testid="input-job-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company Name */}
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., TechCorp Inc." 
                          {...field} 
                          data-testid="input-company-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Job Description */}
                <FormField
                  control={form.control}
                  name="jobDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste the job description here for a more tailored cover letter..."
                          className="min-h-[100px] resize-none"
                          {...field}
                          data-testid="input-job-description"
                        />
                      </FormControl>
                      <FormDescription>
                        Including the job description helps create a more targeted letter
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tone Selection */}
                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-tone">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="formal" data-testid="tone-option-formal">
                            <div className="flex flex-col">
                              <span className="font-medium">Formal</span>
                              <span className="text-xs text-muted-foreground">
                                {toneDescriptions.formal}
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="friendly" data-testid="tone-option-friendly">
                            <div className="flex flex-col">
                              <span className="font-medium">Friendly</span>
                              <span className="text-xs text-muted-foreground">
                                {toneDescriptions.friendly}
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="confident" data-testid="tone-option-confident">
                            <div className="flex flex-col">
                              <span className="font-medium">Confident</span>
                              <span className="text-xs text-muted-foreground">
                                {toneDescriptions.confident}
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={generateMutation.isPending}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>Preview</CardTitle>
              </div>
              {generatedLetter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadMutation.mutate()}
                  disabled={downloadMutation.isPending}
                  data-testid="button-download"
                >
                  {downloadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-3 w-3" />
                      Download PDF
                    </>
                  )}
                </Button>
              )}
            </div>
            <CardDescription>
              {generatedLetter 
                ? "Your AI-generated cover letter is ready" 
                : "Fill the form to generate your cover letter"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedLetter ? (
              <div className="space-y-4" data-testid="preview-content">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedLetter.content}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" data-testid="badge-tone">
                    Tone: {form.getValues("tone")}
                  </Badge>
                  <Badge variant="secondary" data-testid="badge-company">
                    {form.getValues("companyName")}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No cover letter yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Fill in the job details on the left and click "Generate Cover Letter" to create your personalized letter
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
