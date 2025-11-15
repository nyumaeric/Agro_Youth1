"use client";
import { getFromCache, saveToCache } from "@/utils/db";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  moduleCount: number;
  timeToComplete: string;
  language: string;
  isEnrolled?: boolean;
  isCourseCompleted?: boolean;
  completionPercentage?: number;
  completedModules?: number;
  totalModules?: number;
  progress?: {
    completedModules: number;
    totalModules: number;
    progressPercentage: number;
    isCompleted: boolean;
  };
}

interface CourseResponse {
  data: Course[];
  count: number;
  page: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const createPaginatedResponse = (
  allCourses: Course[],
  page: number,
  limit: number = 9
): CourseResponse => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = allCourses.slice(start, end);
  
  return {
    data: paginatedData,
    count: paginatedData.length,
    page: page,
    total: allCourses.length,
    totalPages: Math.ceil(allCourses.length / limit),
    hasNextPage: end < allCourses.length,
    hasPreviousPage: page > 1,
  };
};

export const useCoursesWithOffline = () => {
  const isClient = typeof window !== 'undefined';
  const isOnline = isClient ? navigator.onLine : true;

  return useInfiniteQuery({
    queryKey: ['courses'],
    queryFn: async ({ pageParam = 1 }) => {
      const cacheKey = `courses-page-${pageParam}`;
      const allCoursesKey = 'all-courses-combined';
      
      const cachedPage = getFromCache<CourseResponse>(cacheKey);
      const cachedAllCourses = getFromCache<Course[]>(allCoursesKey) || [];
      
      console.log(`Fetching courses page ${pageParam}, online: ${isOnline}, cached courses: ${cachedAllCourses.length}`);
      
      if (!isOnline) {
        if (cachedPage) {
          return cachedPage;
        }
        
        if (cachedAllCourses.length > 0) {
          return createPaginatedResponse(cachedAllCourses, pageParam);
        }

        return {
          data: [],
          count: 0,
          page: pageParam,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      }

      try {
        
        const response = await axios.get<{ data: CourseResponse }>(
          `/api/courses?page=${pageParam}&limit=9`
        );
        
        const courseData = response.data.data;
        saveToCache(cacheKey, courseData);
        
        let allCourses = getFromCache<Course[]>(allCoursesKey) || [];
        
        courseData.data.forEach(newCourse => {
          const existingIndex = allCourses.findIndex(c => c.id === newCourse.id);
          if (existingIndex === -1) {
            allCourses.push(newCourse);
          } else {
            allCourses[existingIndex] = newCourse;
          }
        });
        
        saveToCache(allCoursesKey, allCourses);
        
        return courseData;
        
      } catch (error: any) {
        if (cachedPage) {
          return cachedPage;
        }
        
        if (cachedAllCourses.length > 0) {
          return createPaginatedResponse(cachedAllCourses, pageParam);
        }
        return {
          data: [],
          count: 0,
          page: pageParam,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    retry: (failureCount, error: any) => {
      if (isClient && !navigator.onLine) {
        return false;
      }
      
      if (error?.response?.status >= 500) {
        return false;
      }
      
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000, 
    refetchOnWindowFocus: isOnline,
  });
};