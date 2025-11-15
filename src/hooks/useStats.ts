import { getFromCache, saveToCache } from "@/utils/db";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

interface RecentCourse {
  id: string;
  title: string;
  progress: number;
  category: string;
  modules: number;
  completedModules: number;
}

interface RecentApplication {
  id: string;
  projectTitle: string;
  status: string;
  budgetAmount: number;
  submittedDate: string;
}

interface RecentActivity {
  type: string;
  title: string;
  description: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentCourses: RecentCourse[];
  recentApplications: RecentApplication[];
  recentActivity: RecentActivity[];
}

// Cache helper functions


export const useDashboardStats = () => {
  const isClient = typeof window !== 'undefined';
  const isOnline = isClient ? navigator.onLine : true;

  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const cacheKey = 'dashboard-stats';
      const cached = getFromCache<DashboardData>(cacheKey);

      console.log(`Fetching dashboard stats, online: ${isOnline}`);

      // If offline, return cached data
      if (!isOnline) {
        console.log('🔴 OFFLINE MODE - Using cached dashboard stats');
        return cached || {
          stats: {
            totalCourses: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            totalApplications: 0,
            pendingApplications: 0,
            approvedApplications: 0,
            rejectedApplications: 0,
          },
          recentCourses: [],
          recentApplications: [],
          recentActivity: [],
        };
      }

      try {
        // Fetch from API when online
        console.log('🟢 ONLINE MODE - Fetching dashboard stats from API');
        const response = await axios.get<{ data: DashboardData }>("/api/stats");
        const dashboardData = response.data.data;
        
        // Cache the response
        saveToCache(cacheKey, dashboardData);
        console.log(`✅ Cached dashboard stats`);
        
        return dashboardData;
      } catch (error: any) {
        console.error('❌ Error fetching dashboard stats:', error?.response?.status);
        
        // Fall back to cache on error
        if (cached) {
          console.log('⚠️ Using cached dashboard stats due to API error');
          return cached;
        }
        
        // Return empty data structure if no cache
        return {
          stats: {
            totalCourses: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            totalApplications: 0,
            pendingApplications: 0,
            approvedApplications: 0,
            rejectedApplications: 0,
          },
          recentCourses: [],
          recentApplications: [],
          recentActivity: [],
        };
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry if offline
      if (isClient && !navigator.onLine) return false;
      // Don't retry on server errors
      if (error?.response?.status >= 500) return false;
      return failureCount < 1;
    },
    staleTime: 30000, // 30 seconds
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: isOnline,
  });
};