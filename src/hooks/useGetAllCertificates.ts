import { getAllCertificatesByUser } from "@/services/getCourse";
import { getFromCache, saveToCache } from "@/utils/db";
import { useQuery } from "@tanstack/react-query";

interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  completionMessage: string;
  completedAt: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  courseDescription: string;
  courseLevel: string;
  courseCategory: string;
  timeToComplete: string;
  courseInstructorFullName: string;
}

type CertificateResponse = Certificate[];


export const useAllCertificatesByUser = () => {
  const isClient = typeof window !== 'undefined';
  const isOnline = isClient ? navigator.onLine : true;

  return useQuery({
    queryKey: ["all-certificates"],
    queryFn: async () => {
      const cacheKey = 'all-certificates';
      const cached = getFromCache<CertificateResponse>(cacheKey);

      console.log(`Fetching certificates, online: ${isOnline}`);

      // If offline, return cached data
      if (!isOnline) {
        console.log('🔴 OFFLINE MODE - Using cached certificates');
        return cached || [];
      }

      try {
        // Fetch from API when online
        console.log('🟢 ONLINE MODE - Fetching certificates from API');
        const certificates = await getAllCertificatesByUser();
        
        // Cache the response
        saveToCache(cacheKey, certificates);
        console.log(`✅ Cached ${Array.isArray(certificates) ? certificates.length : 0} certificates`);
        
        return certificates;
      } catch (error: any) {
        console.error('❌ Error fetching certificates:', error?.response?.status);
        
        // Fall back to cache on error
        if (cached) {
          console.log('⚠️ Using cached certificates due to API error');
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: isOnline,
  });
};