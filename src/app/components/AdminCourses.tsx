"use client";

import { useGetAdminCourse } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Loader2,
  Plus,
  Video,
  FileText,
  Clock,
  BookOpen,
  Globe,
  BarChart,
  Trash2,
  Eye,
  Edit,
  X,
  AlertCircle,
} from "lucide-react";
import showToast from "@/utils/showToast";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";

interface Course {
  id: string;
  title: string;
  description: string;
  timeToComplete: string;
  category: string;
  level: string;
  language: string;
  contentType: "text" | "video";
  contentUrl?: string;
  textContent?: string;
  isDownloadable: boolean;
  isCourseCompleted: boolean;
  createdAt: string;
}

interface ModuleFormData {
  title: string;
  description: string;
  durationTime: string;
  contentType: "text" | "video";
  textContent?: string;
  videoFile?: FileList;
}

interface CourseFormData {
  title: string;
  description: string;
  timeToComplete: string;
  category: string;
  level: string;
  language: string;
  contentType: "text" | "video";
  textContent?: string;
  videoFile?: FileList;
  modules: ModuleFormData[];
}

export default function AllAdminCourses() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isPending, refetch } = useGetAdminCourse();

  const allCourses: Course[] = Array.isArray(data?.data) ? data.data : [];

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // React Hook Form setup
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<CourseFormData>({
    mode: "onChange",
    defaultValues: {
      contentType: "text",
      modules: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "modules",
  });

  const contentType = watch("contentType");

  // Error Message Component
  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 mt-1">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{message}</span>
      </div>
    );
  };

  // Add new module
  const addModule = () => {
    append({
      title: "",
      description: "",
      durationTime: "",
      contentType: "text",
      textContent: "",
    });
  };

  // Create Course Handler
  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);

    try {
      // Step 1: Create Course
      const courseFormData = new FormData();
      courseFormData.append("title", data.title);
      courseFormData.append("description", data.description);
      courseFormData.append("timeToComplete", data.timeToComplete);
      courseFormData.append("category", data.category);
      courseFormData.append("level", data.level);
      courseFormData.append("language", data.language);
      courseFormData.append("contentType", data.contentType);

      if (data.contentType === "text" && data.textContent) {
        courseFormData.append("textContent", data.textContent);
      } else if (data.contentType === "video" && data.videoFile?.[0]) {
        courseFormData.append("video", data.videoFile[0]);
      }

      console.log("Creating course...");

      const courseResponse = await fetch("/api/courses", {
        method: "POST",
        body: courseFormData,
      });

      if (!courseResponse.ok) {
        const errorData = await courseResponse.json();
        console.error("Course creation failed:", errorData);
        showToast(errorData.message || "Failed to create course", "error");
        return;
      }

      const courseData = await courseResponse.json();
      const createdCourseId = courseData.data.id;
      console.log("Course created successfully:", createdCourseId);

      // Step 2: Create Modules (in parallel for speed)
      if (data.modules.length > 0) {
        console.log(`Creating ${data.modules.length} modules...`);

        const modulePromises = data.modules.map(async (module) => {
          const moduleFormData = new FormData();
          moduleFormData.append("title", module.title);
          moduleFormData.append("description", module.description);
          moduleFormData.append("durationTime", module.durationTime);
          moduleFormData.append("contentType", module.contentType);
          moduleFormData.append("isCompleted", "false");

          if (module.contentType === "text" && module.textContent) {
            moduleFormData.append("textContent", module.textContent);
          } else if (module.contentType === "video" && module.videoFile?.[0]) {
            moduleFormData.append("video", module.videoFile[0]);
          }

          return fetch(`/api/courses/${createdCourseId}/modules`, {
            method: "POST",
            body: moduleFormData,
          });
        });

        const moduleResponses = await Promise.all(modulePromises);

        const failedModules = moduleResponses.filter((res) => !res.ok);
        if (failedModules.length > 0) {
          console.error(`${failedModules.length} modules failed to create`);
          showToast(
            `Course created but ${failedModules.length} module(s) failed`,
            "error"
          );
        } else {
          showToast(
            `Course created successfully with ${data.modules.length} module(s)!`,
            "success"
          );
        }
      }

      // Invalidate cache and refetch
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      refetch();

      // Reset and close
      setIsCreateDialogOpen(false);
      reset();
    } catch (error) {
      console.error("Error creating course:", error);
      showToast(
        "Network error: Please check your internet connection",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Course
  const handleDelete = async () => {
    if (!selectedCourse) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "DELETE",
      });

      const responseData = await response.json();

      if (response.ok) {
        showToast(responseData.message || "Course deleted successfully!", "success");
        setIsDeleteDialogOpen(false);
        setSelectedCourse(null);
        queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
        refetch();
      } else {
        showToast(responseData.message || "Failed to delete course", "error");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      showToast("Network error: Could not delete course", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // View Details
  const handleViewDetails = (courseId: string) => {
    router.push(`/dashboard/courses/${courseId}/modules`);
  };

  // Open Edit Dialog
  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  // Open Delete Dialog
  const openDeleteDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">Manage and create agricultural courses</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Add a new agricultural course with at least one module (required)
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
              {/* COURSE INFORMATION */}
              <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <h3 className="font-semibold text-lg">Course Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Course Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register("title", {
                      required: "Course title is required",
                      minLength: {
                        value: 3,
                        message: "Title must be at least 3 characters",
                      },
                    })}
                    placeholder="e.g., Introduction to Organic Farming"
                  />
                  <ErrorMessage message={errors.title?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    className="resize-none w-full"
                    id="description"
                    {...register("description", {
                      required: "Description is required",
                      minLength: {
                        value: 10,
                        message: "Description must be at least 10 characters",
                      },
                    })}
                    placeholder="Provide a detailed description of the course..."
                    rows={4}
                  />
                  <ErrorMessage message={errors.description?.message} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">
                      Level <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="level"
                      control={control}
                      rules={{ required: "Please select a level" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <ErrorMessage message={errors.level?.message} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeToComplete">
                      Time to Complete <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="timeToComplete"
                      {...register("timeToComplete", {
                        required: "Time to complete is required",
                      })}
                      placeholder="e.g., 2 hours"
                    />
                    <ErrorMessage message={errors.timeToComplete?.message} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="category"
                      control={control}
                      rules={{ required: "Please select a category" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cropping">Cropping</SelectItem>
                            <SelectItem value="Livestock">Livestock</SelectItem>
                            <SelectItem value="Agroforestry">Agroforestry</SelectItem>
                            <SelectItem value="Irrigation">Irrigation</SelectItem>
                            <SelectItem value="Soil Health">Soil Health</SelectItem>
                            <SelectItem value="Pest Management">Pest Management</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <ErrorMessage message={errors.category?.message} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">
                      Language <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="language"
                      control={control}
                      rules={{ required: "Please select a language" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="Kinyarwanda">Kinyarwanda</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <ErrorMessage message={errors.language?.message} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Content Type <span className="text-red-500">*</span></Label>
                  <Controller
                    name="contentType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="text" id="create-text" />
                          <Label htmlFor="create-text" className="cursor-pointer">
                            Text Content
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="video" id="create-video" />
                          <Label htmlFor="create-video" className="cursor-pointer">
                            Video Upload
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>

                {contentType === "text" ? (
                  <div className="space-y-2">
                    <Label htmlFor="textContent">
                      Text Content <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      className="resize-none w-full"
                      id="textContent"
                      {...register("textContent", {
                        required: contentType === "text" ? "Text content is required" : false,
                        minLength: {
                          value: 20,
                          message: "Text content must be at least 20 characters",
                        },
                      })}
                      placeholder="Enter the course content here..."
                      rows={6}
                    />
                    <ErrorMessage message={errors.textContent?.message} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="video">
                      Upload Video <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo"
                      {...register("videoFile", {
                        required: contentType === "video" ? "Video file is required" : false,
                      })}
                    />
                    <ErrorMessage message={errors.videoFile?.message} />
                  </div>
                )}
              </div>

              {/* MODULES SECTION - REQUIRED */}
              <div className="space-y-4 p-4 border-2 rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      Course Modules
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      You must add at least one module to create a course
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addModule}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Module
                  </Button>
                </div>

                {fields.length === 0 && (
                  <ErrorMessage message="At least one module is required" />
                )}

                {fields.length > 0 && (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-4 border rounded-lg space-y-4 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Module {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Module Title <span className="text-red-500">*</span></Label>
                          <Input
                            {...register(`modules.${index}.title`, {
                              required: "Module title is required",
                              minLength: {
                                value: 3,
                                message: "Title must be at least 3 characters",
                              },
                            })}
                            placeholder="e.g., Introduction to Soil Types"
                          />
                          <ErrorMessage message={errors.modules?.[index]?.title?.message} />
                        </div>

                        <div className="space-y-2">
                          <Label>Module Description <span className="text-red-500">*</span></Label>
                          <Textarea
                            className="resize-none w-full"
                            {...register(`modules.${index}.description`, {
                              required: "Module description is required",
                              minLength: {
                                value: 10,
                                message: "Description must be at least 10 characters",
                              },
                            })}
                            placeholder="Describe what this module covers..."
                            rows={3}
                          />
                          <ErrorMessage message={errors.modules?.[index]?.description?.message} />
                        </div>

                        <div className="space-y-2">
                          <Label>Duration <span className="text-red-500">*</span></Label>
                          <Input
                            {...register(`modules.${index}.durationTime`, {
                              required: "Duration is required",
                            })}
                            placeholder="e.g., 30 minutes"
                          />
                          <ErrorMessage message={errors.modules?.[index]?.durationTime?.message} />
                        </div>

                        <div className="space-y-3">
                          <Label>Module Content Type</Label>
                          <Controller
                            name={`modules.${index}.contentType`}
                            control={control}
                            render={({ field }) => (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="flex gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="text" id={`module-text-${index}`} />
                                  <Label htmlFor={`module-text-${index}`} className="cursor-pointer">
                                    Text
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="video" id={`module-video-${index}`} />
                                  <Label htmlFor={`module-video-${index}`} className="cursor-pointer">
                                    Video
                                  </Label>
                                </div>
                              </RadioGroup>
                            )}
                          />
                        </div>

                        {watch(`modules.${index}.contentType`) === "text" ? (
                          <div className="space-y-2">
                            <Label>Text Content <span className="text-red-500">*</span></Label>
                            <Textarea
                              className="resize-none w-full"
                              {...register(`modules.${index}.textContent`, {
                                required: watch(`modules.${index}.contentType`) === "text" 
                                  ? "Text content is required" 
                                  : false,
                                minLength: {
                                  value: 10,
                                  message: "Content must be at least 10 characters",
                                },
                              })}
                              placeholder="Enter module content..."
                              rows={4}
                            />
                            <ErrorMessage message={errors.modules?.[index]?.textContent?.message} />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Upload Video <span className="text-red-500">*</span></Label>
                            <Input
                              type="file"
                              accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo"
                              {...register(`modules.${index}.videoFile`, {
                                required: watch(`modules.${index}.contentType`) === "video"
                                  ? "Video file is required"
                                  : false,
                              })}
                            />
                            <ErrorMessage message={errors.modules?.[index]?.videoFile?.message} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    reset();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!isValid || fields.length === 0 || isSubmitting} 
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>Create Course {fields.length > 0 && `with ${fields.length} Module(s)`}</>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course "
              {selectedCourse?.title}" and all its modules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCourse(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Courses Grid */}
      {allCourses.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-4">Create your first course to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {course.contentType === "video" ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{course.timeToComplete}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart className="w-4 h-4" />
                  <span>{course.category}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <span>{course.language}</span>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewDetails(course.id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(course)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteDialog(course)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}