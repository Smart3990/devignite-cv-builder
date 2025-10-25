import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { insertCvSchema } from "@shared/schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface PersonalInfoStepProps {
  form: UseFormReturn<z.infer<typeof insertCvSchema>>;
}

export function PersonalInfoStep({ form }: PersonalInfoStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Full Name <span className="text-destructive">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter your full legal name as it appears on official documents</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="John Doe"
                className="h-12 border-2 focus:border-primary transition-colors"
                data-testid="input-full-name"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Email Address <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="h-12 border-2 focus:border-primary transition-colors"
                  data-testid="input-email"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+233 20 000 0000"
                  className="h-12 border-2 focus:border-primary transition-colors"
                  data-testid="input-phone"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input
                placeholder="Accra, Ghana"
                className="h-12 border-2 focus:border-primary transition-colors"
                data-testid="input-location"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription className="text-xs">
              City, State, or Country
            </FormDescription>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website / Portfolio</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  className="h-12 border-2 focus:border-primary transition-colors"
                  data-testid="input-website"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Profile</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="h-12 border-2 focus:border-primary transition-colors"
                  data-testid="input-linkedin"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="github"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GitHub Profile (Optional)</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://github.com/yourusername"
                className="h-12 border-2 focus:border-primary transition-colors"
                data-testid="input-github"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Showcase your code repositories and open source contributions
            </FormDescription>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="summary"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Professional Summary
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>A brief overview of your professional background and career objectives</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief overview of your professional background and career objectives..."
                className="min-h-32 border-2 focus:border-primary transition-colors resize-none"
                data-testid="input-summary"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription className="text-xs">
              2-3 sentences highlighting your expertise and goals
            </FormDescription>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
}
