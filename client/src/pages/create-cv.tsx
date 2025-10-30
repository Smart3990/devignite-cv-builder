import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { PersonalInfoStep } from "@/components/cv-wizard/personal-info-step";
import { ExperienceStep } from "@/components/cv-wizard/experience-step";
import { EducationSkillsStep } from "@/components/cv-wizard/education-skills-step";
import { OptionalDetailsStep } from "@/components/cv-wizard/optional-details-step";
import { TemplateSelectionStep } from "@/components/cv-wizard/template-selection-step";
import { insertCvSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";

const steps = [
  { id: 1, title: "Personal Info", component: PersonalInfoStep },
  { id: 2, title: "Experience", component: ExperienceStep },
  { id: 3, title: "Education & Skills", component: EducationSkillsStep },
  { id: 4, title: "Optional Details", component: OptionalDetailsStep },
  { id: 5, title: "Template Selection", component: TemplateSelectionStep },
];

const getDefaultValues = () => {
  // Try to load existing CV from localStorage
  const savedCv = localStorage.getItem('pending-cv');
  if (savedCv) {
    try {
      const cvData = JSON.parse(savedCv);
      // CV structure is flat, not nested
      return {
        fullName: cvData.fullName || "",
        email: cvData.email || "",
        phone: cvData.phone || "",
        location: cvData.location || "",
        website: cvData.website || "",
        linkedin: cvData.linkedin || "",
        github: cvData.github || "",
        summary: cvData.summary || "",
        experience: cvData.experience || [],
        education: cvData.education || [],
        skills: cvData.skills || [],
        certifications: cvData.certifications || [],
        achievements: cvData.achievements || [],
        photoUrl: cvData.photoUrl || "",
        customSections: cvData.customSections || [],
        references: cvData.references || [],
        templateId: cvData.templateId || undefined,
      };
    } catch (e) {
      console.error("Failed to parse saved CV:", e);
    }
  }
  
  return {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    achievements: [],
    photoUrl: "",
    customSections: [],
    references: [],
    templateId: undefined,
  };
};

export default function CreateCVPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [existingCvId, setExistingCvId] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof insertCvSchema>>({
    resolver: zodResolver(insertCvSchema),
    defaultValues: getDefaultValues(),
  });

  // Load existing CV data on mount
  useEffect(() => {
    const loadExistingCv = () => {
      const savedCv = localStorage.getItem('pending-cv');
      if (savedCv) {
        try {
          const cvData = JSON.parse(savedCv);
          if (cvData.id) {
            setExistingCvId(cvData.id);
          }
          // CV structure is flat, not nested - reset form with loaded data
          form.reset({
            fullName: cvData.fullName || "",
            email: cvData.email || "",
            phone: cvData.phone || "",
            location: cvData.location || "",
            website: cvData.website || "",
            linkedin: cvData.linkedin || "",
            github: cvData.github || "",
            summary: cvData.summary || "",
            experience: cvData.experience || [],
            education: cvData.education || [],
            skills: cvData.skills || [],
            certifications: cvData.certifications || [],
            achievements: cvData.achievements || [],
            photoUrl: cvData.photoUrl || "",
            customSections: cvData.customSections || [],
            references: cvData.references || [],
            templateId: cvData.templateId || undefined,
          });
        } catch (e) {
          console.error("Failed to load saved CV:", e);
        }
      } else {
        // Starting fresh - clear premium feature flags
        localStorage.removeItem('used-cover-letter');
        localStorage.removeItem('used-linkedin');
      }
    };
    
    loadExistingCv();
  }, [form]);

  const progress = (currentStep / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep - 1].component;

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createCvMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertCvSchema>) => {
      // If updating existing CV, use PATCH, otherwise POST
      if (existingCvId) {
        const response = await apiRequest("PATCH", `/api/cvs/${existingCvId}`, data);
        return await response.json();
      } else {
        const response = await apiRequest("POST", "/api/cvs", data);
        return await response.json();
      }
    },
    onSuccess: (savedCv) => {
      console.log('[CREATE-CV] Received saved CV from API:', { id: savedCv.id, templateId: savedCv.templateId });
      // Save CV data with ID to localStorage
      localStorage.setItem('pending-cv', JSON.stringify(savedCv));
      setExistingCvId(savedCv.id);
      setLocation('/preview');
    },
    onError: (error) => {
      console.error("Error creating CV:", error);
      toast({
        title: "Error",
        description: "Failed to save your CV. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof insertCvSchema>) => {
    console.log('[CREATE-CV] Submitting CV data:', { templateId: data.templateId, fullName: data.fullName });
    createCvMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-2 ${
                  step.id === currentStep ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    step.id <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  data-testid={`step-indicator-${step.id}`}
                >
                  {step.id}
                </div>
                <span className="text-xs md:text-sm font-medium hidden sm:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>

        {/* Step Content */}
        <Card className="p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2" data-testid="text-step-title">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-muted-foreground text-sm">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CurrentStepComponent form={form} />

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  data-testid="button-back"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    data-testid="button-continue"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    data-testid="button-preview"
                    disabled={createCvMutation.isPending}
                  >
                    {createCvMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Preview CV
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}

function getFieldsForStep(step: number): (keyof z.infer<typeof insertCvSchema>)[] {
  switch (step) {
    case 1:
      return ["fullName", "email", "phone", "location"];
    case 2:
      return ["experience"];
    case 3:
      return ["education", "skills"];
    case 4:
      return []; // Optional Details - all fields are optional
    case 5:
      return ["templateId"];
    default:
      return [];
  }
}
