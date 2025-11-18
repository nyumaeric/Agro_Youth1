// "use client"
// import { TrendingUp, Calendar, ChevronRight, DollarSign, User } from "lucide-react";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import showToast from "@/utils/showToast";
// import { useAllProjects } from "@/hooks/useProducts";

// interface Project {
//   id: string;
//   title: string;
//   goalAmount: number;
//   description: string;
//   startDate: string;
//   endDate: string;
//   isActive: boolean;
//   investor: {
//     id: string;
//     name: string;
//   };
// }

// const ProjectCardSkeleton = () => (
//   <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//     <div className="flex flex-col gap-4">
//       <div className="flex items-start justify-between">
//         <Skeleton width="70%" height={24} />
//         <Skeleton width={80} height={24} />
//       </div>
//       <Skeleton count={2} height={16} />
//       <div className="flex gap-4">
//         <Skeleton width={120} height={16} />
//         <Skeleton width={120} height={16} />
//       </div>
//       <Skeleton width="100%" height={40} />
//     </div>
//   </div>
// );

// const ProjectCard = ({ project }: { project: Project }) => {
//   const [isApplying, setIsApplying] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const { data: session } = useSession();
//   const router = useRouter();

//   const userType = session?.user?.userType;

//   const handleApplyForDonation = async () => {
//     setIsApplying(true);
//     try {
//       if (!session) {
//         showToast("Please log in to apply for donations. Redirecting to login page...", "error");
//         setTimeout(() => {
//           router.push("/login");
//         }, 2000);
//         return;
//       }

//       if (userType === "investor") {
//         showToast("Investors cannot apply for their own projects", "error");
//         return;
//       }

//       // Redirect to application form with project ID
//       router.push(`/dashboard/apply?projectId=${project.id}`);
//     } finally {
//       setIsApplying(false);
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//       minimumFractionDigits: 0,
//     }).format(amount);
//   };

//   return (
//     <div
//       className="bg-white rounded-xl border border-gray-200 hover:border-emerald-300 p-6 shadow-sm hover:shadow-lg transition-all duration-200 group"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className="flex flex-col gap-4">
//         {/* Header */}
//         <div className="flex items-start justify-between gap-4">
//           <div className="flex-1">
//             <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
//               {project.title}
//             </h3>
//           </div>
//           <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
//             <DollarSign className="w-4 h-4 text-emerald-600" />
//             <span className="font-bold text-emerald-700">
//               {formatCurrency(project.goalAmount)}
//             </span>
//           </div>
//         </div>

//         {/* Description */}
//         <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px]">
//           {project.description}
//         </p>

//         {/* Investor Info */}
//         <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
//           <User className="w-4 h-4" />
//           <span className="font-medium">Investor:</span>
//           <span className="text-gray-700">{project.investor.name}</span>
//         </div>

//         {/* Dates */}
//         <div className="flex items-center gap-4 text-xs text-gray-500">
//           <div className="flex items-center gap-1.5">
//             <Calendar className="w-4 h-4" />
//             <span>Start: {formatDate(project.startDate)}</span>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <Calendar className="w-4 h-4" />
//             <span>End: {formatDate(project.endDate)}</span>
//           </div>
//         </div>

//         {/* Apply Button */}
//         <Button
//           onClick={handleApplyForDonation}
//           disabled={isApplying}
//           className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all mt-2"
//         >
//           {isApplying ? (
//             <span className="flex items-center gap-2">
//               <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//               Processing...
//             </span>
//           ) : (
//             <span className="flex items-center gap-2">
//               Apply for Funding
//               <ChevronRight
//                 className={`w-4 h-4 transition-transform ${
//                   isHovered ? "translate-x-1" : ""
//                 }`}
//               />
//             </span>
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default function ProjectsPage() {
//   const { data, isPending, isError, error } = useAllProjects();

//   const projects = Array.isArray(data) ? data : [];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       <div className="max-w-7xl mx-auto py-28 px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h1 className="text-4xl font-bold text-yellow-600 flex items-center gap-3 mb-2">
//                 Investment Projects
//               </h1>
//               <p className="text-gray-600">
//                 Browse available projects and apply for funding opportunities
//               </p>
//             </div>

//             {!isPending && projects.length > 0 && (
//               <div className="bg-white rounded-lg px-6 py-3 shadow-sm border border-gray-200">
//                 <div className="flex items-center gap-3">
//                   <TrendingUp className="w-6 h-6 text-emerald-600" />
//                   <div>
//                     <p className="text-3xl font-bold text-gray-900">
//                       {projects.length}
//                     </p>
//                     <p className="text-xs text-gray-600">Active Projects</p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Content */}
//         {isPending ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {[1, 2, 3, 4, 5, 6].map((i) => (
//               <ProjectCardSkeleton key={i} />
//             ))}
//           </div>
//         ) : isError ? (
//           <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12">
//             <div className="text-center">
//               <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
//                 <TrendingUp className="h-10 w-10 text-red-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 Failed to Load Projects
//               </h3>
//               <p className="text-gray-600">
//                 {error instanceof Error ? error.message : "Please try again later"}
//               </p>
//             </div>
//           </div>
//         ) : projects.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {projects.map((project: Project) => (
//               <ProjectCard key={project.id} project={project} />
//             ))}
//           </div>
//         ) : (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
//             <div className="text-center">
//               <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
//                 <TrendingUp className="h-10 w-10 text-gray-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 No Projects Available
//               </h3>
//               <p className="text-gray-600">
//                 Check back later for new investment opportunities.
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client"
import { TrendingUp, Calendar, ChevronRight, DollarSign, User, Sparkles, Clock, Target } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import showToast from "@/utils/showToast";
import { useAllProjects } from "@/hooks/useProducts";

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

const ProjectCardSkeleton = () => (
  <Card className="overflow-hidden border-0 shadow-lg">
    <div className="relative h-32 bg-gradient-to-br from-emerald-50 to-yellow-50">
      <Skeleton height="100%" />
    </div>
    <CardContent className="p-6 space-y-4">
      <Skeleton width="80%" height={24} />
      <Skeleton count={2} height={16} />
      <div className="flex gap-2">
        <Skeleton width={100} height={24} />
        <Skeleton width={100} height={24} />
      </div>
      <Skeleton width="100%" height={40} />
    </CardContent>
  </Card>
);

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const userType = session?.user?.userType;

  const handleApplyForDonation = async () => {
    setIsApplying(true);
    try {
      if (!session) {
        showToast("Please log in to apply for donations. Redirecting to login page...", "error");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      if (userType === "investor") {
        showToast("Investors cannot apply for their own projects", "error");
        return;
      }

      router.push(`/apply?projectId=${project.id}`);
    } finally {
      setIsApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysRemaining = () => {
    const end = new Date(project.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysRemaining = getDaysRemaining();

  // Gradient backgrounds for variety
  const gradients = [
    "from-emerald-500 to-teal-600",
    "from-yellow-500 to-orange-600",
    "from-emerald-600 to-yellow-500",
    "from-teal-500 to-emerald-600",
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <Card
      className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Section with Gradient */}
      <div className={`relative h-32 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <Badge className="bg-white/90 text-emerald-700 hover:bg-white border-0 font-semibold">
              <Sparkles className="w-3 h-3 mr-1" />
              Active
            </Badge>
            {daysRemaining > 0 && (
              <Badge variant="secondary" className="bg-white/90 text-gray-700 border-0 font-semibold">
                <Clock className="w-3 h-3 mr-1" />
                {daysRemaining}d left
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/95 px-4 py-2 rounded-full shadow-lg">
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-gray-900 text-lg">
                {formatCurrency(project.goalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-6 space-y-4">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 min-h-[56px] group-hover:text-emerald-600 transition-colors">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 min-h-[63px] leading-relaxed">
          {project.description}
        </p>

        {/* Investor Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium">Investor</p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {project.investor.name}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg">
            <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-emerald-600 font-medium">Start</p>
              <p className="text-xs font-semibold text-gray-900 truncate">
                {formatDate(project.startDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-yellow-50 rounded-lg">
            <Calendar className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-yellow-600 font-medium">End</p>
              <p className="text-xs font-semibold text-gray-900 truncate">
                {formatDate(project.endDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <Button
          onClick={handleApplyForDonation}
          disabled={isApplying}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-xl transition-all duration-300 h-11 font-semibold"
        >
          {isApplying ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Apply for Funding
              <ChevronRight
                className={`w-5 h-5 transition-transform duration-300 ${
                  isHovered ? "translate-x-1" : ""
                }`}
              />
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function ProjectsPage() {
  const { data, isPending, isError, error } = useAllProjects();
  const projects = Array.isArray(data) ? data : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-yellow-50/30">
      <div className="max-w-7xl mx-auto py-28 px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full mb-4 font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              Discover Opportunities
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Investment Projects
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse available projects and apply for funding opportunities to grow your agricultural ventures
            </p>
          </div>

          {/* Stats Card */}
          {!isPending && projects.length > 0 && (
            <div className="flex justify-center">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {projects.length}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">Active Projects</p>
                      </div>
                    </div>
                    <div className="h-12 w-px bg-gray-200"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            notation: "compact",
                            maximumFractionDigits: 1,
                          }).format(
                            projects.reduce((sum, p) => sum + p.goalAmount, 0)
                          )}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">Total Funding</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Content */}
        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-16">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Failed to Load Projects
                </h3>
                <p className="text-gray-600 mb-6">
                  {error instanceof Error ? error.message : "Please try again later"}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project: Project, index: number) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-16">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Projects Available
                </h3>
                <p className="text-gray-600 mb-6">
                  Check back later for new investment opportunities.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-2"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

