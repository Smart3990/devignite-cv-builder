import { UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { insertCvSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

interface ExperienceStepProps {
  form: UseFormReturn<z.infer<typeof insertCvSchema>>;
}

export function ExperienceStep({ form }: ExperienceStepProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  return (
    <div className="space-y-6">
      {fields.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No experience added yet. Click the button below to add your work history.
        </p>
      )}

      {fields.map((field, index) => (
        <Card key={field.id} className="p-6 border-2" data-testid={`card-experience-${index}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold">Experience {index + 1}</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              data-testid={`button-remove-experience-${index}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`experience.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Software Engineer"
                        className="h-12"
                        data-testid={`input-exp-title-${index}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`experience.${index}.company`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tech Company Inc."
                        className="h-12"
                        data-testid={`input-exp-company-${index}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`experience.${index}.location`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Accra, Ghana"
                      className="h-12"
                      data-testid={`input-exp-location-${index}`}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`experience.${index}.startDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="month"
                        className="h-12"
                        data-testid={`input-exp-start-${index}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`experience.${index}.endDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="month"
                        className="h-12"
                        disabled={form.watch(`experience.${index}.current`)}
                        data-testid={`input-exp-end-${index}`}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`experience.${index}.current`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid={`checkbox-exp-current-${index}`}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 font-normal cursor-pointer">
                    I currently work here
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`experience.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your responsibilities and achievements..."
                      className="min-h-24 resize-none"
                      data-testid={`input-exp-description-${index}`}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Highlight key achievements and responsibilities
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            title: "",
            company: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
          })
        }
        className="w-full"
        data-testid="button-add-experience"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Experience
      </Button>
    </div>
  );
}
