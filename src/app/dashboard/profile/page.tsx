"use client";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Camera, User, FileText, Loader2, Upload, X, Phone, Shield, Briefcase } from "lucide-react";
import showToast from "@/utils/showToast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ProfileData {
  id: string;
  fullName: string;
  phoneNumber: string;
  profilePicUrl: string | null;
  bio: string | null;
  anonymousName: string | null;
  isAnonymous: boolean;
  userType: string;
  role: string | null;
  createdAt: string;
}

interface UpdatePayload {
  profilePicUrl?: string;
  bio?: string;
  anonymousName?: string;
}

export default function EditProfile() {
  const queryClient = useQueryClient();
  const [profilePicUrl, setProfilePicUrl] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [anonymousName, setAnonymousName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axios.get("/api/profile");
      return response.data;
    },
  });

  const profile: ProfileData | null = data?.data?.[0] || null;

  useEffect(() => {
    if (profile) {
      setProfilePicUrl(profile.profilePicUrl || "");
      setPreviewUrl(profile.profilePicUrl || "");
      setBio(profile.bio || "");
      setAnonymousName(profile.anonymousName || "");
    }
  }, [profile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB", "error");
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(profile?.profilePicUrl || "");
    setProfilePicUrl(profile?.profilePicUrl || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdatePayload) => {
      const finalPayload: UpdatePayload = { ...payload };
      
      if (selectedFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
        
        const base64Data = await base64Promise;
        finalPayload.profilePicUrl = base64Data;
      }

      const response = await axios.patch("/api/profile", finalPayload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], { data: [data.data] });
      setSelectedFile(null);
      setPreviewUrl(data.data.profilePicUrl || "");
      showToast(data.message || "Profile updated successfully", "success");
    },
    onError: (error) => {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to update profile"
        : "An unexpected error occurred";
      
      showToast(errorMessage, "error");
    },
  });

  const handleSubmit = () => {
    const payload: UpdatePayload = {};
    
    if (selectedFile) {
      payload.profilePicUrl = "uploading"; 
    } else if (profilePicUrl !== (profile?.profilePicUrl || "")) {
      payload.profilePicUrl = profilePicUrl;
    }
    
    if (bio !== (profile?.bio || "")) {
      payload.bio = bio;
    }
    if (anonymousName !== (profile?.anonymousName || "")) {
      payload.anonymousName = anonymousName;
    }

    if (Object.keys(payload).length === 0) {
      showToast("No changes to save", "error");
      return;
    }

    updateMutation.mutate(payload);
  };

  const handleReset = () => {
    setProfilePicUrl(profile?.profilePicUrl || "");
    setPreviewUrl(profile?.profilePicUrl || "");
    setBio(profile?.bio || "");
    setAnonymousName(profile?.anonymousName || "");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasChanges =
    selectedFile !== null ||
    profilePicUrl !== (profile?.profilePicUrl || "") ||
    bio !== (profile?.bio || "") ||
    anonymousName !== (profile?.anonymousName || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <Skeleton height={32} width={200} />
              <Skeleton height={20} width={300} />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton circle width={96} height={96} />
                <div className="flex-1 space-y-2">
                  <Skeleton height={24} width={200} />
                  <Skeleton height={16} width={150} />
                  <Skeleton height={22} width={80} />
                </div>
              </div>
              <Separator />
              <div className="grid gap-6 md:grid-cols-2">
                <Skeleton height={80} />
                <Skeleton height={80} />
                <Skeleton height={80} />
                <Skeleton height={80} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">User not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Profile Settings</CardTitle>
            <CardDescription>
              Manage your profile information and preferences
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your basic account details (cannot be changed)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  value={profile.fullName || ""}
                  disabled
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  value={profile.phoneNumber || ""}
                  disabled
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Role
                </Label>
                <Input
                  value={profile.role || "N/A"}
                  disabled
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  User Type
                </Label>
                <Input
                  value={
                    profile.userType
                      ? profile.userType.charAt(0).toUpperCase() +
                        profile.userType.slice(1)
                      : ""
                  }
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile picture, bio, and anonymous name
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden flex-shrink-0">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    profile.fullName?.charAt(0).toUpperCase()
                  )}
                  {selectedFile && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Profile Picture
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload an image or paste a URL (max 5MB)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="profile-pic-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {selectedFile ? selectedFile.name : "Choose Image"}
                      </Button>
                      {selectedFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleRemoveImage}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {!selectedFile && (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <Separator />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                              or paste URL
                            </span>
                          </div>
                        </div>

                        <Input
                          type="url"
                          value={profilePicUrl}
                          onChange={(e) => {
                            setProfilePicUrl(e.target.value);
                            if (e.target.value) {
                              setPreviewUrl(e.target.value);
                            }
                          }}
                          placeholder="https://example.com/your-photo.jpg"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="anonymous-name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Anonymous Name
              </Label>
              <Input
                id="anonymous-name"
                type="text"
                value={anonymousName}
                onChange={(e) => setAnonymousName(e.target.value)}
                maxLength={50}
                placeholder="Enter your anonymous name"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Used when you post anonymously
                </p>
                <span className="text-sm text-muted-foreground">
                  {anonymousName.length}/50
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Tell us about yourself..."
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Share a bit about yourself
                </p>
                <span className="text-sm text-muted-foreground">
                  {bio.length}/500
                </span>
              </div>
            </div>

            <Separator />
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSubmit}
                disabled={!hasChanges || updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || updateMutation.isPending}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your profile picture will be securely stored in the cloud.
              Make sure the image is appropriate and represents you well.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}