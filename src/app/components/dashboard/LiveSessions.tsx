// "use client";
// import { useSession } from "next-auth/react";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import { Calendar, Clock, Video, User, Users, MapPin } from "lucide-react";
// import { useAllLiveSessions, useAllLiveSessionsByUser } from "@/hooks/liveSessions.ts/useGetLiveSessions";
// import CreateSessionDialog from "./CreateLiveSessions";
// import { useGetMostPopularPosts } from "@/hooks/posts/useGetAllPosts";

// interface LiveSession {
//   id: string;
//   hostId: string;
//   title: string;
//   description: string;
//   scheduledAt: string;
//   durationMinutes: number;
//   meetingLink: string;
//   isActive: boolean;
//   createdAt?: string;
// }

// const TimelineSession = ({ session, isOwned = false, isNearest = false }: { session: LiveSession; isOwned?: boolean; isNearest?: boolean }) => {
//   const scheduledDate = new Date(session.scheduledAt);

//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString("en-US", {
//       weekday: "long",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   return (
//     <div className="relative flex gap-6 pb-8">
//       <div className="relative flex flex-col items-center">
//         <div className={`w-7 h-7 rounded-full z-10 ${isNearest ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-bounce' : 'bg-slate-400'}`} />
//         <div className="w-0.5 h-full bg-gradient-to-b from-slate-300 to-transparent absolute top-4" />
//       </div>

//       <div className="flex-1 -mt-1">
//         <div className={`rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border overflow-hidden ${
//           isNearest 
//             ? 'bg-emerald-50 border-emerald-200 animate-pulse' 
//             : 'bg-white border-gray-200'
//         }`}>
//           <div className="p-5">
//             <div className="flex items-start justify-between mb-3">
//               <div className="flex-1">
//                 <div className="flex items-center gap-2 mb-1 flex-wrap">
//                   <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
//                   {isOwned && (
//                     <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
//                       Your Session
//                     </span>
//                   )}
//                   {isNearest && (
//                     <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
//                       Next Session
//                     </span>
//                   )}
//                   <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded">
//                     Upcoming
//                   </span>
//                 </div>
//                 <p className="text-gray-600 text-sm line-clamp-2">{session.description}</p>
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-4 mb-4 text-sm">
//               <div className="flex items-center gap-2 text-gray-700">
//                 <Calendar className="w-4 h-4 text-emerald-600" />
//                 <span className="font-medium">{formatDate(scheduledDate)}</span>
//               </div>
//               <div className="flex items-center gap-2 text-gray-700">
//                 <Clock className="w-4 h-4 text-gray-400" />
//                 <span>{formatTime(scheduledDate)} • {session.durationMinutes} min</span>
//               </div>
//             </div>

//             <a
//               href={session.meetingLink}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-slate-600 hover:bg-slate-700 text-white transition-colors"
//             >
//               <Video className="w-4 h-4" />
//               Join Meeting
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const TimelineSkeleton = () => (
//   <div className="relative flex gap-6 pb-8">
//     <div className="relative flex flex-col items-center">
//       <Skeleton circle width={16} height={16} />
//       <div className="w-0.5 h-full bg-gray-200 absolute top-4" />
//     </div>
//     <div className="flex-1 -mt-1">
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
//         <Skeleton width="60%" height={24} className="mb-2" />
//         <Skeleton count={2} height={14} className="mb-4" />
//         <Skeleton width="50%" height={18} className="mb-2" />
//         <Skeleton width="45%" height={18} className="mb-4" />
//         <Skeleton width={120} height={36} />
//       </div>
//     </div>
//   </div>
// );

// export default function LiveSessions() {
//   const { data: allSessionsData, isPending: isAllPending } = useAllLiveSessions();
//   const { data: userSessionsData, isPending: isUserPending } = useAllLiveSessionsByUser();
//   const { popularPosts, isPending: isPopularPostsPending } = useGetMostPopularPosts(); // Add this hook
//   const { data: session } = useSession();
//   const userType = session?.user?.userType;
//   const role = session?.user.role;
//   let isAuthorized;
//   if(userType == "investor" || role == "Admin"){
//     isAuthorized = true;
//   }

//   const allSessions = Array.isArray(allSessionsData) 
//     ? allSessionsData 
//     : Array.isArray(allSessionsData?.data) 
//     ? allSessionsData.data 
//     : [];

//   const userSessions = Array.isArray(userSessionsData) 
//     ? userSessionsData 
//     : Array.isArray(userSessionsData?.data) 
//     ? userSessionsData.data 
//     : [];

//   const isInvestor = userType === "investor";

//   const now = new Date();
//   const upcomingSessions = allSessions
//     .filter((session: LiveSession) => new Date(session.scheduledAt) > now)
//     .sort((a: LiveSession, b: LiveSession) => 
//       new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
//     );

//   const upcomingUserSessions = userSessions
//     .filter((session: LiveSession) => new Date(session.scheduledAt) > now)
//     .sort((a: LiveSession, b: LiveSession) => 
//       new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
//     );

//   const nearestSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

//   return (
//     <div className="space-y-6 max-w-4xl pt-10 pl-8">
//         <div className="flex justify-between">
//             <div>
//             <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//             <MapPin className="w-7 h-7 text-emerald-600" />
//             Upcoming Sessions Timeline
//             </h1>
//             <p className="text-sm text-gray-600 mt-1">
//             {isInvestor
//                 ? "Your upcoming sessions and other opportunities"
//                 : "Join upcoming live sessions and connect with investors"}
//             </p>
//             </div>
//             {isAuthorized && (
//                 <CreateSessionDialog popularPosts={popularPosts} isLoadingPosts={isPopularPostsPending} />
//             )}

//         </div>


//       {(isAllPending || (isInvestor && isUserPending)) ? (
//         <div className="space-y-6">
//           {isInvestor && (
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <User className="w-5 h-5 text-gray-700" />
//                 Your Sessions
//               </h2>
//               <div className="relative">
//                 {[1, 2, 3].map((i) => (
//                   <TimelineSkeleton key={i} />
//                 ))}
//               </div>
//             </div>
//           )}
//           <div>
//             <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//               <Users className="w-5 h-5 text-gray-700" />
//               {isInvestor ? "All Sessions" : "Available Sessions"}
//             </h2>
//             <div className="relative">
//               {[1, 2, 3].map((i) => (
//                 <TimelineSkeleton key={i} />
//               ))}
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {isInvestor && upcomingUserSessions.length > 0 && (
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <User className="w-5 h-5 text-gray-700" />
//                 Your Sessions
//                 <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
//                   {upcomingUserSessions.length}
//                 </span>
//               </h2>
//               <div className="relative">
//                 {upcomingUserSessions.map((sess: LiveSession) => (
//                   <TimelineSession 
//                     key={sess.id} 
//                     session={sess} 
//                     isOwned={true}
//                     isNearest={nearestSession?.id === sess.id}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}

//           <div>
//             <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//               <Users className="w-5 h-5 text-gray-700" />
//               {isInvestor ? "All Sessions" : "Available Sessions"}
//               {upcomingSessions.length > 0 && (
//                 <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
//                   {upcomingSessions.length}
//                 </span>
//               )}
//             </h2>
//             {upcomingSessions.length > 0 ? (
//               <div className="relative">
//                 {upcomingSessions.map((sess: LiveSession) => (
//                   <TimelineSession 
//                     key={sess.id} 
//                     session={sess}
//                     isNearest={nearestSession?.id === sess.id}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
//                 <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
//                   <Calendar className="w-8 h-8 text-gray-400" />
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900 mb-1">No Upcoming Sessions</h3>
//                 <p className="text-sm text-gray-600">
//                   {isInvestor
//                     ? "There are no upcoming sessions scheduled at the moment."
//                     : "Check back later for upcoming live sessions."}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Calendar, Clock, Video, User, Users, MapPin, ExternalLink, WifiOff } from "lucide-react";
import { useAllLiveSessions, useAllLiveSessionsByUser } from "@/hooks/liveSessions.ts/useGetLiveSessions";
import CreateSessionDialog from "./CreateLiveSessions";
import { useGetMostPopularPosts } from "@/hooks/posts/useGetAllPosts";
import JitsiMeetingModal from "./JitsiMeetingModal";

interface LiveSession {
  id: string;
  hostId: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string;
  isActive: boolean;
  createdAt?: string;
}

const TimelineSession = ({ 
  session, 
  isOwned = false, 
  isNearest = false,
  onJoinMeeting,
  isOnline
}: { 
  session: LiveSession; 
  isOwned?: boolean; 
  isNearest?: boolean;
  onJoinMeeting: (session: LiveSession) => void;
  isOnline: boolean;
}) => {
  const scheduledDate = new Date(session.scheduledAt);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleJoinClick = () => {
    if (!isOnline) {
      alert('You need to be online to join live sessions');
      return;
    }
    onJoinMeeting(session);
  };

  return (
    <div className="relative flex gap-6 pb-8">
      <div className="relative flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full z-10 ${isNearest ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-bounce' : 'bg-slate-400'}`} />
        <div className="w-0.5 h-full bg-gradient-to-b from-slate-300 to-transparent absolute top-4" />
      </div>

      <div className="flex-1 -mt-1">
        <div className={`rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border overflow-hidden ${
          isNearest 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                  {isOwned && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                      Your Session
                    </span>
                  )}
                  {isNearest && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                      Next Session
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded">
                    Upcoming
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{session.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{formatDate(scheduledDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{formatTime(scheduledDate)} • {session.durationMinutes} min</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleJoinClick}
                disabled={!isOnline}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isOnline ? (
                  <>
                    <WifiOff className="w-4 h-4" />
                    Join with Jitsi
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    Join with Jitsi
                  </>
                )}
              </button>
              {session.meetingLink && (
                <a
                  href={isOnline ? session.meetingLink : '#'}
                  target={isOnline ? "_blank" : undefined}
                  rel={isOnline ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (!isOnline) {
                      e.preventDefault();
                      alert('You need to be online to access external links');
                    }
                  }}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors ${
                    !isOnline ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {!isOnline ? (
                    <>
                      <WifiOff className="w-4 h-4" />
                      External Link
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      External Link
                    </>
                  )}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineSkeleton = () => (
  <div className="relative flex gap-6 pb-8">
    <div className="relative flex flex-col items-center">
      <Skeleton circle width={28} height={28} />
      <div className="w-0.5 h-full bg-gray-200 absolute top-4" />
    </div>
    <div className="flex-1 -mt-1">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <Skeleton width="60%" height={24} className="mb-2" />
        <Skeleton count={2} height={14} className="mb-4" />
        <Skeleton width="50%" height={18} className="mb-2" />
        <Skeleton width="45%" height={18} className="mb-4" />
        <Skeleton width={120} height={36} />
      </div>
    </div>
  </div>
);

export default function LiveSessions() {
  const { data: allSessionsData, isPending: isAllPending, isError: isAllError } = useAllLiveSessions();
  const { data: userSessionsData, isPending: isUserPending, isError: isUserError } = useAllLiveSessionsByUser();
  const { popularPosts, isPending: isPopularPostsPending } = useGetMostPopularPosts();
  const { data: session } = useSession();
  const [activeMeeting, setActiveMeeting] = useState<LiveSession | null>(null);
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

  const userType = session?.user?.userType;
  const role = session?.user.role;
  const isAuthorized = userType === "investor" || role === "Admin";

  const allSessions = Array.isArray(allSessionsData) 
    ? allSessionsData 
    : Array.isArray(allSessionsData?.data) 
    ? allSessionsData.data 
    : [];

  const userSessions = Array.isArray(userSessionsData) 
    ? userSessionsData 
    : Array.isArray(userSessionsData?.data) 
    ? userSessionsData.data 
    : [];

  const isInvestor = userType === "investor";

  const now = new Date();
  const upcomingSessions = allSessions
    .filter((session: LiveSession) => new Date(session.scheduledAt) > now)
    .sort((a: LiveSession, b: LiveSession) => 
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

  const upcomingUserSessions = userSessions
    .filter((session: LiveSession) => new Date(session.scheduledAt) > now)
    .sort((a: LiveSession, b: LiveSession) => 
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

  const nearestSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  const handleJoinMeeting = (session: LiveSession) => {
    setActiveMeeting(session);
  };

  return (
    <>
      <div className="space-y-6 max-w-4xl pt-10 pl-8">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-lg flex items-center gap-3">
            <WifiOff className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">You're currently offline</p>
              <p className="text-sm">
                {(upcomingSessions.length > 0 || upcomingUserSessions.length > 0)
                  ? 'Showing cached sessions. You cannot join meetings or create sessions while offline.'
                  : 'No cached sessions available. Please connect to the internet.'}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-7 h-7 text-emerald-600" />
              Upcoming Sessions Timeline
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isInvestor
                ? "Your upcoming sessions and other opportunities"
                : "Join upcoming live sessions and connect with investors"}
              {!isOnline && (upcomingSessions.length > 0 || upcomingUserSessions.length > 0) && ' (from cache)'}
            </p>
          </div>
          {isAuthorized && (
            <CreateSessionDialog 
              popularPosts={popularPosts} 
              isLoadingPosts={isPopularPostsPending}
              // disabled={!isOnline}
            />
          )}
        </div>

        {(isAllPending || (isInvestor && isUserPending)) ? (
          <div className="space-y-6">
            {isInvestor && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-700" />
                  Your Sessions
                </h2>
                <div className="relative">
                  {[1, 2, 3].map((i) => (
                    <TimelineSkeleton key={i} />
                  ))}
                </div>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-700" />
                {isInvestor ? "All Sessions" : "Available Sessions"}
              </h2>
              <div className="relative">
                {[1, 2, 3].map((i) => (
                  <TimelineSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        ) : (isAllError && upcomingSessions.length === 0) || (isInvestor && isUserError && upcomingUserSessions.length === 0) ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {!isOnline ? 'No Cached Sessions Available' : 'Error Loading Sessions'}
            </h3>
            <p className="text-gray-600">
              {!isOnline 
                ? 'Please connect to the internet to load live sessions.' 
                : 'There was an error loading live sessions. Please try again later.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {isInvestor && upcomingUserSessions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-700" />
                  Your Sessions
                  <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                    {upcomingUserSessions.length}
                  </span>
                  {!isOnline && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded flex items-center gap-1">
                      <WifiOff className="w-3 h-3" />
                      Cached
                    </span>
                  )}
                </h2>
                <div className="relative">
                  {upcomingUserSessions.map((sess: LiveSession) => (
                    <TimelineSession 
                      key={sess.id} 
                      session={sess} 
                      isOwned={true}
                      isNearest={nearestSession?.id === sess.id}
                      onJoinMeeting={handleJoinMeeting}
                      isOnline={isOnline}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-700" />
                {isInvestor ? "All Sessions" : "Available Sessions"}
                {upcomingSessions.length > 0 && (
                  <>
                    <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {upcomingSessions.length}
                    </span>
                    {!isOnline && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded flex items-center gap-1">
                        <WifiOff className="w-3 h-3" />
                        Cached
                      </span>
                    )}
                  </>
                )}
              </h2>
              {upcomingSessions.length > 0 ? (
                <div className="relative">
                  {upcomingSessions.map((sess: LiveSession) => (
                    <TimelineSession 
                      key={sess.id} 
                      session={sess}
                      isNearest={nearestSession?.id === sess.id}
                      onJoinMeeting={handleJoinMeeting}
                      isOnline={isOnline}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Upcoming Sessions</h3>
                  <p className="text-sm text-gray-600">
                    {!isOnline 
                      ? 'No cached sessions. Connect to the internet to load sessions.'
                      : isInvestor
                      ? "There are no upcoming sessions scheduled at the moment."
                      : "Check back later for upcoming live sessions."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Jitsi Meeting Modal */}
      {activeMeeting && isOnline && (
        <JitsiMeetingModal
          session={activeMeeting}
          onClose={() => setActiveMeeting(null)}
        />
      )}
    </>
  );
}