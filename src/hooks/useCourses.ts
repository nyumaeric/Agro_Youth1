'use client';

import { getAdminCourse, getCertificate, getSingleCourse, getSingleCourseModule, postCertificate } from '@/services/getCourse';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface Module {
  id: string;
  title: string;
  content: string;
  durationTime: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  progress: { completedModules: number; totalModules: number; progressPercentage: number; isCompleted: boolean; };
  id: string;
  createdId: string;
  title: string;
  description: string;
  timeToComplete: string;
  level: string;
  category: string;
  language: string;
  isCourseCompleted: boolean;
  moduleCount: number;
  createdAt: string;
  updatedAt: string;
  modules: Module[];
}
export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseLevel: string;
  courseCategory: string;
  courseLanguage: string;
  timeToComplete: string;
  courseInstructorFullName: string;
  completionMessage: string;
  completedAt: string;
  createdAt: string;
}
interface ApiResponse {
  status: string;
  message: string;
  data: Course;
}

export const useCourse = (id: string) => {
  return useQuery<ApiResponse>({
    queryKey: ["course", id],
    queryFn: async () => getSingleCourse(id),
    enabled: !!id,
  });
};

export const claimCertificate = async (courseId: string) => {
  const response = await fetch(`/api/courses/${courseId}/certificate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to claim certificate");
  }

  return response.json();
};



export const useGetAdminCourse = () => {
  return useQuery({
    queryKey: ["admin-course"],
    queryFn: async () => getAdminCourse(),
  });
};
export const useCourseModule = (courseId: string, moduleId: string) => {
    return useQuery({
      queryKey: ["course-module", courseId, moduleId],
      queryFn: async () => getSingleCourseModule(courseId, moduleId),
      enabled: !!courseId && !!moduleId, 
    });
};

export const useEnrolledCourses = (userId: string) => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`/api/courses/${id}/enroll`, {
        user_id: userId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["enrolled-courses", userId] });
    },
    onError: (error) => {
      console.error("Failed to join course", error);
    },
  });
  
  return {
    enrollCourse: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};


export const useUnenrollCourse = (userId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`/api/courses/${id}/enroll`, { userId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
    onError: (error) => {
      console.error("Failed to exit course", error);
    }
  });

  return {
    exitCourse: mutation.mutate, 
    isPending: mutation.isPending,
    error: mutation.error
  };
};

export const useCertificate = (courseId: string) => {
  return useQuery({
    queryKey: ["certificate", courseId],
    queryFn: () => getCertificate(courseId),
    retry: false,
    enabled: !!courseId,
  });
};

export const useClaimCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await fetch(`/api/courses/${courseId}/certificate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to claim certificate");
      }

      return response.json();
    },
    onMutate: async (courseId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["certificate", courseId] });

      // Snapshot previous value
      const previousCertificate = queryClient.getQueryData(["certificate", courseId]);

      // Optimistically update to show certificate is being claimed
      queryClient.setQueryData(["certificate", courseId], (old: any) => ({
        ...old,
        status: "success",
        data: {
          ...old?.data,
          canClaim: false,
          isClaiming: true, 
        },
      }));

      return { previousCertificate };
    },
    onSuccess: (data, courseId) => {
      queryClient.setQueryData(["certificate", courseId], data);
      
      queryClient.invalidateQueries({ queryKey: ["certificate", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (err, courseId, context) => {
      if (context?.previousCertificate) {
        queryClient.setQueryData(["certificate", courseId], context.previousCertificate);
      }
    },
  });
};