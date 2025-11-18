"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Loader2 } from "lucide-react";
import showToast from "@/utils/showToast";

interface CreateProjectData {
  title: string;
  goalAmount: number;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface ErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateProjectData>({
    title: "",
    goalAmount: 0,
    description: "",
    isActive: true,
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const response = await axios.post("/api/investors/projects", {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects query
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showToast("Project created successfully", "success");
      setOpen(false);
      resetForm();
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      showToast(error.response?.data?.message || "Failed to create project", "error");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      goalAmount: 0,
      description: "",
      isActive: true,
      startDate: "",
      endDate: "",
    });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    createProjectMutation.mutate(formData);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new investment project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Title Field */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Project Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter project title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title[0]}</p>
              )}
            </div>

            {/* Goal Amount Field */}
            <div className="grid gap-2">
              <Label htmlFor="goalAmount">
                Goal Amount ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="goalAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.goalAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    goalAmount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Enter goal amount"
                className={errors.goalAmount ? "border-red-500" : ""}
              />
              {errors.goalAmount && (
                <p className="text-sm text-red-500">{errors.goalAmount[0]}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your project"
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description[0]}</p>
              )}
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate[0]}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate[0]}</p>
                )}
              </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active Project
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {createProjectMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}