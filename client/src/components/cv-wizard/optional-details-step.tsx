import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Image, FileText, Users, Upload, X } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface OptionalDetailsStepProps {
  form: UseFormReturn<any>;
}

export function OptionalDetailsStep({ form }: OptionalDetailsStepProps) {
  const customSections = form.watch("customSections") || [];
  const references = form.watch("references") || [];
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(form.watch("photoUrl") || null);
  const { toast } = useToast();

  const addCustomSection = () => {
    form.setValue("customSections", [
      ...customSections,
      { title: "", content: "" },
    ]);
  };

  const removeCustomSection = (index: number) => {
    form.setValue(
      "customSections",
      customSections.filter((_: any, i: number) => i !== index)
    );
  };

  const addReference = () => {
    form.setValue("references", [
      ...references,
      { name: "", position: "", company: "", phone: "", email: "" },
    ]);
  };

  const removeReference = (index: number) => {
    form.setValue(
      "references",
      references.filter((_: any, i: number) => i !== index)
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch('/api/upload/profile-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Update form with the photo URL
      form.setValue('photoUrl', data.photoUrl);
      setPreview(data.photoUrl);
      
      toast({
        title: "Photo uploaded successfully",
        description: "Your profile photo has been uploaded.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    form.setValue('photoUrl', '');
    setPreview(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          Optional Sections
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add optional elements to make your CV stand out (all fields are optional)
        </p>
      </div>

      {/* Profile Photo */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Image className="h-5 w-5 text-primary" />
          <h4 className="font-medium">Profile Photo</h4>
        </div>
        
        <div className="space-y-4">
          {preview ? (
            <div className="flex items-start gap-4">
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Profile preview" 
                  className="w-32 h-32 rounded-full object-cover border-2 border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={removePhoto}
                  data-testid="button-remove-photo"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Profile photo uploaded</p>
                <p className="text-xs text-muted-foreground mb-3">
                  This photo will appear on your CV template
                </p>
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Change Photo
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      asChild
                    >
                      <span data-testid="button-upload-photo">
                        {uploading ? 'Uploading...' : 'Upload Photo'}
                      </span>
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPEG, PNG, or WebP • Max 5MB
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileUpload}
            className="hidden"
            data-testid="input-photo-file"
          />
        </div>
      </Card>

      {/* Custom Sections */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Custom Sections</h4>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomSection}
            data-testid="button-add-custom-section"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Add custom sections like hobbies, languages, volunteer work, etc.
        </p>

        {customSections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No custom sections added yet. Click "Add Section" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {customSections.map((section: any, index: number) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <Label className="text-sm font-medium">
                    Section {index + 1}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomSection(index)}
                    data-testid={`button-remove-custom-section-${index}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name={`customSections.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Languages, Hobbies, Volunteer Work"
                            data-testid={`input-custom-section-title-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`customSections.${index}.content`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the details of this section..."
                            rows={3}
                            data-testid={`input-custom-section-content-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* References */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <h4 className="font-medium">References</h4>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addReference}
            data-testid="button-add-reference"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Reference
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Add professional references (or include "Available upon request")
        </p>

        {references.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No references added. You can add them now or leave this section empty.
          </div>
        ) : (
          <div className="space-y-4">
            {references.map((ref: any, index: number) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <Label className="text-sm font-medium">
                    Reference {index + 1}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReference(index)}
                    data-testid={`button-remove-reference-${index}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name={`references.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John Doe"
                            data-testid={`input-reference-name-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`references.${index}.position`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Senior Manager"
                            data-testid={`input-reference-position-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`references.${index}.company`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="ABC Corporation"
                            data-testid={`input-reference-company-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`references.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="john@example.com"
                            data-testid={`input-reference-email-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`references.${index}.phone`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="+1 (555) 123-4567"
                            data-testid={`input-reference-phone-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
