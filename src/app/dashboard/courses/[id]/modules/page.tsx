"use client";
import Certificate from "@/app/components/Certificate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCertificate, useClaimCertificate, useCourse } from "@/hooks/useCourses";
import { Award, Loader, Verified, WifiOff, Cloud } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getFromCache, saveToCache } from "@/utils/db";

function CoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    const { data, isPending, isError } = useCourse(courseId!);
    const { data: certificateData, refetch: refetchCertificate } = useCertificate(courseId!);
    const { mutate: claimCertificate, isPending: isClaimingCertificate } = useClaimCertificate();
    
    const [showCertificate, setShowCertificate] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [showSyncNotification, setShowSyncNotification] = useState(false);
    const [cachedCourseData, setCachedCourseData] = useState<any>(null);
    const [hasLoadedCache, setHasLoadedCache] = useState(false);
    
    useEffect(() => {
        const cached = getFromCache<any>(`course-${courseId}`);
        if (cached) {
            setCachedCourseData(cached);
        }
        setHasLoadedCache(true);
    }, [courseId]);
    
    useEffect(() => {
        if (data?.data && isOnline) {
            saveToCache(`course-${courseId}`, data);
        }
    }, [data, isOnline, courseId]);
    
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowSyncNotification(true);
            setTimeout(() => setShowSyncNotification(false), 5000);
        };
        const handleOffline = () => setIsOnline(false);
        
        setIsOnline(navigator.onLine);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    
    const displayData = isOnline ? data : cachedCourseData;
    const isLoadingOrError = isOnline ? isPending : !hasLoadedCache;
    const hasError = isOnline ? isError : !cachedCourseData;
    
    if (isLoadingOrError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Loader className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"/>
                    <p className="text-gray-600">{isOnline ? 'Loading course...' : 'Loading from cache...'}</p>
                </div>
            </div>
        );
    }

    if (hasError || !displayData?.data) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">
                        {isOnline ? 'Error loading course' : 'No cached data available offline'}
                    </p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const course = displayData.data;
    const modules = course.modules || [];
    const progress = course.progress || {
        completedModules: 0,
        totalModules: modules.length,
        progressPercentage: 0,
        isCompleted: false,
    };

    const isCourseCompleted = progress.isCompleted;
    const hasCertificate = certificateData?.data && !certificateData.data.canClaim;
    const canClaimCertificate = isCourseCompleted && !hasCertificate && isOnline;
    
    const handleClaimCertificate = () => {
        if (!isOnline) {
            alert('Cannot claim certificate while offline. Please connect to the internet.');
            return;
        }
        
        claimCertificate(courseId as string, {
            onSuccess: (data) => {
                setTimeout(() => {
                    setShowCertificate(true);
                }, 100);
            }
        });
    };

    const handleViewCertificate = () => {
        setShowCertificate(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                {/* Sync Notification */}
                {showSyncNotification && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <Cloud className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-green-900">
                                    Back online! Course data updated...
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {!isOnline && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <WifiOff className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-yellow-900">
                                    You're currently offline
                                </p>
                                <p className="text-xs text-yellow-700 mt-0.5">
                                    Viewing cached course data. You can continue learning. Changes will sync when you're back online.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {showCertificate && hasCertificate && (
                    <Certificate
                        certificate={certificateData.data}
                        onClose={() => setShowCertificate(false)}
                        userName={certificateData.data.userName}
                    />
                )}
                
                <div className="mb-6">
                    <Button 
                        onClick={() => router.push(`/dashboard/courses/${courseId}/posts`)} 
                        className="bg-slate-900 py-2 px-4"
                        disabled={!isOnline}
                    >
                        {isOnline ? 'Start Discussion' : 'Discussion (Online Only)'}
                    </Button>
                </div>

                {/* Course Header */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
                    <div className="p-8 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {course.level}
                            </span>
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {course.category}
                            </span>
                            {!isOnline && (
                                <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full flex items-center gap-1">
                                    <WifiOff className="w-3 h-3" />
                                    Offline Mode
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                            {isCourseCompleted && (
                                <Verified className="w-8 h-8 text-white fill-blue-600 flex-shrink-0" />
                            )}
                        </div>

                        <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>

                        {/* Progress Bar */}
                        {modules.length > 0 && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        Course Progress
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">
                                        {progress.completedModules}/{progress.totalModules} modules completed
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`${isCourseCompleted ? 'bg-green-600' : 'bg-blue-600'} h-3 rounded-full transition-all duration-500`}
                                        style={{ width: `${progress.progressPercentage}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {progress.progressPercentage}% Complete
                                </p>
                            </div>
                        )}

                        {/* Certificate Section */}
                        {isCourseCompleted && (
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                                            <Award className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            🎉 Congratulations! Course Completed!
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            You've successfully completed all modules in this course.
                                        </p>
                                        {!isOnline && (
                                            <p className="text-xs text-yellow-600 mt-2">
                                                Connect to the internet to claim your certificate.
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0">
                                        {canClaimCertificate ? (
                                            <Button
                                                onClick={handleClaimCertificate}
                                                disabled={isClaimingCertificate || !isOnline}
                                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md disabled:opacity-50"
                                            >
                                                {isClaimingCertificate ? (
                                                    <>
                                                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                                                        Claiming...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Award className="w-5 h-5 mr-2" />
                                                        Claim Certificate
                                                    </>
                                                )}
                                            </Button>
                                        ) : hasCertificate ? (
                                            <Button
                                                onClick={handleViewCertificate}
                                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                                            >
                                                <Award className="w-5 h-5 mr-2" />
                                                View Certificate
                                            </Button>
                                        ) : isClaimingCertificate ? (
                                            <Button
                                                disabled
                                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md opacity-50"
                                            >
                                                <Loader className="w-5 h-5 mr-2 animate-spin" />
                                                Processing...
                                            </Button>
                                        ) : !isOnline ? (
                                            <Button
                                                disabled
                                                className="bg-gray-400 text-white shadow-md opacity-50"
                                            >
                                                <WifiOff className="w-5 h-5 mr-2" />
                                                Offline
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Course Info */}
                    <div className="p-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                                <p className="text-gray-900 font-medium">{course.timeToComplete}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Language</p>
                                <p className="text-gray-900 font-medium">{course.language}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Modules</p>
                                <p className="text-gray-900 font-medium">{modules.length} modules</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Modules */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-8 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Course Content
                            </h2>
                            {modules.length > 0 && (
                                <Badge className="text-sm text-white bg-gray-500 px-3 py-2">
                                    {progress.completedModules} of {modules.length} completed
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {modules.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <p className="text-gray-500 mb-1">No modules available yet</p>
                                <p className="text-sm text-gray-400">Check back later for course content</p>
                            </div>
                        ) : (
                            modules.map((module: any, index: number) => (
                                <div
                                    key={module.id}
                                    className="p-6 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 mb-2">
                                                {module.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                                {module.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{module.durationTime}</span>
                                                </div>
                                                {module.isCompleted && (
                                                    <div className="flex items-center gap-1.5 text-green-600">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <Badge className="font-medium bg-green-400 text-white">Completed</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Link 
                                            href={`/dashboard/courses/${courseId}/modules/${module.id}`}
                                            className="flex-shrink-0 text-sm font-medium transition-colors duration-150 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer inline-block text-center"
                                        >
                                            {module.isCompleted ? 'Review' : 'Start'}
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CoursePage;