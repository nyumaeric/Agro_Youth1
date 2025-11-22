"use client";
import { getAllLiveSessions, getLiveSessionsByUser } from "@/services/liveSessions/getLiveSession";
import { getFromCache, saveToCache } from "@/utils/db";
import { useQuery } from "@tanstack/react-query";

interface LiveSession {
  id: string;
  hostId: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string;
  isActive: boolean;
  createdAt?: string;
}

interface LiveSessionsResponse {
  data?: LiveSession[];
}
export const useAllLiveSessionsByUser = () => {
  const isClient = typeof window !== 'undefined';
  const isOnline = isClient ? navigator.onLine : true;

  return useQuery({
    queryKey: ["livesessions"],
    queryFn: async () => {
      const cacheKey = 'user-livesessions';
      const cached = getFromCache<LiveSessionsResponse | LiveSession[]>(cacheKey);


      if (!isOnline) {
        return cached || [];
      }

      try {
        const sessions = await getLiveSessionsByUser();
        
        saveToCache(cacheKey, sessions);
        
        return sessions;
      } catch (error: any) {

        if (cached) {
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
    staleTime: 2 * 60 * 1000, 
    gcTime: 24 * 60 * 60 * 1000, 
    refetchOnWindowFocus: isOnline,
  });
};

export const useAllLiveSessions = () => {
  const isClient = typeof window !== 'undefined';
  const isOnline = isClient ? navigator.onLine : true;

  return useQuery({
    queryKey: ["all-livesessions"],
    queryFn: async () => {
      const cacheKey = 'all-livesessions';
      const cached = getFromCache<LiveSessionsResponse | LiveSession[]>(cacheKey);

      console.log(`Fetching all live sessions, online: ${isOnline}`);

      if (!isOnline) {
        console.log('🔴 OFFLINE MODE - Using cached all live sessions');
        return cached || [];
      }

      try {
        // Fetch from API when online
        console.log('🟢 ONLINE MODE - Fetching all live sessions from API');
        const sessions = await getAllLiveSessions();
        
        // Cache the response
        saveToCache(cacheKey, sessions);
        console.log(`✅ Cached all live sessions`);
        
        return sessions;
      } catch (error: any) {
        console.error('❌ Error fetching all live sessions:', error?.response?.status);
        
        // Fall back to cache on error
        if (cached) {
          console.log('⚠️ Using cached all live sessions due to API error');
          return cached;
        }
        
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry if offline
      if (isClient && !navigator.onLine) return false;
      // Don't retry on server errors
      if (error?.response?.status >= 500) return false;
      return failureCount < 1;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (sessions are time-sensitive)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: isOnline,
  });
};