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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X, Award, Trophy } from "lucide-react";
import { useState } from "react";

interface EducationSkillsStepProps {
  form: UseFormReturn<z.infer<typeof insertCvSchema>>;
}

export function EducationSkillsStep({ form }: EducationSkillsStepProps) {
  const [skillInput, setSkillInput] = useState("");
  
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control: form.control,
    name: "achievements",
  });

  const skills = form.watch("skills") || [];

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = form.getValues("skills") || [];
      form.setValue("skills", [...currentSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue("skills", currentSkills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Education Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Education</h3>
        <div className="space-y-6">
          {educationFields.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No education added yet. Add your academic background below.
            </p>
          )}

          {educationFields.map((field, index) => (
            <Card key={field.id} className="p-6 border-2" data-testid={`card-education-${index}`}>
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold">Education {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEducation(index)}
                  data-testid={`button-remove-education-${index}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`education.${index}.degree`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Bachelor of Science"
                            className="h-12"
                            data-testid={`input-edu-degree-${index}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`education.${index}.institution`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="University Name"
                            className="h-12"
                            data-testid={`input-edu-institution-${index}`}
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
                  name={`education.${index}.location`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City, Country"
                          className="h-12"
                          data-testid={`input-edu-location-${index}`}
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
                    name={`education.${index}.startDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="month"
                            className="h-12"
                            data-testid={`input-edu-start-${index}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`education.${index}.endDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input
                            type="month"
                            className="h-12"
                            disabled={form.watch(`education.${index}.current`)}
                            data-testid={`input-edu-end-${index}`}
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
                  name={`education.${index}.current`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid={`checkbox-edu-current-${index}`}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 font-normal cursor-pointer">
                        I am currently studying here
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`education.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Relevant coursework, achievements, or honors..."
                          className="min-h-20 resize-none"
                          data-testid={`input-edu-description-${index}`}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
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
              appendEducation({
                degree: "",
                institution: "",
                location: "",
                startDate: "",
                endDate: "",
                current: false,
                description: "",
              })
            }
            className="w-full"
            data-testid="button-add-education"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Education
          </Button>
        </div>
      </div>

      {/* Skills Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Skills</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill (e.g., JavaScript, Project Management)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              className="h-12"
              data-testid="input-skill"
            />
            <Button
              type="button"
              onClick={addSkill}
              data-testid="button-add-skill"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1.5 gap-2"
                  data-testid={`badge-skill-${index}`}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="hover-elevate rounded-full"
                    data-testid={`button-remove-skill-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {skills.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">
              No skills added yet. Add your professional skills above.
            </p>
          )}
        </div>
      </div>

      {/* Certifications Section (Optional) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Certifications (Optional)</h3>
        </div>
        <div className="space-y-6">
          {certificationFields.length === 0 && (
            <p className="text-muted-foreground text-center py-8 bg-muted/30 rounded-lg">
              No certifications added. Click below to add professional certifications.
            </p>
          )}

          {certificationFields.map((field, index) => (
            <Card key={field.id} className="p-6 border-2" data-testid={`card-certification-${index}`}>
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold">Certification {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCertification(index)}
                  data-testid={`button-remove-certification-${index}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`certifications.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certification Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="AWS Certified Solutions Architect"
                            className="h-12"
                            data-testid={`input-cert-name-${index}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`certifications.${index}.issuer`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issuing Organization <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Amazon Web Services"
                            className="h-12"
                            data-testid={`input-cert-issuer-${index}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`certifications.${index}.date`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Obtained <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="month"
                            className="h-12"
                            data-testid={`input-cert-date-${index}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`certifications.${index}.credentialId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credential ID (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ABC123XYZ"
                            className="h-12"
                            data-testid={`input-cert-id-${index}`}
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
                  name={`certifications.${index}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://verify-certificate.com"
                          className="h-12"
                          data-testid={`input-cert-url-${index}`}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Link to verify your certification online
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
              appendCertification({
                name: "",
                issuer: "",
                date: "",
                credentialId: "",
                url: "",
              })
            }
            className="w-full"
            data-testid="button-add-certification"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Certification
          </Button>
        </div>
      </div>

      {/* Achievements Section (Optional) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Achievements (Optional)</h3>
        </div>
        <div className="space-y-6">
          {achievementFields.length === 0 && (
            <p className="text-muted-foreground text-center py-8 bg-muted/30 rounded-lg">
              No achievements added. Click below to add notable accomplishments.
            </p>
          )}

          {achievementFields.map((field, index) => (
            <Card key={field.id} className="p-6 border-2" data-testid={`card-achievement-${index}`}>
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold">Achievement {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAchievement(index)}
                  data-testid={`button-remove-achievement-${index}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name={`achievements.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Achievement Title <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Led team to increase revenue by 150%"
                          className="h-12"
                          data-testid={`input-achievement-title-${index}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`achievements.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the achievement and its impact..."
                          className="min-h-24 resize-none"
                          data-testid={`input-achievement-description-${index}`}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Highlight the impact, results, or recognition received
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`achievements.${index}.date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="month"
                          className="h-12"
                          data-testid={`input-achievement-date-${index}`}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
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
              appendAchievement({
                title: "",
                description: "",
                date: "",
              })
            }
            className="w-full"
            data-testid="button-add-achievement"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Achievement
          </Button>
        </div>
      </div>
    </div>
  );
}
