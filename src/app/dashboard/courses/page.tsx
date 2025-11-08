'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import axios from 'axios';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSession } from 'next-auth/react';
import { useEnrolledCourses, useUnenrollCourse } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BookOpen, Globe, CheckCircle2, XCircle, PlayCircle, Award } from 'lucide-react';
import showToast from '@/utils/showToast';

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

const CourseSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton height={120} />
    </CardHeader>
    <CardContent>
      <Skeleton height={24} className="mb-3" />
      <Skeleton height={16} count={2} className="mb-4" />
      <Skeleton height={20} className="mb-2" />
    </CardContent>
    <CardFooter>
      <Skeleton height={44} width="100%" />
    </CardFooter>
  </Card>
);

const Courses: React.FC = () => {
  const { ref, inView } = useInView();
  const { data: session } = useSession();
  const [filter, setFilter] = useState({
    category: '',
    level: '',
    language: ''
  });
  
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);
  
  const userId = session?.user?.id || '';

  const { enrollCourse } = useEnrolledCourses(userId);
  const { exitCourse } = useUnenrollCourse(userId);

  const { data: enrollmentsData } = useQuery({
    queryKey: ['enrolled-courses', userId],
    queryFn: async () => {
      if (!userId) return { data: [] };
      const response = await axios.get(`/api/enrollments`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 10000,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['courses'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get<{ data: CourseResponse }>(
        `/api/courses?page=${pageParam}&limit=9`
      );
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 30000,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleEnroll = async(courseId: string) => {
    if (!session?.user?.id) {
      showToast('Please login to enroll in courses', 'error');
      return;
    }

    setEnrollingId(courseId);

    await enrollCourse(courseId, {
      onSuccess: () => {
        showToast('Successfully enrolled in the course!', 'success');
        setTimeout(() => {
          setEnrollingId(null);
        }, 500);
      },
      onError: (error) => {
        showToast('Failed to enroll in the course', 'error');
        setEnrollingId(null); 
      }
    });
  };

  const handleUnenroll = async (courseId: string) => {
    if (!session) {
      showToast('Please login first', 'error');
      return;
    }
    
    if (!confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }
    
    setUnenrollingId(courseId);
    try {
      await exitCourse(courseId);
      showToast('Successfully unenrolled from course', 'success');
    } catch (error) {
      console.error('Unenrollment failed:', error);
      showToast('Failed to unenroll from course', 'error');
    } finally {
      setUnenrollingId(null);
    }
  };

  const enrolledCourseIds = new Set(
    (enrollmentsData?.data || []).map((enrolledCourse: Course) => enrolledCourse.id)
  );

  const allCourses = (data?.pages.flatMap(page => page.data) || []).map(course => ({
    ...course,
    isEnrolled: enrolledCourseIds.has(course.id),
    isCourseCompleted: course.progress?.isCompleted || course.isCourseCompleted || false,
    completionPercentage: course.progress?.progressPercentage || 0,
  }));

  const filteredCourses = allCourses.filter(course => {
    if (filter.category && course.category !== filter.category) return false;
    if (filter.level && course.level !== filter.level) return false;
    if (filter.language && course.language !== filter.language) return false;
    return true;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          {/* Filters Card */}
          <Card className="mb-10 border-2 shadow-lg">
            <CardContent className="pt-8 pb-6">
              <div className="flex flex-wrap gap-4">
                <Select 
                  value={filter.category || "all"} 
                  onValueChange={(value) => setFilter({...filter, category: value === "all" ? "" : value})}
                >
                  <SelectTrigger className="w-[220px] h-12 border-2 font-medium">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Cropping">🌾 Cropping</SelectItem>
                    <SelectItem value="Livestock">🐄 Livestock</SelectItem>
                    <SelectItem value="Agroforestry">🌳 Agroforestry</SelectItem>
                    <SelectItem value="Irrigation">💧 Irrigation</SelectItem>
                    <SelectItem value="Soil Health">🌱 Soil Health</SelectItem>
                    <SelectItem value="Pest Management">🐛 Pest Management</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={filter.level || "all"} 
                  onValueChange={(value) => setFilter({...filter, level: value === "all" ? "" : value})}
                >
                  <SelectTrigger className="w-[200px] h-12 border-2 font-medium">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">📚 Beginner</SelectItem>
                    <SelectItem value="Intermediate">📖 Intermediate</SelectItem>
                    <SelectItem value="Advanced">🎓 Advanced</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={filter.language || "all"} 
                  onValueChange={(value) => setFilter({...filter, language: value === "all" ? "" : value})}
                >
                  <SelectTrigger className="w-[200px] h-12 border-2 font-medium">
                    <SelectValue placeholder="All Languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="English">🇬🇧 English</SelectItem>
                    <SelectItem value="French">🇫🇷 French</SelectItem>
                    <SelectItem value="Kinyarwanda">🇷🇼 Kinyarwanda</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => setFilter({ category: '', level: '', language: '' })}
                  variant="outline"
                  className="bg-green-600 text-white hover:bg-green-700 hover:text-white border-2 border-green-600 font-semibold"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 9 }).map((_, index) => (
                <CourseSkeleton key={index} />
              ))
            ) : isError ? (
              <div className="col-span-full text-center py-20">
                <p className="text-red-600 text-xl font-semibold">Error loading courses. Please try again.</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500 text-xl">No courses found matching your filters.</p>
              </div>
            ) : (
              filteredCourses.map((course) => {
                const isThisCourseEnrolling = enrollingId === course.id;
                const isThisCourseUnenrolling = unenrollingId === course.id;
                
                return (
                  <Card 
                    key={course.id} 
                    className="group hover:shadow-2xl transition-all duration-300 border-2 overflow-hidden p-0 relative" 
                    // ${
                    //   course.isCourseCompleted 
                    //     ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:border-green-400' 
                    //     : 'bg-white border-gray-200 hover:border-gray-300'
                    // }`}
                  >
                    {/* Completed Course Design */}
                    {course.isCourseCompleted ? (
                      <>
                        {/* Header with Achievement Style */}
                        <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-50 text-white py-6 relative overflow-hidden">
                          {/* Decorative elements */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                          
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                              <Badge className="bg-yellow-400 text-white font-bold border-0 shadow-md">
                                <Award className="w-3 h-3 mr-1" />
                                COMPLETED
                              </Badge>
                              <Badge variant="secondary" className="bg-white/95 text-green-800 font-semibold">
                                {course.level}
                              </Badge>
                            </div>
                            <Badge variant="secondary" className="bg-white/90 text-green-800 w-fit font-medium">
                              {course.category}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-6 px-6 pb-4">
                          <CardTitle className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 min-h-[56px] flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                            <span>{course.title}</span>
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[60px]">
                            {course.description}
                          </CardDescription>

                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-green-600" />
                              <span className="font-medium">{course.moduleCount} modules</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-green-600" />
                              <span className="font-medium">{course.language}</span>
                            </div>
                          </div>

                          {/* Achievement Banner */}
                          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="bg-green-600 rounded-full p-1.5">
                                <Award className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-green-900">Certificate Ready</p>
                                <p className="text-xs text-green-700">100% Complete</p>
                              </div>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                          </div>
                        </CardContent>
                      </>
                    ) : (
                      /* Uncompleted Course Design */
                      <>
                        {/* Header with Learning Style */}
                        <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white pb-16 pt-6 relative overflow-hidden">
                          {/* Decorative elements */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                          
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <Badge variant="secondary" className="bg-white/95 text-blue-800 font-semibold">
                                {course.level}
                              </Badge>
                              <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 font-semibold border-0">
                                {course.timeToComplete}
                              </Badge>
                            </div>
                            <Badge variant="secondary" className="bg-white/95 text-blue-800 w-fit font-medium">
                              {course.category}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-6 px-6 pb-4">
                          <CardTitle className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 min-h-[56px]">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[60px]">
                            {course.description}
                          </CardDescription>

                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">{course.moduleCount} modules</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">{course.language}</span>
                            </div>
                          </div>

                          {/* Progress Bar for Enrolled Courses */}
                          {course.isEnrolled && course.completionPercentage !== undefined && (
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 font-medium">Your Progress</span>
                                <span className="font-bold text-blue-600">{course.completionPercentage}%</span>
                              </div>
                              <div className="relative">
                                <Progress value={course.completionPercentage} className="h-2" />
                              </div>
                              <p className="text-xs text-gray-500 text-center">
                                {course.completedModules || 0} of {course.totalModules || course.moduleCount} modules completed
                              </p>
                            </div>
                          )}

                          {/* Not Enrolled Badge */}
                          {!course.isEnrolled && (
                            <div className="mt-4">
                              <Badge variant="outline" className="w-full justify-center py-2 border-blue-200 text-blue-700 bg-blue-50">
                                <PlayCircle className="w-3 h-3 mr-1" />
                                Start Your Learning Journey
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </>
                    )}

                    {/* Footer for both designs */}
                    <CardFooter className="px-6 pb-6 pt-2 flex gap-3">
                      {isThisCourseEnrolling ? (
                        <Button
                          disabled
                          className="w-full bg-green-600 hover:bg-green-700 font-semibold shadow-md h-11"
                        >
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Enrolling...
                        </Button>
                      ) : course.isEnrolled ? (
                        <>
                          {course.isCourseCompleted ? (
                            <Button 
                              asChild 
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
                            >
                              <Link href={`/dashboard/courses/${course.id}/modules`}>
                                <Award className="w-4 h-4 mr-2" />
                                View Course
                              </Link>
                            </Button>
                          ) : (
                            <Button 
                              asChild 
                              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg"
                            >
                              <Link href={`/dashboard/courses/${course.id}/modules`}>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Continue Learning
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUnenroll(course.id)}
                            disabled={isThisCourseUnenrolling}
                            className="border-2 border-red-200 hover:bg-red-50 hover:border-red-300"
                            title="Unenroll from course"
                          >
                            {isThisCourseUnenrolling ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleEnroll(course.id)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg"
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Enroll Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>

          {/* Loading More */}
          {isFetchingNextPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <CourseSkeleton key={`loading-${index}`} />
              ))}
            </div>
          )}

          <div ref={ref} className="h-10 mt-10" />
        </div>
      </div>
    </div>
  );
};

export default Courses;