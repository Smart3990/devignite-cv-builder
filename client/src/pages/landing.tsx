import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, FileText, Palette, Download, Sparkles, Crown, Flame } from "lucide-react";
import { PRICING_TIERS, type Template } from "@shared/schema";
import { CVTemplatePreview } from "@/components/cv-template-preview";
import { dummyCvData } from "@/lib/dummyData";
import { useAuth } from "@/hooks/useAuth";
import { SignUpButton } from "@clerk/clerk-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Fetch templates for gallery
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background -z-10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-40 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight" data-testid="text-hero-title">
              Create Your Professional CV in{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Minutes
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Build a stunning, ATS-friendly CV with our expertly designed templates.
              Professional results, zero hassle.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button 
                  size="lg" 
                  className="h-12 px-8" 
                  data-testid="button-hero-cta"
                  onClick={() => setLocation('/create')}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
              ) : (
                <SignUpButton 
                  mode="modal"
                  forceRedirectUrl="/create"
                >
                  <Button 
                    size="lg" 
                    className="h-12 px-8" 
                    data-testid="button-hero-cta"
                    disabled={isLoading}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Button>
                </SignUpButton>
              )}
              <Button size="lg" variant="outline" asChild className="h-12 px-8" data-testid="button-view-templates">
                <a href="#templates">View Templates</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-how-it-works-title">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Four simple steps to your perfect CV
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FileText,
                step: "01",
                title: "Fill Your Information",
                description: "Enter your details with our intuitive guided form",
              },
              {
                icon: Palette,
                step: "02",
                title: "Choose Template",
                description: "Select from professionally designed CV templates",
              },
              {
                icon: Sparkles,
                step: "03",
                title: "Preview & Customize",
                description: "Review and perfect your CV in real-time",
              },
              {
                icon: Download,
                step: "04",
                title: "Download & Use",
                description: "Get your polished CV ready for job applications",
              },
            ].map((item, i) => (
              <Card key={i} className="p-6 hover-elevate transition-all duration-200" data-testid={`card-step-${i + 1}`}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute -top-2 -right-2 text-xs font-bold text-primary/40">
                      {item.step}
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <section id="templates" className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-templates-title">
              Professional Templates
            </h2>
            <p className="text-muted-foreground text-lg">
              Expertly crafted designs that get you noticed
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden group hover-elevate transition-all duration-200" data-testid={`card-template-${template.id}`}>
                <div className="relative">
                  <CVTemplatePreview
                    data={dummyCvData}
                    templateId={template.id}
                    containerAspect={[3, 4]}
                    showWatermark={true}
                    className="rounded-t-md"
                  />
                  
                  {/* Premium badge */}
                  {template.isPremium === 1 && (
                    <Badge className="absolute top-3 right-3 bg-primary z-10 shadow-lg">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="p-4 border-t">
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-pricing-title">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose the package that fits your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {Object.entries(PRICING_TIERS).map(([key, tier]) => {
              const isPopular = key === 'standard';
              return (
              <Card 
                key={key} 
                className={`p-6 relative hover-elevate transition-all duration-200 ${
                  isPopular ? 'border-primary border-2' : ''
                }`}
                data-testid={`card-pricing-${key}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{tier.displayPrice}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {isAuthenticated ? (
                  <Button 
                    className="w-full" 
                    variant={isPopular ? "default" : "outline"}
                    data-testid={`button-select-${key}`}
                    onClick={() => setLocation('/create')}
                  >
                    Get Started
                  </Button>
                ) : (
                  <SignUpButton 
                    mode="modal"
                    forceRedirectUrl="/create"
                  >
                    <Button 
                      className="w-full" 
                      variant={isPopular ? "default" : "outline"}
                      data-testid={`button-select-${key}`}
                      disabled={isLoading}
                    >
                      Get Started
                    </Button>
                  </SignUpButton>
                )}
              </Card>
            );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-faq-title">
              Frequently Asked Questions
            </h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline" data-testid="accordion-faq-1">
                How long does it take to create a CV?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Most users complete their professional CV in under 10 minutes. Our intuitive
                form guides you through each step, making the process quick and painless.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline" data-testid="accordion-faq-2">
                Can I edit my CV after purchase?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! You have lifetime access to your CV. You can update your information
                and regenerate your CV anytime from your dashboard.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline" data-testid="accordion-faq-3">
                What format is the final CV?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Your CV is delivered as a high-quality PDF that's compatible with all
                applicant tracking systems (ATS) and can be easily printed or emailed.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline" data-testid="accordion-faq-4">
                Is payment secure?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely. We use Paystack, a leading payment processor with bank-level
                security and 256-bit SSL encryption to protect your information.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-primary" />
              <span className="font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">DevIgnite</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 Devignite. Professional CVs made simple.
              </p>
              <span className="text-sm text-muted-foreground">•</span>
              <p className="text-sm">
                Powered by <span className="font-semibold text-foreground">Kiyuhub</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
