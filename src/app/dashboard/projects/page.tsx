"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { CreateProjectDialog } from "@/app/components/dashboard/Create-project-dialog";

interface Project {
  id: string;
  ownerId: string;
  title: string;
  goalAmount: number;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchProjects(): Promise<Project[]> {
  const response = await axios.get("/api/investors/projects");
  return response.data.data;
}

function ProjectCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Skeleton width={180} height={24} />
          <Skeleton width={60} height={20} />
        </div>
        <Skeleton width={120} height={16} className="mt-2" />
      </CardHeader>
      <CardContent className="flex-1">
        <Skeleton count={3} />
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Skeleton width="100%" height={16} />
        <Skeleton width="60%" height={14} />
      </CardFooter>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <Skeleton width={300} height={32} className="mb-2" />
          <Skeleton width={400} height={20} />
        </div>
        <Skeleton width={160} height={40} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="p-12 border-dashed">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <TrendingUp className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">No projects yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Get started by creating your first investment project. Track your goals and manage your investments effectively.
          </p>
        </div>
      </div>
    </Card>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const createdDate = new Date(project.createdAt);

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="line-clamp-2 text-lg">{project.title}</CardTitle>
          <Badge 
            variant={project.isActive ? "default" : "secondary"}
            className="shrink-0"
          >
            {project.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1 font-semibold text-base">
          <DollarSign className="h-4 w-4" />
          ${project.goalAmount.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-4">
          {project.description}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 text-xs text-muted-foreground border-t pt-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">Start:</span>
            <span>{startDate.toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">End:</span>
            <span>{endDate.toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground/70 pt-1">
          Created on {createdDate.toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ProjectsList() {
  const {
    data: projects,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investment Projects</h1>
            <p className="text-muted-foreground mt-1">
              Browse and manage your investment projects
            </p>
          </div>
          <CreateProjectDialog />
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error 
              ? error.message 
              : "Failed to load projects. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Projects</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage your investment projects
            {projects && projects.length > 0 && (
              <span className="ml-2 text-sm font-medium">
                ({projects.length} {projects.length === 1 ? "project" : "projects"})
              </span>
            )}
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {!projects || projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}