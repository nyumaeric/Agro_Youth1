import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Project {
  id: string;
  title: string;
  goalAmount: number;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  investor: {
    id: string;
    name: string;
  };
}

async function fetchAllProjects(): Promise<Project[]> {
  const response = await axios.get("/api/investors/projects/all");
  return response.data.data;
}

export const useAllProjects = () => {
  return useQuery({
    queryKey: ["all-projects-list"],
    queryFn: fetchAllProjects,
    staleTime: 30000, 
    refetchOnWindowFocus: true,
  });
};