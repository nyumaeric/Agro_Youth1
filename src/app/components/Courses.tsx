// 'use client';
// import React, { useState, useEffect } from 'react';
// import { useInView } from "react-intersection-observer";
// import { useRouter } from 'next/navigation';
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import { useSession } from 'next-auth/react';
// import { Button } from '@/components/ui/button';
// import { WifiOff } from 'lucide-react';
// import { useCoursesWithOffline } from '@/hooks/useCourse';

// interface Course {
//   id: string;
//   title: string;
//   description: string;
//   category: string;
//   level: string;
//   moduleCount: number;
//   timeToComplete: string;
//   language: string;
// }

// const CourseSkeleton = () => (
//   <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
//     <Skeleton height={160} />
//     <div className="p-5">
//       <Skeleton height={20} className="mb-2" />
//       <Skeleton height={20} width="80%" className="mb-4" />
//       <Skeleton count={3} height={15} className="mb-4" />
//       <div className="flex items-center justify-between mb-4">
//         <Skeleton width={80} height={15} />
//         <Skeleton width={80} height={15} />
//       </div>
//       <Skeleton height={40} />
//     </div>
//   </div>
// );

// const Courses: React.FC = () => {
//   const { ref, inView } = useInView();
//   const router = useRouter();
//   const [isOnline, setIsOnline] = useState(true);
//   const [filter, setFilter] = useState({
//     category: '',
//     level: '',
//     language: ''
//   });

//   const {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     isLoading,
//     isError
//   } = useCoursesWithOffline();

//   useEffect(() => {
//     const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
//     updateOnlineStatus();
//     window.addEventListener('online', updateOnlineStatus);
//     window.addEventListener('offline', updateOnlineStatus);

//     return () => {
//       window.removeEventListener('online', updateOnlineStatus);
//       window.removeEventListener('offline', updateOnlineStatus);
//     };
//   }, []);

//   useEffect(() => {
//     if (inView && hasNextPage && !isFetchingNextPage && isOnline) {
//       fetchNextPage();
//     }
//   }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, isOnline]);

//   const allCourses = data?.pages.flatMap(page => page.data) || [];

//   const filteredCourses = allCourses.filter(course => {
//     if (filter.category && course.category !== filter.category) return false;
//     if (filter.level && course.level !== filter.level) return false;
//     if (filter.language && course.language !== filter.language) return false;
//     return true;
//   });

//   return (
//     <div className="min-h-screen py-28 bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold mb-4 text-yellow-600">
//             Agricultural Courses
//           </h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Enhance your farming skills with our comprehensive courses and earn certificates upon completion
//           </p>
//         </div>

//         {/* Offline Banner */}
//         {!isOnline && (
//           <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-lg flex items-center gap-3">
//             <WifiOff className="h-5 w-5 flex-shrink-0" />
//             <div>
//               <p className="font-semibold">You're currently offline</p>
//               <p className="text-sm">
//                 {allCourses.length > 0 
//                   ? 'Showing cached courses. Some features may be limited while offline.'
//                   : 'No cached courses available. Please connect to the internet.'}
//               </p>
//             </div>
//           </div>
//         )}

//         <div>
//           <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
//             <h2 className="text-2xl font-bold text-green-800 mb-6">Available Courses</h2>
            
//             {/* Filters */}
//             <div className="flex flex-wrap gap-4 mb-6">
//               <select
//                 value={filter.category}
//                 onChange={(e) => setFilter({...filter, category: e.target.value})}
//                 className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-w-[180px]"
//               >
//                 <option value="">All Categories</option>
//                 <option value="Crop Production">🌾 Crop Production</option>
//                 <option value="Livestock">🐄 Livestock</option>
//                 <option value="Sustainable Agriculture">🌱 Sustainable Agriculture</option>
//                 <option value="Agribusiness">💼 Agribusiness</option>
//               </select>

//               <select
//                 value={filter.level}
//                 onChange={(e) => setFilter({...filter, level: e.target.value})}
//                 className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-w-[150px]"
//               >
//                 <option value="">All Levels</option>
//                 <option value="Beginner">📚 Beginner</option>
//                 <option value="Intermediate">📖 Intermediate</option>
//                 <option value="Advanced">🎓 Advanced</option>
//               </select>

//               <Button
//                 onClick={() => setFilter({ category: '', level: '', language: '' })}
//                 className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
//               >
//                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
//                 </svg>
//                 <span>Clear Filters</span>
//               </Button>
//             </div>

//             {/* Course Count */}
//             <div className="text-gray-600 text-sm mb-4">
//               Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
//               {!isOnline && allCourses.length > 0 && ' (from cache)'}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {isLoading ? (
//               Array.from({ length: 8 }).map((_, index) => (
//                 <CourseSkeleton key={index} />
//               ))
//             ) : isError && allCourses.length === 0 ? (
//               <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//                 <div className="text-6xl mb-4">⚠️</div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                   {!isOnline ? 'No Cached Courses Available' : 'Error Loading Courses'}
//                 </h3>
//                 <p className="text-gray-600">
//                   {!isOnline 
//                     ? 'Please connect to the internet to load courses.' 
//                     : 'There was an error loading courses. Please try again later.'}
//                 </p>
//               </div>
//             ) : filteredCourses.length === 0 && allCourses.length > 0 ? (
//               <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//                 <div className="text-6xl mb-4">🔍</div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matching Courses</h3>
//                 <p className="text-gray-600">Try adjusting your filters to find courses.</p>
//               </div>
//             ) : filteredCourses.length === 0 ? (
//               <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//                 <div className="text-6xl mb-4">📚</div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Available</h3>
//                 <p className="text-gray-600">
//                   {!isOnline 
//                     ? 'No cached courses. Connect to the internet to load courses.'
//                     : 'Check back soon for new courses!'}
//                 </p>
//               </div>
//             ) : (
//               filteredCourses.map((course) => (
//                 <div
//                   key={course.id}
//                   className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
//                 >
//                   <div className="h-40 bg-gradient-to-r from-green-500 to-green-700 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gray-400 bg-opacity-20"></div>
//                     <div className="absolute top-3 left-3">
//                       <span className="bg-white bg-opacity-90 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
//                         {course.level}
//                       </span>
//                     </div>
//                     <div className="absolute top-3 right-3">
//                       <span className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
//                         {course.timeToComplete}
//                       </span>
//                     </div>
//                     <div className="absolute bottom-3 left-3 right-3">
//                       <span className="bg-white bg-opacity-90 text-green-800 text-xs font-medium px-2 py-1 rounded-full inline-block">
//                         {course.category}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="p-5">
//                     <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-14">
//                       {course.title}
//                     </h3>
//                     <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-16">
//                       {course.description}
//                     </p>

//                     <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
//                       <div className="flex items-center space-x-1">
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <span>{course.moduleCount} modules</span>
//                       </div>
//                       <div className="flex items-center space-x-1">
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                         </svg>
//                         <span>{course.language}</span>
//                       </div>
//                     </div>

//                     <Button
//                       onClick={() => {
//                         router.push("/dashboard/courses");
//                       }}
//                       // disabled={!isOnline}
//                       className="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                     >
//                       <span className="flex items-center justify-center space-x-2">
//                         {!isOnline && <WifiOff className="w-4 h-4" />}
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                         </svg>
//                         <span>Access Dashboard</span>
//                       </span>
//                     </Button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           {isFetchingNextPage && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
//               {Array.from({ length: 4 }).map((_, index) => (
//                 <CourseSkeleton key={`loading-${index}`} />
//               ))}
//             </div>
//           )}

//           {isOnline && <div ref={ref} className="h-10 mt-8" />}

//           {!hasNextPage && filteredCourses.length > 0 && (
//             <div className="text-center py-8">
//               <p className="text-gray-500">
//                 {isOnline 
//                   ? "You've reached the end of the courses" 
//                   : "Showing all cached courses"}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Courses;


'use client';
import React, { useState, useEffect } from 'react';
import { useInView } from "react-intersection-observer";
import { useRouter } from 'next/navigation';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { WifiOff } from 'lucide-react';
import { useCoursesWithOffline } from '@/hooks/useCourse';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  moduleCount: number;
  timeToComplete: string;
  language: string;
}

const CourseSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
    <Skeleton height={160} />
    <div className="p-5">
      <Skeleton height={20} className="mb-2" />
      <Skeleton height={20} width="80%" className="mb-4" />
      <Skeleton count={3} height={15} className="mb-4" />
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={80} height={15} />
        <Skeleton width={80} height={15} />
      </div>
      <Skeleton height={40} />
    </div>
  </div>
);

const Courses: React.FC = () => {
  const { ref, inView } = useInView();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOnline, setIsOnline] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    level: '',
    language: ''
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useCoursesWithOffline();

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && isOnline) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, isOnline]);

  const allCourses = data?.pages.flatMap(page => page.data) || [];

  const filteredCourses = allCourses.filter(course => {
    if (filter.category && course.category !== filter.category) return false;
    if (filter.level && course.level !== filter.level) return false;
    if (filter.language && course.language !== filter.language) return false;
    return true;
  });

  const handleCourseAccess = (courseId: string) => {
    if (status === 'authenticated' && session) {
      router.push(`/dashboard/courses/${courseId}/modules`);
    } else {
      const callbackUrl = encodeURIComponent(`/dashboard/courses/${courseId}/modules`);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  };

  return (
    <div className="min-h-screen py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-yellow-600">
            Agricultural Courses
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enhance your farming skills with our comprehensive courses and earn certificates upon completion
          </p>
        </div>

        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-lg flex items-center gap-3">
            <WifiOff className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">You're currently offline</p>
              <p className="text-sm">
                {allCourses.length > 0 
                  ? 'Showing cached courses. Some features may be limited while offline.'
                  : 'No cached courses available. Please connect to the internet.'}
              </p>
            </div>
          </div>
        )}

        <div>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Available Courses</h2>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <select
                value={filter.category}
                onChange={(e) => setFilter({...filter, category: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-w-[180px]"
              >
                <option value="">All Categories</option>
                <option value="Crop Production">🌾 Crop Production</option>
                <option value="Livestock">🐄 Livestock</option>
                <option value="Sustainable Agriculture">🌱 Sustainable Agriculture</option>
                <option value="Agribusiness">💼 Agribusiness</option>
              </select>

              <select
                value={filter.level}
                onChange={(e) => setFilter({...filter, level: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-w-[150px]"
              >
                <option value="">All Levels</option>
                <option value="Beginner">📚 Beginner</option>
                <option value="Intermediate">📖 Intermediate</option>
                <option value="Advanced">🎓 Advanced</option>
              </select>

              <Button
                onClick={() => setFilter({ category: '', level: '', language: '' })}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Clear Filters</span>
              </Button>
            </div>

            {/* Course Count */}
            <div className="text-gray-600 text-sm mb-4">
              Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
              {!isOnline && allCourses.length > 0 && ' (from cache)'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <CourseSkeleton key={index} />
              ))
            ) : isError && allCourses.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {!isOnline ? 'No Cached Courses Available' : 'Error Loading Courses'}
                </h3>
                <p className="text-gray-600">
                  {!isOnline 
                    ? 'Please connect to the internet to load courses.' 
                    : 'There was an error loading courses. Please try again later.'}
                </p>
              </div>
            ) : filteredCourses.length === 0 && allCourses.length > 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matching Courses</h3>
                <p className="text-gray-600">Try adjusting your filters to find courses.</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Available</h3>
                <p className="text-gray-600">
                  {!isOnline 
                    ? 'No cached courses. Connect to the internet to load courses.'
                    : 'Check back soon for new courses!'}
                </p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className="h-40 bg-gradient-to-r from-green-500 to-green-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gray-400 bg-opacity-20"></div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-white bg-opacity-90 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {course.level}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        {course.timeToComplete}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="bg-white bg-opacity-90 text-green-800 text-xs font-medium px-2 py-1 rounded-full inline-block">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-14">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-16">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{course.moduleCount} modules</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>{course.language}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleCourseAccess(course.id)}
                      disabled={!isOnline && status !== 'authenticated'}
                      className="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        {!isOnline && <WifiOff className="w-4 h-4" />}
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {status === 'authenticated' ? 'Start Learning' : 'Login to Start'}
                        </span>
                      </span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {isFetchingNextPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <CourseSkeleton key={`loading-${index}`} />
              ))}
            </div>
          )}

          {isOnline && <div ref={ref} className="h-10 mt-8" />}

          {!hasNextPage && filteredCourses.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {isOnline 
                  ? "You've reached the end of the courses" 
                  : "Showing all cached courses"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;