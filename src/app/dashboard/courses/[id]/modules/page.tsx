"use client";
import Certificate from "@/app/components/Certificate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCertificate, useClaimCertificate, useCourse } from "@/hooks/useCourses";
import { Award, Loader, Verified } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

function CoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    const { data, isPending, isError } = useCourse(courseId!);
    const { data: certificateData, refetch: refetchCertificate } = useCertificate(courseId!);
    const { mutate: claimCertificate, isPending: isClaimingCertificate } = useClaimCertificate();
    
    const [showCertificate, setShowCertificate] = useState(false);
    
    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Loader className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"/>
                    <p className="text-gray-600">Loading course...</p>
                </div>
            </div>
        );
    }

    if (isError || !data?.data) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error loading course</p>
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

    const course = data.data;
    const modules = course.modules || [];
    const progress = course.progress || {
        completedModules: 0,
        totalModules: modules.length,
        progressPercentage: 0,
        isCompleted: false,
    };

    const isCourseCompleted = progress.isCompleted;
    const hasCertificate = certificateData?.data && !certificateData.data.canClaim;
    const canClaimCertificate = isCourseCompleted && !hasCertificate;

    // const handleClaimCertificate = () => {
    //     claimCertificate(courseId as string, {
    //         onSuccess: () => {
    //             refetchCertificate();
    //             setShowCertificate(true);
    //         }
    //     });
    // };
    const handleClaimCertificate = () => {
        claimCertificate(courseId as string, {
            onSuccess: (data) => {
                // Certificate data is already optimistically updated
                // Just show the certificate modal
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
                    >
                        Start Discussion
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
                                    </div>
                                    <div className="flex-shrink-0">
                                    {canClaimCertificate ? (
                                            <Button
                                                onClick={handleClaimCertificate}
                                                disabled={isClaimingCertificate}
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
export default CoursePage