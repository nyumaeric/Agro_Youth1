// 'use client';
// import React from 'react';
// import { useSession } from 'next-auth/react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import {
//   BookOpen,
//   TrendingUp,
//   FileText,
//   Award,
//   Clock,
//   CheckCircle,
//   XCircle,
//   ArrowRight,
//   Activity,
//   DollarSign,
//   Target,
//   PlayCircle,
// } from 'lucide-react';
// import Link from 'next/link';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { useDashboardStats } from '@/hooks/useStats';

// const StatsCardSkeleton = () => (
//   <Card className="hover:shadow-lg transition-shadow border-l-4">
//     <CardHeader className="pb-3">
//       <div className="flex items-center justify-between">
//         <Skeleton width={100} height={16} />
//         <Skeleton circle width={32} height={32} />
//       </div>
//     </CardHeader>
//     <CardContent>
//       <Skeleton width={60} height={36} className="mb-2" />
//       <Skeleton width={120} height={12} />
//     </CardContent>
//   </Card>
// );

// const RecentCourseSkeleton = () => (
//   <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-200">
//     <div className="flex items-start justify-between mb-3">
//       <div className="flex-1">
//         <Skeleton width={200} height={20} className="mb-2" />
//         <Skeleton width={150} height={16} />
//       </div>
//       <Skeleton width={90} height={36} />
//     </div>
//     <div className="space-y-2">
//       <div className="flex items-center justify-between">
//         <Skeleton width={60} height={14} />
//         <Skeleton width={40} height={14} />
//       </div>
//       <Skeleton height={8} />
//     </div>
//   </div>
// );

// const RecentApplicationSkeleton = () => (
//   <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
//     <div className="flex-1 mb-3 md:mb-0">
//       <div className="flex items-center gap-2 mb-2">
//         <Skeleton width={200} height={20} />
//         <Skeleton width={80} height={20} />
//       </div>
//       <div className="flex flex-wrap items-center gap-4">
//         <Skeleton width={100} height={16} />
//         <Skeleton width={100} height={16} />
//       </div>
//     </div>
//     <Skeleton width={120} height={36} />
//   </div>
// );

// const RecentActivitySkeleton = () => (
//   <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//     <Skeleton circle width={40} height={40} />
//     <div className="flex-1">
//       <Skeleton width={120} height={14} className="mb-1" />
//       <Skeleton width={150} height={12} />
//     </div>
//   </div>
// );

// const Dashboard: React.FC = () => {
//   const { data: session } = useSession();
//   const { data: dashboardData, isLoading, isError } = useDashboardStats();

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'approved':
//         return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
//       case 'rejected':
//         return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
//       default:
//         return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
//     }
//   };

//   const getActivityIcon = (type: string) => {
//     switch (type) {
//       case 'course_completed':
//         return {
//           icon: <CheckCircle className="w-5 h-5 text-green-600" />,
//           bgColor: 'bg-green-50',
//           iconBg: 'bg-green-100'
//         };
//       case 'new_enrollment':
//         return {
//           icon: <BookOpen className="w-5 h-5 text-blue-600" />,
//           bgColor: 'bg-blue-50',
//           iconBg: 'bg-blue-100'
//         };
//       case 'application_submitted':
//         return {
//           icon: <FileText className="w-5 h-5 text-purple-600" />,
//           bgColor: 'bg-purple-50',
//           iconBg: 'bg-purple-100'
//         };
//       default:
//         return {
//           icon: <Activity className="w-5 h-5 text-gray-600" />,
//           bgColor: 'bg-gray-50',
//           iconBg: 'bg-gray-100'
//         };
//     }
//   };

//   const stats = dashboardData?.stats;
//   const recentCourses = dashboardData?.recentCourses || [];
//   const recentApplications = dashboardData?.recentApplications || [];
//   const recentActivity = dashboardData?.recentActivity || [];

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto space-y-8">
        
//         {/* Header */}
//         <div className="bg-slate-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div>
//               <h1 className="text-2xl md:text-4xl font-bold mb-2">
//                 Welcome, {session?.user?.fullName || 'Farmer'}! 👋
//               </h1>
//               <p className="text-green-100 text-sm md:text-base">
//                 Welcome back to your agricultural learning dashboard
//               </p>
//             </div>
//             <div className="flex flex-wrap gap-3">
//               <Link href="/dashboard/courses">
//                 <Button className="bg-white text-gray-700 hover:bg-green-50 cursor-pointer">
//                   <BookOpen className="w-4 h-4 mr-2" />
//                   Browse Courses
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//           {isLoading ? (
//             <>
//               <StatsCardSkeleton />
//               <StatsCardSkeleton />
//               <StatsCardSkeleton />
//               <StatsCardSkeleton />
//             </>
//           ) : isError ? (
//             <div className="col-span-full text-center py-8">
//               <p className="text-red-600 font-semibold">Failed to load stats</p>
//             </div>
//           ) : (
//             <>
//               {/* Total Courses */}
//               <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
//                 <CardHeader className="pb-3">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-sm font-medium text-gray-600">
//                       Total Courses
//                     </CardTitle>
//                     <BookOpen className="w-8 h-8 text-blue-500" />
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold text-gray-900">{stats?.totalCourses || 0}</div>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {stats?.inProgressCourses || 0} in progress
//                   </p>
//                 </CardContent>
//               </Card>

//               {/* Completed Courses */}
//               <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
//                 <CardHeader className="pb-3">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-sm font-medium text-gray-600">
//                       Completed
//                     </CardTitle>
//                     <CheckCircle className="w-8 h-8 text-green-500" />
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold text-gray-900">{stats?.completedCourses || 0}</div>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {stats?.totalCourses ? Math.round(((stats?.completedCourses || 0) / stats.totalCourses) * 100) : 0}% completion rate
//                   </p>
//                 </CardContent>
//               </Card>

//               {/* Total Applications */}
//               <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
//                 <CardHeader className="pb-3">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-sm font-medium text-gray-600">
//                       Applications
//                     </CardTitle>
//                     <FileText className="w-8 h-8 text-purple-500" />
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold text-gray-900">{stats?.totalApplications || 0}</div>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {stats?.pendingApplications || 0} pending review
//                   </p>
//                 </CardContent>
//               </Card>

//               {/* Approved Applications */}
//               <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500">
//                 <CardHeader className="pb-3">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-sm font-medium text-gray-600">
//                       Approved
//                     </CardTitle>
//                     <Award className="w-8 h-8 text-yellow-500" />
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold text-gray-900">{stats?.approvedApplications || 0}</div>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {stats?.totalApplications ? Math.round(((stats?.approvedApplications || 0) / stats.totalApplications) * 100) : 0}% success rate
//                   </p>
//                 </CardContent>
//               </Card>
//             </>
//           )}
//         </div>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
//           {/* Recent Courses - Takes 2 columns */}
//           <div className="lg:col-span-2">
//             <Card className="shadow-lg">
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <CardTitle className="text-xl flex items-center gap-2">
//                       <Activity className="w-5 h-5 text-green-600" />
//                       Continue Learning
//                     </CardTitle>
//                     <CardDescription>Your active courses</CardDescription>
//                   </div>
//                   <Link href="/dashboard/my-courses">
//                     <Button variant="ghost" size="sm">
//                       View All
//                       <ArrowRight className="w-4 h-4 ml-2" />
//                     </Button>
//                   </Link>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {isLoading ? (
//                   <>
//                     <RecentCourseSkeleton />
//                     <RecentCourseSkeleton />
//                     <RecentCourseSkeleton />
//                   </>
//                 ) : recentCourses.length === 0 ? (
//                   <div className="text-center py-8 text-gray-500">
//                     <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
//                     <p>No courses in progress</p>
//                     <Link href="/dashboard/courses">
//                       <Button className="mt-4 bg-green-600 hover:bg-green-700">
//                         Browse Courses
//                       </Button>
//                     </Link>
//                   </div>
//                 ) : (
//                   recentCourses.map((course) => (
//                     <div
//                       key={course.id}
//                       className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-all border border-gray-200"
//                     >
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="flex-1">
//                           <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
//                           <div className="flex items-center gap-2 text-sm text-gray-600">
//                             <Badge variant="outline" className="text-xs">
//                               {course.category}
//                             </Badge>
//                             <span className="text-xs">
//                               {course.completedModules}/{course.modules} modules
//                             </span>
//                           </div>
//                         </div>
//                         <Link href={`/dashboard/courses/${course.id}/modules`}>
//                           <Button size="sm" className="bg-green-600 hover:bg-green-700">
//                             <PlayCircle className="w-4 h-4 mr-1" />
//                             Continue
//                           </Button>
//                         </Link>
//                       </div>
//                       <div className="space-y-2">
//                         <div className="flex items-center justify-between text-sm">
//                           <span className="text-gray-600">Progress</span>
//                           <span className="font-semibold text-green-600">{course.progress}%</span>
//                         </div>
//                         <Progress value={course.progress} className="h-2" />
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Quick Actions & Recent Activity */}
//           <div className="space-y-6">
            
//             {/* Quick Actions */}
//             <Card className="shadow-lg">
//               <CardHeader>
//                 <CardTitle className="text-xl flex items-center gap-2">
//                   <Target className="w-5 h-5 text-green-600" />
//                   Quick Actions
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Link href="/dashboard/courses">
//                   <Button variant="outline" className="w-full justify-start hover:bg-green-50">
//                     <BookOpen className="w-4 h-4 mr-2" />
//                     Explore Courses
//                   </Button>
//                 </Link>
//                 <Link href="/dashboard/courses/enrolled">
//                   <Button variant="outline" className="w-full justify-start hover:bg-blue-50">
//                     <Activity className="w-4 h-4 mr-2" />
//                     My Learning
//                   </Button>
//                 </Link>
//                 <Link href="/dashboard/apply">
//                   <Button variant="outline" className="w-full justify-start hover:bg-purple-50">
//                     <FileText className="w-4 h-4 mr-2" />
//                     New Application
//                   </Button>
//                 </Link>
//                 <Link href="/dashboard/allapplications">
//                   <Button variant="outline" className="w-full justify-start hover:bg-yellow-50">
//                     <Award className="w-4 h-4 mr-2" />
//                     My Applications
//                   </Button>
//                 </Link>
//               </CardContent>
//             </Card>

//             <Card className="shadow-lg">
//               <CardHeader>
//                 <CardTitle className="text-xl flex items-center gap-2">
//                   <TrendingUp className="w-5 h-5 text-green-600" />
//                   Recent Activity
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {isLoading ? (
//                   <>
//                     <RecentActivitySkeleton />
//                     <RecentActivitySkeleton />
//                     <RecentActivitySkeleton />
//                   </>
//                 ) : recentActivity.length === 0 ? (
//                   <div className="text-center py-4 text-gray-500 text-sm">
//                     No recent activity
//                   </div>
//                 ) : (
//                   recentActivity.map((activity, index) => {
//                     const { icon, bgColor, iconBg } = getActivityIcon(activity.type);
//                     return (
//                       <div key={index} className={`flex items-center gap-3 p-3 ${bgColor} rounded-lg`}>
//                         <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
//                           {icon}
//                         </div>
//                         <div className="flex-1">
//                           <p className="text-sm font-medium text-gray-900">{activity.title}</p>
//                           <p className="text-xs text-gray-600">{activity.description}</p>
//                         </div>
//                       </div>
//                     );
//                   })
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Recent Applications */}
//         <Card className="shadow-lg">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle className="text-xl flex items-center gap-2">
//                   <FileText className="w-5 h-5 text-green-600" />
//                   Recent Applications
//                 </CardTitle>
//                 <CardDescription>Track your funding requests</CardDescription>
//               </div>
//               <Link href="/dashboard/my-applications">
//                 <Button variant="ghost" size="sm">
//                   View All
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </Button>
//               </Link>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {isLoading ? (
//                 <>
//                   <RecentApplicationSkeleton />
//                   <RecentApplicationSkeleton />
//                   <RecentApplicationSkeleton />
//                 </>
//               ) : recentApplications.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
//                   <p>No applications yet</p>
//                   <Link href="/dashboard/apply">
//                     <Button className="mt-4 bg-green-600 hover:bg-green-700">
//                       Submit Application
//                     </Button>
//                   </Link>
//                 </div>
//               ) : (
//                 recentApplications.map((app) => (
//                   <div
//                     key={app.id}
//                     className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all bg-white"
//                   >
//                     <div className="flex-1 mb-3 md:mb-0">
//                       <div className="flex items-center gap-2 mb-2">
//                         <h4 className="font-semibold text-gray-900">{app.projectTitle}</h4>
//                         {getStatusBadge(app.status)}
//                       </div>
//                       <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
//                         <span className="flex items-center gap-1">
//                           <DollarSign className="w-4 h-4" />
//                           ${app.budgetAmount.toLocaleString()}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <Clock className="w-4 h-4" />
//                           {app.submittedDate}
//                         </span>
//                       </div>
//                     </div>
//                     <Link href={`/dashboard/my-applications`}>
//                       <Button variant="outline" size="sm">
//                         View Details
//                         <ArrowRight className="w-4 h-4 ml-2" />
//                       </Button>
//                     </Link>
//                   </div>
//                 ))
//               )}
//             </div>
//           </CardContent>
//         </Card>

//       </div>
//     </div>
//   );
// };

// export default Dashboard;



'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  TrendingUp,
  FileText,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Activity,
  DollarSign,
  Target,
  PlayCircle,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useDashboardStats } from '@/hooks/useStats';

const StatsCardSkeleton = () => (
  <Card className="hover:shadow-lg transition-shadow border-l-4">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <Skeleton width={100} height={16} />
        <Skeleton circle width={32} height={32} />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton width={60} height={36} className="mb-2" />
      <Skeleton width={120} height={12} />
    </CardContent>
  </Card>
);

const RecentCourseSkeleton = () => (
  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-200">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <Skeleton width={200} height={20} className="mb-2" />
        <Skeleton width={150} height={16} />
      </div>
      <Skeleton width={90} height={36} />
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton width={60} height={14} />
        <Skeleton width={40} height={14} />
      </div>
      <Skeleton height={8} />
    </div>
  </div>
);

const RecentApplicationSkeleton = () => (
  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
    <div className="flex-1 mb-3 md:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton width={200} height={20} />
        <Skeleton width={80} height={20} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Skeleton width={100} height={16} />
        <Skeleton width={100} height={16} />
      </div>
    </div>
    <Skeleton width={120} height={36} />
  </div>
);

const RecentActivitySkeleton = () => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <Skeleton circle width={40} height={40} />
    <div className="flex-1">
      <Skeleton width={120} height={14} className="mb-1" />
      <Skeleton width={150} height={12} />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { data: session } = useSession();
  const { data: dashboardData, isLoading, isError } = useDashboardStats();
  const [isOnline, setIsOnline] = useState(true);

  // Monitor online/offline status
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          bgColor: 'bg-green-50',
          iconBg: 'bg-green-100'
        };
      case 'new_enrollment':
        return {
          icon: <BookOpen className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-50',
          iconBg: 'bg-blue-100'
        };
      case 'application_submitted':
        return {
          icon: <FileText className="w-5 h-5 text-purple-600" />,
          bgColor: 'bg-purple-50',
          iconBg: 'bg-purple-100'
        };
      default:
        return {
          icon: <Activity className="w-5 h-5 text-gray-600" />,
          bgColor: 'bg-gray-50',
          iconBg: 'bg-gray-100'
        };
    }
  };

  const stats = dashboardData?.stats;
  const recentCourses = dashboardData?.recentCourses || [];
  const recentApplications = dashboardData?.recentApplications || [];
  const recentActivity = dashboardData?.recentActivity || [];

  const hasData = stats || recentCourses.length > 0 || recentApplications.length > 0 || recentActivity.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-lg flex items-center gap-3">
            <WifiOff className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">You're currently offline</p>
              <p className="text-sm">
                {hasData
                  ? 'Showing cached dashboard data. Some features may be limited.'
                  : 'No cached data available. Please connect to the internet.'}
              </p>
            </div>
          </div>
        )}

        <div className="bg-slate-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                Welcome, {session?.user?.fullName || 'Farmer'}! 👋

              </h1>
              <p className="text-green-100 text-sm md:text-base">
                Welcome back to your agricultural learning dashboard
                {!isOnline && hasData && ' (viewing cached data)'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/courses">
                <Button 
                  className="bg-white text-gray-700 hover:bg-green-50 cursor-pointer disabled:opacity-50"
                  disabled={!isOnline}
                >
                  {/* {!isOnline && <WifiOff className="w-4 h-4 mr-2" />} */}
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : isError && !hasData ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {!isOnline ? 'No Cached Data Available' : 'Error Loading Dashboard'}
              </h3>
              <p className="text-gray-600">
                {!isOnline 
                  ? 'Please connect to the internet to load your dashboard.' 
                  : 'There was an error loading your dashboard. Please try again later.'}
              </p>
            </div>
          ) : (
            <>
              {/* Total Courses */}
              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Total Courses
                    </CardTitle>
                    <BookOpen className="w-8 h-8 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats?.totalCourses || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.inProgressCourses || 0} in progress
                  </p>
                </CardContent>
              </Card>

              {/* Completed Courses */}
              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Completed
                    </CardTitle>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats?.completedCourses || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.totalCourses ? Math.round(((stats?.completedCourses || 0) / stats.totalCourses) * 100) : 0}% completion rate
                  </p>
                </CardContent>
              </Card>

              {/* Total Applications */}
              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Applications
                    </CardTitle>
                    <FileText className="w-8 h-8 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats?.totalApplications || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.pendingApplications || 0} pending review
                  </p>
                </CardContent>
              </Card>

              {/* Approved Applications */}
              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Approved
                    </CardTitle>
                    <Award className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats?.approvedApplications || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.totalApplications ? Math.round(((stats?.approvedApplications || 0) / stats.totalApplications) * 100) : 0}% success rate
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Courses - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      Continue Learning
                      {!isOnline && recentCourses.length > 0 && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                          <WifiOff className="w-3 h-3 inline mr-1" />
                          Cached
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>Your active courses</CardDescription>
                  </div>
                  <Link href="/dashboard/my-courses">
                    <Button variant="ghost" size="sm" disabled={!isOnline}>
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <RecentCourseSkeleton />
                    <RecentCourseSkeleton />
                    <RecentCourseSkeleton />
                  </>
                ) : recentCourses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>{!isOnline ? 'No cached courses' : 'No courses in progress'}</p>
                    {isOnline && (
                      <Link href="/dashboard/courses">
                        <Button className="mt-4 bg-green-600 hover:bg-green-700">
                          Browse Courses
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  recentCourses.map((course) => (
                    <div
                      key={course.id}
                      className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-all border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Badge variant="outline" className="text-xs">
                              {course.category}
                            </Badge>
                            <span className="text-xs">
                              {course.completedModules}/{course.modules} modules
                            </span>
                          </div>
                        </div>
                        <Link href={`/dashboard/courses/${course.id}/modules`}>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            disabled={!isOnline}
                          >
                            {!isOnline ? (
                              <>
                                <WifiOff className="w-4 h-4 mr-1" />
                                Offline
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-4 h-4 mr-1" />
                                Continue
                              </>
                            )}
                          </Button>
                        </Link>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-green-600">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/courses">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-green-50 disabled:opacity-50 mb-2"
                    disabled={!isOnline}
                  >
                    {/* {!isOnline && <WifiOff className="w-4 h-4 mr-2" />} */}
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore Courses
                  </Button>
                </Link>
                <Link href="/dashboard/courses/enrolled">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-blue-50 disabled:opacity-50 mb-2"
                    disabled={!isOnline}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    My Learning
                  </Button>
                </Link>
                <Link href="/dashboard/apply">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-purple-50 disabled:opacity-50 mb-2"
                    disabled={!isOnline}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    New Application
                  </Button>
                </Link>
                <Link href="/dashboard/allapplications">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-yellow-50 disabled:opacity-50 mb-2"
                    disabled={!isOnline}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    My Applications
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Recent Activity
                  {!isOnline && recentActivity.length > 0 && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                      <WifiOff className="w-3 h-3 inline mr-1" />
                      Cached
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <>
                    <RecentActivitySkeleton />
                    <RecentActivitySkeleton />
                    <RecentActivitySkeleton />
                  </>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    {!isOnline ? 'No cached activity' : 'No recent activity'}
                  </div>
                ) : (
                  recentActivity.map((activity, index) => {
                    const { icon, bgColor, iconBg } = getActivityIcon(activity.type);
                    return (
                      <div key={index} className={`flex items-center gap-3 p-3 ${bgColor} rounded-lg`}>
                        <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-600">{activity.description}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Applications */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Recent Applications
                  {!isOnline && recentApplications.length > 0 && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                      <WifiOff className="w-3 h-3 inline mr-1" />
                      Cached
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Track your funding requests</CardDescription>
              </div>
              <Link href="/dashboard/my-applications">
                <Button variant="ghost" size="sm" disabled={!isOnline}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <RecentApplicationSkeleton />
                  <RecentApplicationSkeleton />
                  <RecentApplicationSkeleton />
                </>
              ) : recentApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>{!isOnline ? 'No cached applications' : 'No applications yet'}</p>
                  {isOnline && (
                    <Link href="/dashboard/apply">
                      <Button className="mt-4 bg-green-600 hover:bg-green-700">
                        Submit Application
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex-1 mb-3 md:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{app.projectTitle}</h4>
                        {getStatusBadge(app.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${app.budgetAmount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {app.submittedDate}
                        </span>
                      </div>
                    </div>
                    <Link href={`/dashboard/my-applications`}>
                      <Button variant="outline" size="sm" disabled={!isOnline}>
                        {!isOnline ? (
                          <>
                            <WifiOff className="w-4 h-4 mr-2" />
                            Offline
                          </>
                        ) : (
                          <>
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;