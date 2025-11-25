// "use client";
// import { Button } from "@/components/ui/button";
// import { useCourseModule, useCourse } from "@/hooks/useCourses";
// import { useUpdateModules } from "@/hooks/useModules";
// import { Loader, Loader2, FileText, Video, WifiOff, CheckCircle2, Cloud } from "lucide-react";
// import { useParams, useRouter } from "next/navigation";
// import { useRef, useState, useEffect } from "react";
// import { getFromCache, saveToCache } from "@/utils/db";

// export default function ModulePage() {
//     const router = useRouter();
//     const params = useParams();
//     const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
//     const moduleId = Array.isArray(params.ids) ? params.ids[0] : params.ids;
    
//     const videoRef = useRef<HTMLVideoElement>(null);
//     const [videoProgress, setVideoProgress] = useState(0);
//     const [hasAutoCompleted, setHasAutoCompleted] = useState(false);
//     const [isOnline, setIsOnline] = useState(true);
//     const [showSyncNotification, setShowSyncNotification] = useState(false);
//     const [optimisticCompleted, setOptimisticCompleted] = useState(false);
//     const [cachedModuleData, setCachedModuleData] = useState<any>(null);
//     const [cachedCourseData, setCachedCourseData] = useState<any>(null);
//     const [hasLoadedCache, setHasLoadedCache] = useState(false);
    
//     const AUTO_COMPLETE_THRESHOLD = 0.8;

//     // Load cache on mount
//     useEffect(() => {
//         const cachedModule = getFromCache<any>(`module-${courseId}-${moduleId}`);
//         const cachedCourse = getFromCache<any>(`course-${courseId}`);
        
//         if (cachedModule) {
//             setCachedModuleData(cachedModule);
//         }
//         if (cachedCourse) {
//             setCachedCourseData(cachedCourse);
//         }
//         setHasLoadedCache(true);
//     }, [courseId, moduleId]);

//     useEffect(() => {
//         const handleOnline = () => {
//             setIsOnline(true);
//             setShowSyncNotification(true);
//             setTimeout(() => setShowSyncNotification(false), 5000);
//         };
//         const handleOffline = () => setIsOnline(false);
        
//         setIsOnline(navigator.onLine);
        
//         window.addEventListener('online', handleOnline);
//         window.addEventListener('offline', handleOffline);
        
//         return () => {
//             window.removeEventListener('online', handleOnline);
//             window.removeEventListener('offline', handleOffline);
//         };
//     }, []);

//     if (typeof courseId !== "string" || typeof moduleId !== "string") {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-gray-50">
//                 <div className="text-center">
//                     <p className="text-red-600 mb-4">Invalid course or module ID</p>
//                 </div>
//             </div>
//         );
//     }

//     const { data, isPending, isError } = useCourseModule(courseId, moduleId);
//     const { data: courseData } = useCourse(courseId);
//     const { mutate: updateModule, isPending: isUpdating } = useUpdateModules();
    
//     // Update cache when online data arrives
//     useEffect(() => {
//         if (data?.data && isOnline) {
//             saveToCache(`module-${courseId}-${moduleId}`, data);
//             setCachedModuleData(data);
//             console.log("[ModulePage] Cached module data for offline use");
//         }
//     }, [data, isOnline, courseId, moduleId]);

//     // Update course cache when online data arrives
//     useEffect(() => {
//         if (courseData?.data && isOnline) {
//             saveToCache(`course-${courseId}`, courseData);
//             setCachedCourseData(courseData);
//             console.log("[ModulePage] Cached course data for offline use");
//         }
//     }, [courseData, isOnline, courseId]);
    
//     // Reset optimistic state when data changes (online sync)
//     useEffect(() => {
//         if (data?.data?.isCompleted !== undefined && isOnline) {
//             setOptimisticCompleted(false);
//         }
//     }, [data?.data?.isCompleted, isOnline]);
    
//     useEffect(() => {
//         const video = videoRef.current;
//         const displayData = isOnline ? data : cachedModuleData;
        
//         if (!video || displayData?.data?.contentType !== "video") return;

//         const handleTimeUpdate = () => {
//             const currentTime = video.currentTime;
//             const duration = video.duration;
            
//             if (duration && !isNaN(duration)) {
//                 const progress = currentTime / duration;
//                 setVideoProgress(progress);
                
//                 // Auto-complete when reaching threshold
//                 if (
//                     progress >= AUTO_COMPLETE_THRESHOLD && 
//                     !hasAutoCompleted && 
//                     !displayData.data.isCompleted
//                 ) {
//                     setHasAutoCompleted(true);
//                     updateModule({
//                         id: courseId,
//                         ids: moduleId,
//                         data: {
//                             isCompleted: true,
//                         }
//                     });
//                 }
//             }
//         };

//         const handleLoadedMetadata = () => {
//             setHasAutoCompleted(false);
//         };

//         video.addEventListener("timeupdate", handleTimeUpdate);
//         video.addEventListener("loadedmetadata", handleLoadedMetadata);

//         return () => {
//             video.removeEventListener("timeupdate", handleTimeUpdate);
//             video.removeEventListener("loadedmetadata", handleLoadedMetadata);
//         };
//     }, [data?.data, cachedModuleData, courseId, moduleId, updateModule, hasAutoCompleted, isOnline]);
    
//     // Use cached data when offline, API data when online
//     const displayModuleData = isOnline ? data : cachedModuleData;
//     const displayCourseData = isOnline ? courseData : cachedCourseData;
//     const isLoadingOrError = isOnline ? isPending : !hasLoadedCache;
//     const hasError = isOnline ? isError : !cachedModuleData;
    
//     if (isLoadingOrError) {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-gray-50">
//                 <div className="text-center">
//                     <Loader className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"/>
//                     <p className="text-gray-600">{isOnline ? 'Loading module...' : 'Loading from cache...'}</p>
//                 </div>
//             </div>
//         );
//     }

//     if (hasError || !displayModuleData?.data) {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-gray-50">
//                 <div className="text-center">
//                     <p className="text-red-600 mb-4">
//                         {isOnline ? 'Error loading module' : 'No cached data available offline'}
//                     </p>
//                     <Button 
//                         onClick={() => router.push(`/dashboard/courses/${courseId}/modules`)}
//                         variant="outline"
//                     >
//                         Back to Course
//                     </Button>
//                 </div>
//             </div>
//         );
//     }

//     const module = displayModuleData.data;
//     const modules = displayCourseData?.data?.modules || [];
//     const currentModuleIndex = modules.findIndex((m: { id: string; }) => m.id === moduleId);
//     const nextModule = modules[currentModuleIndex + 1];
//     const hasNextModule = currentModuleIndex !== -1 && nextModule;

//     // Use optimistic state when offline, actual state when online
//     const isModuleCompleted = isOnline ? module.isCompleted : (optimisticCompleted || module.isCompleted);

//     const handleToggleComplete = () => {
//         // Set optimistic UI update for offline
//         if (!isOnline) {
//             setOptimisticCompleted(!isModuleCompleted);
            
//             // Update cached module data
//             const updatedCachedModule = {
//                 ...cachedModuleData,
//                 data: {
//                     ...cachedModuleData.data,
//                     isCompleted: !isModuleCompleted
//                 }
//             };
//             setCachedModuleData(updatedCachedModule);
//             saveToCache(`module-${courseId}-${moduleId}`, updatedCachedModule);
            
//             // Update cached course data modules
//             if (cachedCourseData?.data?.modules) {
//                 const updatedCachedCourse = {
//                     ...cachedCourseData,
//                     data: {
//                         ...cachedCourseData.data,
//                         modules: cachedCourseData.data.modules.map((m: any) =>
//                             m.id === moduleId ? { ...m, isCompleted: !isModuleCompleted } : m
//                         )
//                     }
//                 };
//                 setCachedCourseData(updatedCachedCourse);
//                 saveToCache(`course-${courseId}`, updatedCachedCourse);
//             }
//         }
        
//         updateModule({
//             id: courseId,
//             ids: moduleId,
//             data: {
//                 isCompleted: !isModuleCompleted,
//             }
//         });
//     };

//     const handleNextModule = () => {
//         if (hasNextModule) {
//             router.push(`/dashboard/courses/${courseId}/modules/${nextModule.id}`);
//         } else {
//             router.push(`/dashboard/courses/${courseId}/modules`);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 py-8">
//             <div className="max-w-6xl mx-auto px-4">
//                 {/* Sync Notification */}
//                 {showSyncNotification && (
//                     <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
//                         <div className="flex items-center gap-3">
//                             <Cloud className="w-5 h-5 text-green-600 flex-shrink-0" />
//                             <div>
//                                 <p className="text-sm font-medium text-green-900">
//                                     Back online! Syncing your progress...
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Offline Indicator */}
//                 {!isOnline && (
//                     <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                         <div className="flex items-center gap-3">
//                             <WifiOff className="w-5 h-5 text-yellow-600 flex-shrink-0" />
//                             <div>
//                                 <p className="text-sm font-medium text-yellow-900">
//                                     You're currently offline
//                                 </p>
//                                 <p className="text-xs text-yellow-700 mt-0.5">
//                                     Your progress will be saved and synced when you're back online.
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 <Button
//                     onClick={() => router.push(`/dashboard/courses/${courseId}/modules`)}
//                     variant="ghost"
//                     className="mb-6"
//                 >
//                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                     </svg>
//                     Back to Course
//                 </Button>

//                 {/* Module Header */}
//                 <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
//                     <div className="p-8">
//                         <div className="flex items-center gap-3 mb-4">
//                             {isModuleCompleted && (
//                                 <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
//                                     <CheckCircle2 className="w-4 h-4" />
//                                     Completed
//                                 </span>
//                             )}
//                             <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
//                                 {module.durationTime}
//                             </span>
//                             <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
//                                 {module.contentType === "video" ? (
//                                     <>
//                                         <Video className="w-3 h-3" />
//                                         Video
//                                     </>
//                                 ) : (
//                                     <>
//                                         <FileText className="w-3 h-3" />
//                                         Text
//                                     </>
//                                 )}
//                             </span>
//                             {!isOnline && (
//                                 <span className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
//                                     <WifiOff className="w-3 h-3" />
//                                     Offline Mode
//                                 </span>
//                             )}
//                         </div>
                        
//                         <h1 className="text-3xl font-bold text-gray-900 mb-4">{module.title}</h1>
//                         <p className="text-gray-600 leading-relaxed text-lg">{module.description}</p>
//                     </div>
//                 </div>

//                 {/* Module Content */}
//                 <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
//                     <div className="p-8">
//                         <h2 className="text-xl font-bold text-gray-900 mb-6">Module Content</h2>
                        
//                         {module.contentType === "video" && module.contentUrl ? (
//                             <div className="space-y-4">
//                                 <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%" }}>
//                                     <video 
//                                         ref={videoRef}
//                                         className="absolute top-0 left-0 w-full h-full"
//                                         controls
//                                         controlsList="nodownload"
//                                         preload="metadata"
//                                     >
//                                         <source src={module.contentUrl} type="video/mp4" />
//                                         Your browser does not support the video tag.
//                                     </video>
//                                 </div>
                                
//                                 {/* Video Progress Indicator */}
//                                 {videoProgress > 0 && (
//                                     <div className="bg-gray-50 rounded-lg p-4">
//                                         <div className="flex items-center justify-between mb-2">
//                                             <span className="text-sm font-medium text-gray-700">
//                                                 Video Progress
//                                             </span>
//                                             <span className="text-sm text-gray-600">
//                                                 {Math.round(videoProgress * 100)}%
//                                             </span>
//                                         </div>
//                                         <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
//                                             <div 
//                                                 className="bg-blue-600 h-full rounded-full transition-all duration-300"
//                                                 style={{ width: `${videoProgress * 100}%` }}
//                                             />
//                                         </div>
//                                         {videoProgress >= AUTO_COMPLETE_THRESHOLD && !isModuleCompleted && (
//                                             <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
//                                                 <CheckCircle2 className="w-4 h-4" />
//                                                 Module automatically marked as complete!
//                                                 {!isOnline && " (Will sync when online)"}
//                                             </p>
//                                         )}
//                                     </div>
//                                 )}
                                
//                                 {module.textContent && (
//                                     <div className="mt-6">
//                                         <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
//                                         <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
//                                             {module.textContent}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         ) : module.contentType === "text" && module.textContent ? (
//                             <div className="prose max-w-none">
//                                 <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
//                                     {module.textContent}
//                                 </div>
//                             </div>
//                         ) : (
//                             <div className="text-center py-12 bg-gray-50 rounded-lg">
//                                 <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
//                                     <FileText className="w-8 h-8 text-gray-400" />
//                                 </div>
//                                 <p className="text-gray-600 mb-2">No content available for this module</p>
//                                 <p className="text-sm text-gray-500">Content will be added soon</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//                     <div className="p-6 flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                             {isUpdating ? (
//                                 <Button 
//                                     className="bg-gray-900 text-white cursor-pointer"
//                                     disabled
//                                 >
//                                     <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                                     {isOnline ? 'Updating...' : 'Saving offline...'}
//                                 </Button>
//                             ) : isModuleCompleted ? (
//                                 <div className="flex items-center gap-3">
//                                     <Button
//                                         variant="outline"
//                                         className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
//                                         onClick={handleToggleComplete}
//                                     >
//                                         <CheckCircle2 className="w-5 h-5 mr-2" />
//                                         Mark as Incomplete
//                                     </Button>
//                                     {!isOnline && (
//                                         <span className="text-xs text-yellow-600 flex items-center gap-1">
//                                             <WifiOff className="w-3 h-3" />
//                                             Changes will sync online
//                                         </span>
//                                     )}
//                                 </div>
//                             ) : (
//                                 <div className="flex items-center gap-3">
//                                     <Button 
//                                         className="bg-gray-900 hover:bg-gray-800 text-white"
//                                         onClick={handleToggleComplete}
//                                     >
//                                         <CheckCircle2 className="w-5 h-5 mr-2" />
//                                         Mark as Complete
//                                     </Button>
//                                     {!isOnline && (
//                                         <span className="text-xs text-yellow-600 flex items-center gap-1">
//                                             <WifiOff className="w-3 h-3" />
//                                             Changes will sync online
//                                         </span>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
                        
//                         <Button 
//                             variant="outline"
//                             onClick={handleNextModule}
//                         >
//                             {hasNextModule ? (
//                                 <>
//                                     Next Module
//                                     <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                                     </svg>
//                                 </>
//                             ) : (
//                                 "Back to Course"
//                             )}
//                         </Button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


"use client";
import { Button } from "@/components/ui/button";
import { useCourseModule, useCourse } from "@/hooks/useCourses";
import { useUpdateModules } from "@/hooks/useModules";
import { Loader, Loader2, FileText, Video, WifiOff, CheckCircle2, Cloud, Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { getFromCache, saveToCache } from "@/utils/db";

export default function ModulePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
    const moduleId = Array.isArray(params.ids) ? params.ids[0] : params.ids;
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoProgress, setVideoProgress] = useState(0);
    const [maxWatchedTime, setMaxWatchedTime] = useState(0);
    const [hasAutoCompleted, setHasAutoCompleted] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [showSyncNotification, setShowSyncNotification] = useState(false);
    const [optimisticCompleted, setOptimisticCompleted] = useState(false);
    const [cachedModuleData, setCachedModuleData] = useState<any>(null);
    const [cachedCourseData, setCachedCourseData] = useState<any>(null);
    const [hasLoadedCache, setHasLoadedCache] = useState(false);
    const [showSkipWarning, setShowSkipWarning] = useState(false);
    
    const AUTO_COMPLETE_THRESHOLD = 0.8;

    // Load cache on mount
    useEffect(() => {
        const cachedModule = getFromCache<any>(`module-${courseId}-${moduleId}`);
        const cachedCourse = getFromCache<any>(`course-${courseId}`);
        
        if (cachedModule) {
            setCachedModuleData(cachedModule);
        }
        if (cachedCourse) {
            setCachedCourseData(cachedCourse);
        }
        setHasLoadedCache(true);
    }, [courseId, moduleId]);

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

    if (typeof courseId !== "string" || typeof moduleId !== "string") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Invalid course or module ID</p>
                </div>
            </div>
        );
    }

    const { data, isPending, isError } = useCourseModule(courseId, moduleId);
    const { data: courseData } = useCourse(courseId);
    const { mutate: updateModule, isPending: isUpdating } = useUpdateModules();
    
    // Update cache when online data arrives
    useEffect(() => {
        if (data?.data && isOnline) {
            saveToCache(`module-${courseId}-${moduleId}`, data);
            setCachedModuleData(data);
            console.log("[ModulePage] Cached module data for offline use");
        }
    }, [data, isOnline, courseId, moduleId]);

    // Update course cache when online data arrives
    useEffect(() => {
        if (courseData?.data && isOnline) {
            saveToCache(`course-${courseId}`, courseData);
            setCachedCourseData(courseData);
            console.log("[ModulePage] Cached course data for offline use");
        }
    }, [courseData, isOnline, courseId]);
    
    // Reset optimistic state when data changes (online sync)
    useEffect(() => {
        if (data?.data?.isCompleted !== undefined && isOnline) {
            setOptimisticCompleted(false);
        }
    }, [data?.data?.isCompleted, isOnline]);
    
    useEffect(() => {
        const video = videoRef.current;
        const displayData = isOnline ? data : cachedModuleData;
        
        if (!video || displayData?.data?.contentType !== "video") return;

        const handleTimeUpdate = () => {
            const currentTime = video.currentTime;
            const duration = video.duration;
            
            if (duration && !isNaN(duration)) {
                const progress = currentTime / duration;
                setVideoProgress(progress);
                
                // Track the maximum time the user has watched
                if (currentTime > maxWatchedTime) {
                    setMaxWatchedTime(currentTime);
                }
                
                // Auto-complete when reaching threshold
                if (
                    progress >= AUTO_COMPLETE_THRESHOLD && 
                    !hasAutoCompleted && 
                    !displayData.data.isCompleted
                ) {
                    setHasAutoCompleted(true);
                    updateModule({
                        id: courseId,
                        ids: moduleId,
                        data: {
                            isCompleted: true,
                        }
                    });
                }
            }
        };

        const handleSeeking = (e: Event) => {
            const currentTime = video.currentTime;
            
            // Allow going backward, prevent seeking forward beyond what has been watched
            if (currentTime > maxWatchedTime) {
                e.preventDefault();
                video.currentTime = maxWatchedTime;
                setShowSkipWarning(true);
                setTimeout(() => setShowSkipWarning(false), 2000);
            }
        };

        const handleRateChange = () => {
            // Prevent speeding up the video
            if (video.playbackRate !== 1) {
                video.playbackRate = 1;
                setShowSkipWarning(true);
                setTimeout(() => setShowSkipWarning(false), 2000);
            }
        };

        const handleLoadedMetadata = () => {
            setHasAutoCompleted(false);
            setMaxWatchedTime(0);
            video.playbackRate = 1;
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("seeking", handleSeeking);
        video.addEventListener("ratechange", handleRateChange);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("seeking", handleSeeking);
            video.removeEventListener("ratechange", handleRateChange);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, [data?.data, cachedModuleData, courseId, moduleId, updateModule, hasAutoCompleted, isOnline, maxWatchedTime]);
    
    // Use cached data when offline, API data when online
    const displayModuleData = isOnline ? data : cachedModuleData;
    const displayCourseData = isOnline ? courseData : cachedCourseData;
    const isLoadingOrError = isOnline ? isPending : !hasLoadedCache;
    const hasError = isOnline ? isError : !cachedModuleData;
    
    if (isLoadingOrError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Loader className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"/>
                    <p className="text-gray-600">{isOnline ? 'Loading module...' : 'Loading from cache...'}</p>
                </div>
            </div>
        );
    }

    if (hasError || !displayModuleData?.data) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">
                        {isOnline ? 'Error loading module' : 'No cached data available offline'}
                    </p>
                    <Button 
                        onClick={() => router.push(`/dashboard/courses/${courseId}/modules`)}
                        variant="outline"
                    >
                        Back to Course
                    </Button>
                </div>
            </div>
        );
    }

    const module = displayModuleData.data;
    const modules = displayCourseData?.data?.modules || [];
    const currentModuleIndex = modules.findIndex((m: { id: string; }) => m.id === moduleId);
    const nextModule = modules[currentModuleIndex + 1];
    const hasNextModule = currentModuleIndex !== -1 && nextModule;

    // Use optimistic state when offline, actual state when online
    const isModuleCompleted = isOnline ? module.isCompleted : (optimisticCompleted || module.isCompleted);
    
    // For video modules, disable manual completion entirely
    const canManuallyComplete = module.contentType === "video" ? false : true;

    const handleToggleComplete = () => {
        // For video modules, prevent all manual completion actions
        if (module.contentType === "video") {
            setShowSkipWarning(true);
            setTimeout(() => setShowSkipWarning(false), 3000);
            return;
        }
        
        // Set optimistic UI update for offline
        if (!isOnline) {
            setOptimisticCompleted(!isModuleCompleted);
            
            // Update cached module data
            const updatedCachedModule = {
                ...cachedModuleData,
                data: {
                    ...cachedModuleData.data,
                    isCompleted: !isModuleCompleted
                }
            };
            setCachedModuleData(updatedCachedModule);
            saveToCache(`module-${courseId}-${moduleId}`, updatedCachedModule);
            
            // Update cached course data modules
            if (cachedCourseData?.data?.modules) {
                const updatedCachedCourse = {
                    ...cachedCourseData,
                    data: {
                        ...cachedCourseData.data,
                        modules: cachedCourseData.data.modules.map((m: any) =>
                            m.id === moduleId ? { ...m, isCompleted: !isModuleCompleted } : m
                        )
                    }
                };
                setCachedCourseData(updatedCachedCourse);
                saveToCache(`course-${courseId}`, updatedCachedCourse);
            }
        }
        
        updateModule({
            id: courseId,
            ids: moduleId,
            data: {
                isCompleted: !isModuleCompleted,
            }
        });
    };

    const handleNextModule = () => {
        if (hasNextModule) {
            router.push(`/dashboard/courses/${courseId}/modules/${nextModule.id}`);
        } else {
            router.push(`/dashboard/courses/${courseId}/modules`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Skip Warning */}
                {showSkipWarning && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-red-900">
                                    {module.contentType === "video" 
                                        ? "Video modules complete automatically at 80%. Manual completion is disabled."
                                        : "You cannot skip forward in the video. You can rewind and rewatch previous parts."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sync Notification */}
                {showSyncNotification && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <Cloud className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-green-900">
                                    Back online! Syncing your progress...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Offline Indicator */}
                {!isOnline && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <WifiOff className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-yellow-900">
                                    You're currently offline
                                </p>
                                <p className="text-xs text-yellow-700 mt-0.5">
                                    Your progress will be saved and synced when you're back online.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    onClick={() => router.push(`/dashboard/courses/${courseId}/modules`)}
                    variant="ghost"
                    className="mb-6"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Course
                </Button>

                {/* Module Header */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                            {isModuleCompleted && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Completed
                                </span>
                            )}
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {module.durationTime}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                                {module.contentType === "video" ? (
                                    <>
                                        <Video className="w-3 h-3" />
                                        Video
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-3 h-3" />
                                        Text
                                    </>
                                )}
                            </span>
                            {!isOnline && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
                                    <WifiOff className="w-3 h-3" />
                                    Offline Mode
                                </span>
                            )}
                        </div>
                        
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{module.title}</h1>
                        <p className="text-gray-600 leading-relaxed text-lg">{module.description}</p>
                    </div>
                </div>

                {/* Module Content */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Module Content</h2>
                        
                        {module.contentType === "video" && module.contentUrl ? (
                            <div className="space-y-4">
                                {/* Info Banner */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-800">
                                            You can rewind the video, but cannot skip forward. You must watch sequentially. 
                                            The module will be automatically marked as complete when you reach {Math.round(AUTO_COMPLETE_THRESHOLD * 100)}%.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                                    <video 
                                        ref={videoRef}
                                        className="absolute top-0 left-0 w-full h-full"
                                        controls
                                        controlsList="nodownload noplaybackrate"
                                        disablePictureInPicture
                                        preload="metadata"
                                    >
                                        <source src={module.contentUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                
                                {/* Video Progress Indicator */}
                                {videoProgress > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Video Progress
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {Math.round(videoProgress * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                                style={{ width: `${videoProgress * 100}%` }}
                                            />
                                        </div>
                                        {videoProgress >= AUTO_COMPLETE_THRESHOLD && !isModuleCompleted && (
                                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Module automatically marked as complete!
                                                {!isOnline && " (Will sync when online)"}
                                            </p>
                                        )}
                                        {videoProgress < AUTO_COMPLETE_THRESHOLD && (
                                            <p className="text-xs text-gray-600 mt-2">
                                                Watch {Math.round((AUTO_COMPLETE_THRESHOLD - videoProgress) * 100)}% more to complete this module
                                            </p>
                                        )}
                                    </div>
                                )}
                                
                                {module.textContent && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
                                        <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                                            {module.textContent}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : module.contentType === "text" && module.textContent ? (
                            <div className="prose max-w-none">
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {module.textContent}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 mb-2">No content available for this module</p>
                                <p className="text-sm text-gray-500">Content will be added soon</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isUpdating ? (
                                <Button 
                                    className="bg-gray-900 text-white cursor-pointer"
                                    disabled
                                >
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    {isOnline ? 'Updating...' : 'Saving offline...'}
                                </Button>
                            ) : module.contentType === "video" ? (
                                // For video modules, always show disabled button
                                <div className="flex items-center gap-3">
                                    <Button
                                        className="bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white"
                                        disabled
                                    >
                                        <Lock className="w-4 h-4 mr-2" />
                                        {isModuleCompleted ? "Completed Automatically" : "Completes at 80%"}
                                    </Button>
                                    <span className="text-xs text-gray-600">
                                        Video modules complete automatically
                                    </span>
                                </div>
                            ) : isModuleCompleted ? (
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                        onClick={handleToggleComplete}
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Mark as Incomplete
                                    </Button>
                                    {!isOnline && (
                                        <span className="text-xs text-yellow-600 flex items-center gap-1">
                                            <WifiOff className="w-3 h-3" />
                                            Changes will sync online
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Button 
                                        className="bg-gray-900 hover:bg-gray-800 text-white"
                                        onClick={handleToggleComplete}
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Mark as Complete
                                    </Button>
                                    {!isOnline && (
                                        <span className="text-xs text-yellow-600 flex items-center gap-1">
                                            <WifiOff className="w-3 h-3" />
                                            Changes will sync online
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <Button 
                            variant="outline"
                            onClick={handleNextModule}
                        >
                            {hasNextModule ? (
                                <>
                                    Next Module
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            ) : (
                                "Back to Course"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}