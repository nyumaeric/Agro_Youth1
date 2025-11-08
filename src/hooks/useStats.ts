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

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await axios.get<{ data: DashboardData }>("/api/stats");
      return response.data.data;
    },
    staleTime: 30000, 
    refetchOnWindowFocus: true,
  });
};