// 'use client';

// import { getAdminCourse, getCertificate, getSingleCourse, getSingleCourseModule, postCertificate } from '@/services/getCourse';
// import { getFromCache, saveToCache } from '@/utils/db';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import axios from 'axios';

// export interface Module {
//   id: string;
//   title: string;
//   content: string;
//   durationTime: string;
//   isCompleted: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Course {
//   progress: { completedModules: number; totalModules: number; progressPercentage: number; isCompleted: boolean; };
//   id: string;
//   createdId: string;
//   title: string;
//   description: string;
//   timeToComplete: string;
//   level: string;
//   category: string;
//   language: string;
//   isCourseCompleted: boolean;
//   moduleCount: number;
//   createdAt: string;
//   updatedAt: string;
//   modules: Module[];
// }
// export interface Certificate {
//   id: string;
//   courseId: string;
//   courseTitle: string;
//   courseDescription: string;
//   courseLevel: string;
//   courseCategory: string;
//   courseLanguage: string;
//   timeToComplete: string;
//   courseInstructorFullName: string;
//   completionMessage: string;
//   completedAt: string;
//   createdAt: string;
// }
// interface ApiResponse {
//   status: string;
//   message: string;
//   data: Course;
// }

// export const useCourse = (id: string) => {
//   const isClient = typeof window !== 'undefined';
//   const isOnline = isClient ? navigator.onLine : true;

//   return useQuery<ApiResponse>({
//     queryKey: ["course", id],
//     queryFn: async () => {
//       const cacheKey = `course-${id}`;
//       const cached = getFromCache<ApiResponse>(cacheKey);

//       if (!isOnline) {
//         if (cached) return cached;
//         throw new Error('No cached data available offline');
//       }

//       try {
//         const course = await getSingleCourse(id);
        
//         saveToCache(cacheKey, course);
        
//         return course;
//       } catch (error: any) {
        
//         // Fall back to cache on error
//         if (cached) {
//           console.log('⚠️ Using cached course due to API error');
//           return cached;
//         }
        
//         throw error;
//       }
//     },
//     enabled: !!id,
//     retry: (failureCount, error: any) => {
//       if (isClient && !navigator.onLine) return false;
//       if (error?.response?.status >= 500) return false;
//       return failureCount < 1;
//     },
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 24 * 60 * 60 * 1000, // 24 hours
//     refetchOnWindowFocus: isOnline,
//   });
// };

// export const claimCertificate = async (courseId: string) => {
//   const response = await fetch(`/api/courses/${courseId}/certificate`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.message || "Failed to claim certificate");
//   }

//   return response.json();
// };

// export const useGetAdminCourse = () => {
//   const isClient = typeof window !== 'undefined';
//   const isOnline = isClient ? navigator.onLine : true;

//   return useQuery({
//     queryKey: ["admin-courses"],
//     queryFn: async () => {
//       const cacheKey = 'admin-courses';
//       const cached = getFromCache(cacheKey);

//       console.log(`Fetching admin courses, online: ${isOnline}`);

//       if (!isOnline) {
//         console.log('🔴 OFFLINE MODE - Using cached admin courses');
//         if (cached) return cached;
//         throw new Error('No cached data available offline');
//       }

//       try {
//         console.log('🟢 ONLINE MODE - Fetching admin courses from API');
//         const courses = await getAdminCourse();
        
//         // Cache the response
//         saveToCache(cacheKey, courses);
//         console.log(`✅ Cached admin courses`);
        
//         return courses;
//       } catch (error: any) {
//         console.error('❌ Error fetching admin courses:', error);
        
//         // Fall back to cache on error
//         if (cached) {
//           console.log('⚠️ Using cached admin courses due to API error');
//           return cached;
//         }
        
//         throw error;
//       }
//     },
//     retry: (failureCount, error: any) => {
//       if (isClient && !navigator.onLine) return false;
//       if (error?.response?.status >= 500) return false;
//       return failureCount < 1;
//     },
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 24 * 60 * 60 * 1000, // 24 hours
//     refetchOnWindowFocus: isOnline,
//   });
// };



// export const useCourseModule = (courseId: string, moduleId: string) => {
//   const isClient = typeof window !== 'undefined';
//   const isOnline = isClient ? navigator.onLine : true;

//   return useQuery({
//     queryKey: ["course-module", courseId, moduleId],
//     queryFn: async () => {
//       const cacheKey = `module-${courseId}-${moduleId}`;
//       const cached = getFromCache(cacheKey);

//       console.log(`Fetching module ${moduleId}, online: ${isOnline}`);

//       if (!isOnline) {
//         console.log('🔴 OFFLINE MODE - Using cached module');
//         if (cached) return cached;
//         throw new Error('No cached data available offline');
//       }

//       try {
//         console.log('🟢 ONLINE MODE - Fetching module from API');
//         const module = await getSingleCourseModule(courseId, moduleId);
        
//         // Cache the response
//         saveToCache(cacheKey, module);
//         console.log(`✅ Cached module ${moduleId}`);
        
//         return module;
//       } catch (error: any) {
//         console.error('❌ Error fetching module:', error);
        
//         // Fall back to cache on error
//         if (cached) {
//           console.log('⚠️ Using cached module due to API error');
//           return cached;
//         }
        
//         throw error;
//       }
//     },
//     enabled: !!courseId && !!moduleId,
//     retry: (failureCount, error: any) => {
//       if (isClient && !navigator.onLine) return false;
//       if (error?.response?.status >= 500) return false;
//       return failureCount < 1;
//     },
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 24 * 60 * 60 * 1000, // 24 hours
//     refetchOnWindowFocus: isOnline,
//   });
// };

// export const useCertificate = (courseId: string) => {
//   return useQuery({
//     queryKey: ["certificate", courseId],
//     queryFn: () => getCertificate(courseId),
//     retry: false,
//     enabled: !!courseId && navigator.onLine, // Only fetch when online
//   });
// };

// export const useClaimCertificate = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (courseId: string) => {
//       // Check if online
//       if (!navigator.onLine) {
//         throw new Error('Cannot claim certificate while offline. Please connect to the internet.');
//       }

//       const response = await fetch(`/api/courses/${courseId}/certificate`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || "Failed to claim certificate");
//       }

//       return response.json();
//     },
//     onMutate: async (courseId) => {
//       await queryClient.cancelQueries({ queryKey: ["certificate", courseId] });

//       const previousCertificate = queryClient.getQueryData(["certificate", courseId]);

//       queryClient.setQueryData(["certificate", courseId], (old: any) => ({
//         ...old,
//         status: "success",
//         data: {
//           ...old?.data,
//           canClaim: false,
//           isClaiming: true, 
//         },
//       }));

//       return { previousCertificate };
//     },
//     onSuccess: (data, courseId) => {
//       queryClient.setQueryData(["certificate", courseId], data);
//       queryClient.invalidateQueries({ queryKey: ["certificate", courseId] });
//       queryClient.invalidateQueries({ queryKey: ["course", courseId] });
//     },
//     onError: (err, courseId, context) => {
//       if (context?.previousCertificate) {
//         queryClient.setQueryData(["certificate", courseId], context.previousCertificate);
//       }
//     },
//   });
// };

// export const useEnrolledCourses = (userId: string) => {
//   const queryClient = useQueryClient();
  
//   const mutation = useMutation({
//     mutationFn: async (id: string) => {
//       if (!navigator.onLine) {
//         throw new Error('Cannot enroll while offline. Please connect to the internet.');
//       }

//       const response = await axios.post(`/api/courses/${id}/enroll`, {
//         user_id: userId,
//       });
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["courses"] });
//       queryClient.invalidateQueries({ queryKey: ["enrolled-courses", userId] });
//     },
//     onError: (error) => {
//       console.error("Failed to join course", error);
//     },
//   });
  
//   return {
//     enrollCourse: mutation.mutateAsync,
//     isPending: mutation.isPending,
//     isSuccess: mutation.isSuccess,
//     error: mutation.error,
//   };
// };

// export const useUnenrollCourse = (userId: string) => {
//   const queryClient = useQueryClient();

//   const mutation = useMutation({
//     mutationFn: async (id: string) => {
//       if (!navigator.onLine) {
//         throw new Error('Cannot unenroll while offline. Please connect to the internet.');
//       }

//       const response = await axios.post(`/api/courses/${id}/enroll`, { userId });
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['course'] });
//     },
//     onError: (error) => {
//       console.error("Failed to exit course", error);
//     }
//   });

//   return {
//     exitCourse: mutation.mutate, 
//     isPending: mutation.isPending,
//     error: mutation.error
//   };
// };

'use client';

import { getAdminCourse, getCertificate, getSingleCourse, getSingleCourseModule, postCertificate } from '@/services/getCourse';
import { getFromCache, saveToCache } from '@/utils/db';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';

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

// Helper functions for managing pending offline updates
const getPendingModuleUpdates = (courseId: string): string[] => {
  const cached = getFromCache<string[]>(`pending-modules-${courseId}`);
  return cached || [];
};

const savePendingModuleUpdate = (courseId: string, moduleId: string) => {
  const pending = getPendingModuleUpdates(courseId);
  if (!pending.includes(moduleId)) {
    saveToCache(`pending-modules-${courseId}`, [...pending, moduleId]);
    console.log(`📴 Saved offline completion for module ${moduleId}`);
  }
};

const clearPendingModuleUpdates = (courseId: string) => {
  saveToCache(`pending-modules-${courseId}`, []);
  console.log(`✅ Cleared pending updates for course ${courseId}`);
};

export const useCourse = (id: string) => {
  const isClient = typeof window !== 'undefined';
  const isOnline = isClient ? navigator.onLine : true;

  return useQuery<ApiResponse>({
    queryKey: ["course", id],
    queryFn: async () => {
      const cacheKey = `course-${id}`;
      const cached = getFromCache<ApiResponse>(cacheKey);

      if (!isOnline) {
        if (cached) return cached;
        throw new Error('No cached data available offline');
      }

      try {
        const course = await getSingleCourse(id);
        saveToCache(cacheKey, course);
        return course;
      } catch (error: any) {
        // Fall back to cache on error
        if (cached) {
          console.log('⚠️ Using cached course due to API error');
          return cached;
        }
        throw error;
      }
    },
    enabled: !!id,
    retry: (failureCount, error: any) => {
      if (isClient && !navigator.onLine) return false;
      if (error?.response?.status >= 500) return false;
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: isOnline,
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
  const isClient = typeof window !== 'undefined';
  const isOnline = isClient ? navigator.onLine : true;

  return useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const cacheKey = 'admin-courses';
      const cached = getFromCache(cacheKey);

      console.log(`Fetching admin courses, online: ${isOnline}`);

      if (!isOnline) {
        console.log('🔴 OFFLINE MODE - Using cached admin courses');
        if (cached) return cached;
        throw new Error('No cached data available offline');
      }

      try {
        console.log('🟢 ONLINE MODE - Fetching admin courses from API');
        const courses = await getAdminCourse();
        saveToCache(cacheKey, courses);
        console.log(`✅ Cached admin courses`);
        return courses;
      } catch (error: any) {
        console.error('❌ Error fetching admin courses:', error);
        if (cached) {
          console.log('⚠️ Using cached admin courses due to API error');
          return cached;
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      if (isClient && !navigator.onLine) return false;
      if (error?.response?.status >= 500) return false;
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: isOnline,
  });
};

export const useCourseModule = (courseId: string, moduleId: string) => {
  const isClient = typeof window !== 'undefined';
  const isOnline = isClient ? navigator.onLine : true;

  return useQuery({
    queryKey: ["course-module", courseId, moduleId],
    queryFn: async () => {
      const cacheKey = `module-${courseId}-${moduleId}`;
      const cached = getFromCache(cacheKey);

      console.log(`Fetching module ${moduleId}, online: ${isOnline}`);

      if (!isOnline) {
        console.log('🔴 OFFLINE MODE - Using cached module');
        if (cached) return cached;
        throw new Error('No cached data available offline');
      }

      try {
        console.log('🟢 ONLINE MODE - Fetching module from API');
        const module = await getSingleCourseModule(courseId, moduleId);
        saveToCache(cacheKey, module);
        console.log(`✅ Cached module ${moduleId}`);
        return module;
      } catch (error: any) {
        console.error('❌ Error fetching module:', error);
        if (cached) {
          console.log('⚠️ Using cached module due to API error');
          return cached;
        }
        throw error;
      }
    },
    enabled: !!courseId && !!moduleId,
    retry: (failureCount, error: any) => {
      if (isClient && !navigator.onLine) return false;
      if (error?.response?.status >= 500) return false;
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: isOnline,
  });
};

// NEW: Hook to complete module (works offline and online)
export const useCompleteModule = (courseId: string) => {
  const queryClient = useQueryClient();
  const isClient = typeof window !== 'undefined';

  return useMutation({
    mutationFn: async (moduleId: string) => {
      const isOnline = isClient ? navigator.onLine : true;

      if (!isOnline) {
        // OFFLINE MODE: Update local cache
        console.log('📴 OFFLINE: Storing module completion locally');
        
        const cacheKey = `course-${courseId}`;
        const cachedCourse = getFromCache<ApiResponse>(cacheKey);
        
        if (!cachedCourse) {
          throw new Error('No cached course data available');
        }

        // Update module completion status
        const updatedModules = cachedCourse.data.modules.map(m => 
          m.id === moduleId ? { ...m, isCompleted: true } : m
        );
        
        // Recalculate progress
        const completedCount = updatedModules.filter(m => m.isCompleted).length;
        const totalCount = updatedModules.length;
        const progressPercentage = Math.round((completedCount / totalCount) * 100);
        
        const updatedCourse = {
          ...cachedCourse,
          data: {
            ...cachedCourse.data,
            modules: updatedModules,
            progress: {
              completedModules: completedCount,
              totalModules: totalCount,
              progressPercentage,
              isCompleted: completedCount === totalCount
            }
          }
        };
        
        // Save updated course to cache
        saveToCache(cacheKey, updatedCourse);
        
        // Add to pending sync queue
        savePendingModuleUpdate(courseId, moduleId);
        
        return { offline: true, moduleId, updatedCourse };
      }

      // ONLINE MODE: Call API normally
      console.log('🟢 ONLINE: Completing module via API');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}/module/${moduleId}/complete`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, moduleId) => {
      // Update local cache with new data
      if (data.offline) {
        // For offline, manually update the query cache
        queryClient.setQueryData(["course", courseId], data.updatedCourse);
      } else {
        // For online, invalidate to refetch fresh data
        queryClient.invalidateQueries({ queryKey: ["course", courseId] });
        queryClient.invalidateQueries({ queryKey: ["course-module", courseId, moduleId] });
      }
    },
  });
};

// NEW: Hook to sync offline progress when back online
export const useSyncOfflineProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId }: { courseId: string }) => {
      const pendingModules = getPendingModuleUpdates(courseId);
      
      if (pendingModules.length === 0) {
        return { synced: 0, total: 0, message: 'No pending updates' };
      }

      console.log(`🔄 Syncing ${pendingModules.length} offline module completions...`);
      
      // Sync each pending module completion to the server
      const syncResults = await Promise.allSettled(
        pendingModules.map(moduleId =>
          axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}/module/${moduleId}/complete`,
            {},
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              },
            }
          )
        )
      );

      const successCount = syncResults.filter(r => r.status === 'fulfilled').length;
      const failedCount = syncResults.filter(r => r.status === 'rejected').length;

      if (failedCount > 0) {
        console.warn(`⚠️ ${failedCount} module(s) failed to sync`);
      }

      // Clear pending updates only if all succeeded
      if (successCount === pendingModules.length) {
        clearPendingModuleUpdates(courseId);
      }

      return { 
        synced: successCount, 
        failed: failedCount,
        total: pendingModules.length 
      };
    },
    onSuccess: (data, variables) => {
      // Refresh course data after successful sync
      queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
      console.log(`✅ Sync complete: ${data.synced}/${data.total} modules synced`);
    },
  });
};

// NEW: Hook to check if there are pending offline updates
export const useHasPendingUpdates = (courseId: string) => {
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    const checkPending = () => {
      const pending = getPendingModuleUpdates(courseId);
      setHasPending(pending.length > 0);
    };

    checkPending();
    const interval = setInterval(checkPending, 2000);
    return () => clearInterval(interval);
  }, [courseId]);

  return hasPending;
};

export const useCertificate = (courseId: string) => {
  return useQuery({
    queryKey: ["certificate", courseId],
    queryFn: () => getCertificate(courseId),
    retry: false,
    // enabled: !!courseId && navigator.onLine,
  });
};

export const useClaimCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!navigator.onLine) {
        throw new Error('Cannot claim certificate while offline. Please connect to the internet.');
      }

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
      await queryClient.cancelQueries({ queryKey: ["certificate", courseId] });
      const previousCertificate = queryClient.getQueryData(["certificate", courseId]);

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

export const useEnrolledCourses = (userId: string) => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      if (!navigator.onLine) {
        throw new Error('Cannot enroll while offline. Please connect to the internet.');
      }

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
      if (!navigator.onLine) {
        throw new Error('Cannot unenroll while offline. Please connect to the internet.');
      }

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