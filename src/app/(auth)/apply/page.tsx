"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Loader2, AlertCircle, FileText, DollarSign, Clock, Target, Building2, Mail, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import showToast from "@/utils/showToast";

function DonationApplicationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [certificates, setCertificates] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    projectTitle: "",
    organization: "",
    projectDescription: "",
    projectGoals: "",
    budgetAmount: "",
    duration: "",
    expectedImpact: "",
    email: "",
  });

  // Check if projectId is present
  useEffect(() => {
    if (!projectId) {
      showToast("No project selected. Please select a project first.", "error");
      setTimeout(() => {
        router.push("/dashboard/investors");
      }, 2000);
    }
  }, [projectId, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    
    const maxSize = 10 * 1024 * 1024;
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        showToast(`${file.name} has an invalid file type. Only PDF and images are allowed.`, "error");
        return false;
      }
      
      // Check file size
      if (file.size > maxSize) {
        showToast(`${file.name} exceeds 10MB limit`, "error");
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setCertificates((prev) => [...prev, ...validFiles]);
      showToast(`${validFiles.length} file(s) added successfully`, "success");
    }
  };

  const removeCertificate = (index: number) => {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
    showToast("File removed", "success");
  };

  const handleSubmit = async () => {
    if (!projectId) {
      showToast("Project ID is missing", "error");
      return;
    }

    if (certificates.length === 0) {
      showToast("Please upload at least one certificate", "error");
      return;
    }

    // Validate required fields
    const requiredFields = {
      email: formData.email,
      projectTitle: formData.projectTitle,
      projectDescription: formData.projectDescription,
      projectGoals: formData.projectGoals,
      budgetAmount: formData.budgetAmount,
      duration: formData.duration,
      expectedImpact: formData.expectedImpact,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      showToast(`Please fill in: ${missingFields.join(", ")}`, "error");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    // Validate budget
    const budget = parseInt(formData.budgetAmount);
    if (isNaN(budget) || budget <= 0) {
      showToast("Budget amount must be a positive number", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append("projectId", projectId);
      formDataToSend.append("projectTitle", formData.projectTitle);
      formDataToSend.append("organization", formData.organization);
      formDataToSend.append("projectDescription", formData.projectDescription);
      formDataToSend.append("projectGoals", formData.projectGoals);
      formDataToSend.append("budgetAmount", formData.budgetAmount);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("expectedImpact", formData.expectedImpact);
      formDataToSend.append("email", formData.email);

      // Append all certificate files
      certificates.forEach((file) => {
        formDataToSend.append("certificates", file);
      });

      console.log(`Submitting application with ${certificates.length} certificate(s)...`);

      const response = await fetch("/api/donations/apply", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        showToast(data.message || "Application submitted successfully!", "success");
        
        // Log success details
        console.log("Application submitted:", {
          applicationId: data.data?.applicationId,
          certificateCount: data.data?.certificateCount,
        });

        // Wait 3 seconds before redirecting
        setTimeout(() => {
          router.push("/investors");
        }, 3000);
      } else {
        showToast(data.message || "Failed to submit application", "error");
        console.error("Submission failed:", data);
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An error occurred while submitting your application";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!projectId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <FileText className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Donation Application
          </h1>
          <p className="text-gray-600 text-lg">
            Submit your project proposal to receive funding
          </p>
        </div>

        {/* Back Button */}
        <Button 
          onClick={() => router.back()} 
          variant="outline"
          className="mb-6"
          disabled={isSubmitting}
        >
          Back to projects page
        </Button>

        {/* Success Alert */}
        {isSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              Your application has been submitted successfully! Redirecting to projects page...
            </AlertDescription>
          </Alert>
        )}

        {/* Project ID Alert */}
        <Alert className="mb-8 border-emerald-200 bg-emerald-50/50 backdrop-blur">
          <AlertCircle className="h-5 w-5 text-emerald-600" />
          <AlertDescription className="text-emerald-900 flex items-center gap-2">
            <span className="font-medium">Application for Project:</span>
            <span className="font-mono font-bold bg-white px-3 py-1 rounded-md border border-emerald-200">
              {projectId}
            </span>
          </AlertDescription>
        </Alert>

        {/* Main Form Card */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600" />
          
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Contact Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Contact Information
                  </h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address <span className="text-emerald-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      required
                      disabled={isSubmitting || isSuccess}
                      className="pl-10 h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-sm font-medium text-gray-700">
                    Organization <span className="text-gray-400 text-xs">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="Your organization name"
                      disabled={isSubmitting || isSuccess}
                      className="pl-10 h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Project Details Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Project Details
                  </h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectTitle" className="text-sm font-medium text-gray-700">
                    Project Title <span className="text-emerald-600">*</span>
                  </Label>
                  <Input
                    id="projectTitle"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleInputChange}
                    placeholder="Enter your project title"
                    required
                    disabled={isSubmitting || isSuccess}
                    className="h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDescription" className="text-sm font-medium text-gray-700">
                    Project Description <span className="text-emerald-600">*</span>
                  </Label>
                  <Textarea
                    id="projectDescription"
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of your project, including its purpose and methodology"
                    rows={5}
                    required
                    disabled={isSubmitting || isSuccess}
                    className="resize-none border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-500">
                    {formData.projectDescription.length} characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectGoals" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    Project Goals <span className="text-emerald-600">*</span>
                  </Label>
                  <Textarea
                    id="projectGoals"
                    name="projectGoals"
                    value={formData.projectGoals}
                    onChange={handleInputChange}
                    placeholder="List the main goals and objectives you aim to achieve"
                    rows={4}
                    required
                    disabled={isSubmitting || isSuccess}
                    className="resize-none border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Budget & Timeline Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Budget & Timeline
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budgetAmount" className="text-sm font-medium text-gray-700">
                      Budget Amount (USD) <span className="text-emerald-600">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="budgetAmount"
                        name="budgetAmount"
                        type="number"
                        value={formData.budgetAmount}
                        onChange={handleInputChange}
                        placeholder="10000"
                        min="0"
                        required
                        disabled={isSubmitting || isSuccess}
                        className="pl-10 h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                      Duration <span className="text-emerald-600">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        placeholder="e.g., 6 months"
                        required
                        disabled={isSubmitting || isSuccess}
                        className="pl-10 h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedImpact" className="text-sm font-medium text-gray-700">
                    Expected Impact <span className="text-emerald-600">*</span>
                  </Label>
                  <Textarea
                    id="expectedImpact"
                    name="expectedImpact"
                    value={formData.expectedImpact}
                    onChange={handleInputChange}
                    placeholder="Describe the anticipated outcomes and impact of your project on the community or target audience"
                    rows={4}
                    required
                    disabled={isSubmitting || isSuccess}
                    className="resize-none border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Certificates Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Supporting Documents
                  </h2>
                </div>

                <Label className="text-sm font-medium text-gray-700">
                  Certificates <span className="text-emerald-600">*</span>
                  <span className="text-gray-500 text-xs ml-2">(PDF, JPEG, PNG, WebP - Max 10MB each)</span>
                </Label>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200 cursor-pointer group">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center mb-4 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Drop your files here or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Upload certificates, licenses, or other supporting documents
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="certificate-upload"
                      disabled={isSubmitting || isSuccess}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("certificate-upload")?.click()
                      }
                      disabled={isSubmitting || isSuccess}
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      Select Files
                    </Button>
                  </div>
                </div>

                {/* Certificate List */}
                {certificates.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Uploaded Files ({certificates.length})
                    </p>
                    {certificates.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 p-4 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-white border border-emerald-200 flex items-center justify-center flex-shrink-0">
                            {file.type === 'application/pdf' ? (
                              <FileText className="w-5 h-5 text-red-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                              {file.type === 'application/pdf' && ' • PDF'}
                              {file.type.startsWith('image/') && ' • Image'}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCertificate(index)}
                          disabled={isSubmitting || isSuccess}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Section */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isSuccess}
                  className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Application...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Submitted Successfully!
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Submit Application
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="h-12 px-8 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500">
                By submitting this application, you agree to our terms and conditions
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{" "}
            <a href="mailto:support@example.com" className="text-emerald-600 hover:text-emerald-700 font-medium">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DonationApplicationForm() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    }>
      <DonationApplicationFormContent />
    </Suspense>
  );
}