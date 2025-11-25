// import { NextRequest } from "next/server";
// import db from "@/server/db";
// import {
//   course,
//   enrollments,
//   courseProgress,
//   donationApplications,
//   certificates,
// } from "@/server/db/schema";
// import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
// import { sendResponse } from "@/utils/response";
// import { eq, and, count, sql } from "drizzle-orm";

// export const GET = async (req: NextRequest) => {
//   try {
//     const userId = await getUserIdFromSession();

//     if (!userId) {
//       return sendResponse(401, null, "Unauthorized");
//     }

//     const [enrolledCoursesCount] = await db
//       .select({ count: count() })
//       .from(enrollments)
//       .where(eq(enrollments.userId, userId));

//     const [completedCoursesCount] = await db
//       .select({ count: count() })
//       .from(courseProgress)
//       .where(
//         and(
//           eq(courseProgress.userId, userId),
//           eq(courseProgress.isCompleted, true)
//         )
//       );

//     const [inProgressCoursesCount] = await db
//       .select({ count: count() })
//       .from(courseProgress)
//       .where(
//         and(
//           eq(courseProgress.userId, userId),
//           eq(courseProgress.isCompleted, false)
//         )
//       );

//     const [totalApplicationsCount] = await db
//       .select({ count: count() })
//       .from(donationApplications)
//       .where(eq(donationApplications.userId, userId));

//     const [pendingApplicationsCount] = await db
//       .select({ count: count() })
//       .from(donationApplications)
//       .where(
//         and(
//           eq(donationApplications.userId, userId),
//           eq(donationApplications.status, "pending")
//         )
//       );

//     const [approvedApplicationsCount] = await db
//       .select({ count: count() })
//       .from(donationApplications)
//       .where(
//         and(
//           eq(donationApplications.userId, userId),
//           eq(donationApplications.status, "approved")
//         )
//       );

//     const [rejectedApplicationsCount] = await db
//       .select({ count: count() })
//       .from(donationApplications)
//       .where(
//         and(
//           eq(donationApplications.userId, userId),
//           eq(donationApplications.status, "rejected")
//         )
//       );

//     const recentCourses = await db
//       .select({
//         id: course.id,
//         title: course.title,
//         category: course.category,
//         progress: courseProgress.progressPercentage,
//         completedModules: courseProgress.completedModules,
//         totalModules: courseProgress.totalModules,
//       })
//       .from(courseProgress)
//       .leftJoin(course, eq(course.id, courseProgress.courseId))
//       .where(
//         and(
//           eq(courseProgress.userId, userId),
//           eq(courseProgress.isCompleted, false)
//         )
//       )
//       .orderBy(sql`${courseProgress.updatedAt} DESC`)
//       .limit(3);

//     const recentApplications = await db
//       .select({
//         id: donationApplications.id,
//         projectTitle: donationApplications.projectTitle,
//         status: donationApplications.status,
//         budgetAmount: donationApplications.budgetAmount,
//         createdAt: donationApplications.createdAt,
//       })
//       .from(donationApplications)
//       .where(eq(donationApplications.userId, userId))
//       .orderBy(sql`${donationApplications.createdAt} DESC`)
//       .limit(3);

//     const formattedApplications = recentApplications.map((app) => {
//       const createdAt = new Date(app.createdAt);
//       const now = new Date();
//       const diffTime = Math.abs(now.getTime() - createdAt.getTime());
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//       let submittedDate = "";
//       if (diffDays === 0) {
//         submittedDate = "Today";
//       } else if (diffDays === 1) {
//         submittedDate = "1 day ago";
//       } else if (diffDays < 7) {
//         submittedDate = `${diffDays} days ago`;
//       } else if (diffDays < 14) {
//         submittedDate = "1 week ago";
//       } else if (diffDays < 30) {
//         submittedDate = `${Math.floor(diffDays / 7)} weeks ago`;
//       } else {
//         submittedDate = `${Math.floor(diffDays / 30)} months ago`;
//       }

//       return {
//         id: app.id,
//         projectTitle: app.projectTitle,
//         status: app.status,
//         budgetAmount: app.budgetAmount,
//         submittedDate,
//       };
//     });

//     const recentActivity = [];

//     const [lastCompletedCourse] = await db
//       .select({
//         title: course.title,
//         completedAt: courseProgress.completedAt,
//       })
//       .from(courseProgress)
//       .leftJoin(course, eq(course.id, courseProgress.courseId))
//       .where(
//         and(
//           eq(courseProgress.userId, userId),
//           eq(courseProgress.isCompleted, true)
//         )
//       )
//       .orderBy(sql`${courseProgress.completedAt} DESC`)
//       .limit(1);

//     if (lastCompletedCourse?.title) {
//       recentActivity.push({
//         type: "course_completed",
//         title: "Course Completed",
//         description: lastCompletedCourse.title,
//       });
//     }

//     const [lastEnrollment] = await db
//       .select({
//         title: course.title,
//         enrolledAt: enrollments.enrolledAt,
//       })
//       .from(enrollments)
//       .leftJoin(course, eq(course.id, enrollments.courseId))
//       .where(eq(enrollments.userId, userId))
//       .orderBy(sql`${enrollments.enrolledAt} DESC`)
//       .limit(1);

//     if (lastEnrollment?.title) {
//       recentActivity.push({
//         type: "new_enrollment",
//         title: "New Enrollment",
//         description: lastEnrollment.title,
//       });
//     }

//     const [lastApplication] = await db
//       .select({
//         projectTitle: donationApplications.projectTitle,
//         createdAt: donationApplications.createdAt,
//       })
//       .from(donationApplications)
//       .where(eq(donationApplications.userId, userId))
//       .orderBy(sql`${donationApplications.createdAt} DESC`)
//       .limit(1);

//     if (lastApplication?.projectTitle) {
//       recentActivity.push({
//         type: "application_submitted",
//         title: "Application Submitted",
//         description: lastApplication.projectTitle,
//       });
//     }

//     const stats = {
//       totalCourses: enrolledCoursesCount.count || 0,
//       completedCourses: completedCoursesCount.count || 0,
//       inProgressCourses: inProgressCoursesCount.count || 0,
//       totalApplications: totalApplicationsCount.count || 0,
//       pendingApplications: pendingApplicationsCount.count || 0,
//       approvedApplications: approvedApplicationsCount.count || 0,
//       rejectedApplications: rejectedApplicationsCount.count || 0,
//     };

//     return sendResponse(
//       200,
//       {
//         stats,
//         recentCourses: recentCourses.map((course) => ({
//           id: course.id,
//           title: course.title,
//           category: course.category,
//           progress: course.progress || 0,
//           completedModules: course.completedModules || 0,
//           totalModules: course.totalModules || 0,
//           modules: course.totalModules || 0,
//         })),
//         recentApplications: formattedApplications,
//         recentActivity: recentActivity.slice(0, 3),
//       },
//       "Dashboard stats retrieved successfully"
//     );
//   } catch (error) {
//     console.error("Error fetching dashboard stats:", error);
//     const errorMessage =
//       error instanceof Error ? error.message : "An error occurred";
//     return sendResponse(500, null, errorMessage);
//   }
// };

import { NextRequest } from "next/server";
import db from "@/server/db";
import {
  course,
  enrollments,
  courseProgress,
  donationApplications,
  certificates,
  users,
  liveSessions,
  Post,
  roles,
} from "@/server/db/schema";
import { getUserIdFromSession, checkIfUserIsAdmin, getUserTypeFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq, and, count, sql, desc, or } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  try {
    const userId = await getUserIdFromSession();
    const userType = await getUserTypeFromSession();
    const isAdmin = await checkIfUserIsAdmin();

    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    // ADMIN DASHBOARD
    if (isAdmin) {
      // Get total counts for admin
      const [totalUsersCount] = await db
        .select({ count: count() })
        .from(users);

      const [totalCoursesCount] = await db
        .select({ count: count() })
        .from(course);

      const [totalLiveSessionsCount] = await db
        .select({ count: count() })
        .from(liveSessions);

      const [totalApplicationsCount] = await db
        .select({ count: count() })
        .from(donationApplications);

      const [pendingApplicationsCount] = await db
        .select({ count: count() })
        .from(donationApplications)
        .where(eq(donationApplications.status, "pending"));

      // Courses created by admin
      const [adminCoursesCount] = await db
        .select({ count: count() })
        .from(course)
        .where(eq(course.createdId, userId));

      // Live sessions created by admin
      const [adminLiveSessionsCount] = await db
        .select({ count: count() })
        .from(liveSessions)
        .where(eq(liveSessions.hostId, userId));

      // Recent activities for admin
      const recentCourses = await db
        .select({
          id: course.id,
          title: course.title,
          category: course.category,
          createdAt: course.createdAt,
        })
        .from(course)
        .where(eq(course.createdId, userId))
        .orderBy(desc(course.createdAt))
        .limit(5);

      const recentLiveSessions = await db
        .select({
          id: liveSessions.id,
          title: liveSessions.title,
          scheduledAt: liveSessions.scheduledAt,
          isActive: liveSessions.isActive,
        })
        .from(liveSessions)
        .where(eq(liveSessions.hostId, userId))
        .orderBy(desc(liveSessions.createdAt))
        .limit(5);

      const recentActivity = [];

      // Last course created
      if (recentCourses.length > 0) {
        recentActivity.push({
          type: "course_created",
          title: "Course Created",
          description: recentCourses[0].title,
        });
      }

      // Last live session created
      if (recentLiveSessions.length > 0) {
        recentActivity.push({
          type: "live_session_created",
          title: "Live Session Created",
          description: recentLiveSessions[0].title,
        });
      }

      // Recent pending applications
      const [lastPendingApplication] = await db
        .select({
          projectTitle: donationApplications.projectTitle,
          createdAt: donationApplications.createdAt,
        })
        .from(donationApplications)
        .where(eq(donationApplications.status, "pending"))
        .orderBy(desc(donationApplications.createdAt))
        .limit(1);

      if (lastPendingApplication) {
        recentActivity.push({
          type: "application_pending",
          title: "New Application Pending",
          description: lastPendingApplication.projectTitle,
        });
      }

      const stats = {
        totalUsers: totalUsersCount.count || 0,
        totalCourses: totalCoursesCount.count || 0,
        coursesCreated: adminCoursesCount.count || 0,
        totalLiveSessions: totalLiveSessionsCount.count || 0,
        liveSessionsCreated: adminLiveSessionsCount.count || 0,
        totalApplications: totalApplicationsCount.count || 0,
        pendingApplications: pendingApplicationsCount.count || 0,
      };

      return sendResponse(
        200,
        {
          stats,
          recentCourses: recentCourses.map((c) => ({
            id: c.id,
            title: c.title,
            category: c.category,
          })),
          recentLiveSessions: recentLiveSessions.map((session) => ({
            id: session.id,
            title: session.title,
            scheduledAt: session.scheduledAt,
            isActive: session.isActive,
          })),
          recentActivity: recentActivity.slice(0, 5),
          userRole: "admin",
        },
        "Admin dashboard stats retrieved successfully"
      );
    }

    // INVESTOR DASHBOARD
    if (userType === "investor") {
      // Applications received by investor
      const [receivedApplicationsCount] = await db
        .select({ count: count() })
        .from(donationApplications);

      const [pendingReceivedCount] = await db
        .select({ count: count() })
        .from(donationApplications)
        .where(eq(donationApplications.status, "pending"));

      const [approvedReceivedCount] = await db
        .select({ count: count() })
        .from(donationApplications)
        .where(eq(donationApplications.status, "approved"));

      const [rejectedReceivedCount] = await db
        .select({ count: count() })
        .from(donationApplications)
        .where(eq(donationApplications.status, "rejected"));

      // Enrolled courses
      const [enrolledCoursesCount] = await db
        .select({ count: count() })
        .from(enrollments)
        .where(eq(enrollments.userId, userId));

      const [completedCoursesCount] = await db
        .select({ count: count() })
        .from(courseProgress)
        .where(
          and(
            eq(courseProgress.userId, userId),
            eq(courseProgress.isCompleted, true)
          )
        );

      const [inProgressCoursesCount] = await db
        .select({ count: count() })
        .from(courseProgress)
        .where(
          and(
            eq(courseProgress.userId, userId),
            eq(courseProgress.isCompleted, false)
          )
        );

      // Recent courses
      const recentCourses = await db
        .select({
          id: course.id,
          title: course.title,
          category: course.category,
          progress: courseProgress.progressPercentage,
          completedModules: courseProgress.completedModules,
          totalModules: courseProgress.totalModules,
        })
        .from(courseProgress)
        .leftJoin(course, eq(course.id, courseProgress.courseId))
        .where(
          and(
            eq(courseProgress.userId, userId),
            eq(courseProgress.isCompleted, false)
          )
        )
        .orderBy(desc(courseProgress.updatedAt))
        .limit(3);

      // Recent received applications
      const receivedApplications = await db
        .select({
          id: donationApplications.id,
          projectTitle: donationApplications.projectTitle,
          status: donationApplications.status,
          budgetAmount: donationApplications.budgetAmount,
          createdAt: donationApplications.createdAt,
          applicantId: donationApplications.userId,
        })
        .from(donationApplications)
        .orderBy(desc(donationApplications.createdAt))
        .limit(3);

      const formattedReceivedApplications = receivedApplications.map((app) => {
        const createdAt = new Date(app.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let submittedDate = "";
        if (diffDays === 0) submittedDate = "Today";
        else if (diffDays === 1) submittedDate = "1 day ago";
        else if (diffDays < 7) submittedDate = `${diffDays} days ago`;
        else if (diffDays < 14) submittedDate = "1 week ago";
        else if (diffDays < 30) submittedDate = `${Math.floor(diffDays / 7)} weeks ago`;
        else submittedDate = `${Math.floor(diffDays / 30)} months ago`;

        return {
          id: app.id,
          projectTitle: app.projectTitle,
          status: app.status,
          budgetAmount: app.budgetAmount,
          submittedDate,
        };
      });

      // Recent activity for investor
      const recentActivity = [];

      const [lastCompletedCourse] = await db
        .select({
          title: course.title,
          completedAt: courseProgress.completedAt,
        })
        .from(courseProgress)
        .leftJoin(course, eq(course.id, courseProgress.courseId))
        .where(
          and(
            eq(courseProgress.userId, userId),
            eq(courseProgress.isCompleted, true)
          )
        )
        .orderBy(desc(courseProgress.completedAt))
        .limit(1);

      if (lastCompletedCourse?.title) {
        recentActivity.push({
          type: "course_completed",
          title: "Course Completed",
          description: lastCompletedCourse.title,
        });
      }

      const [lastReceivedApp] = await db
        .select({
          projectTitle: donationApplications.projectTitle,
          createdAt: donationApplications.createdAt,
        })
        .from(donationApplications)
        .orderBy(desc(donationApplications.createdAt))
        .limit(1);

      if (lastReceivedApp) {
        recentActivity.push({
          type: "application_received",
          title: "New Application Received",
          description: lastReceivedApp.projectTitle,
        });
      }

      const stats = {
        totalCourses: enrolledCoursesCount.count || 0,
        completedCourses: completedCoursesCount.count || 0,
        inProgressCourses: inProgressCoursesCount.count || 0,
        receivedApplications: receivedApplicationsCount.count || 0,
        pendingReceived: pendingReceivedCount.count || 0,
        approvedReceived: approvedReceivedCount.count || 0,
        rejectedReceived: rejectedReceivedCount.count || 0,
      };

      return sendResponse(
        200,
        {
          stats,
          recentCourses: recentCourses.map((c) => ({
            id: c.id,
            title: c.title,
            category: c.category,
            progress: c.progress || 0,
            completedModules: c.completedModules || 0,
            modules: c.totalModules || 0,
          })),
          receivedApplications: formattedReceivedApplications,
          recentActivity: recentActivity.slice(0, 3),
          userRole: "investor",
        },
        "Investor dashboard stats retrieved successfully"
      );
    }

    // REGULAR USER DASHBOARD (farmer/buyer)
    const [enrolledCoursesCount] = await db
      .select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.userId, userId));

    const [completedCoursesCount] = await db
      .select({ count: count() })
      .from(courseProgress)
      .where(
        and(
          eq(courseProgress.userId, userId),
          eq(courseProgress.isCompleted, true)
        )
      );

    const [inProgressCoursesCount] = await db
      .select({ count: count() })
      .from(courseProgress)
      .where(
        and(
          eq(courseProgress.userId, userId),
          eq(courseProgress.isCompleted, false)
        )
      );

    const [totalApplicationsCount] = await db
      .select({ count: count() })
      .from(donationApplications)
      .where(eq(donationApplications.userId, userId));

    const [pendingApplicationsCount] = await db
      .select({ count: count() })
      .from(donationApplications)
      .where(
        and(
          eq(donationApplications.userId, userId),
          eq(donationApplications.status, "pending")
        )
      );

    const [approvedApplicationsCount] = await db
      .select({ count: count() })
      .from(donationApplications)
      .where(
        and(
          eq(donationApplications.userId, userId),
          eq(donationApplications.status, "approved")
        )
      );

    const [rejectedApplicationsCount] = await db
      .select({ count: count() })
      .from(donationApplications)
      .where(
        and(
          eq(donationApplications.userId, userId),
          eq(donationApplications.status, "rejected")
        )
      );

    const recentCourses = await db
      .select({
        id: course.id,
        title: course.title,
        category: course.category,
        progress: courseProgress.progressPercentage,
        completedModules: courseProgress.completedModules,
        totalModules: courseProgress.totalModules,
      })
      .from(courseProgress)
      .leftJoin(course, eq(course.id, courseProgress.courseId))
      .where(
        and(
          eq(courseProgress.userId, userId),
          eq(courseProgress.isCompleted, false)
        )
      )
      .orderBy(desc(courseProgress.updatedAt))
      .limit(3);

    const recentApplications = await db
      .select({
        id: donationApplications.id,
        projectTitle: donationApplications.projectTitle,
        status: donationApplications.status,
        budgetAmount: donationApplications.budgetAmount,
        createdAt: donationApplications.createdAt,
      })
      .from(donationApplications)
      .where(eq(donationApplications.userId, userId))
      .orderBy(desc(donationApplications.createdAt))
      .limit(3);

    const formattedApplications = recentApplications.map((app) => {
      const createdAt = new Date(app.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let submittedDate = "";
      if (diffDays === 0) submittedDate = "Today";
      else if (diffDays === 1) submittedDate = "1 day ago";
      else if (diffDays < 7) submittedDate = `${diffDays} days ago`;
      else if (diffDays < 14) submittedDate = "1 week ago";
      else if (diffDays < 30) submittedDate = `${Math.floor(diffDays / 7)} weeks ago`;
      else submittedDate = `${Math.floor(diffDays / 30)} months ago`;

      return {
        id: app.id,
        projectTitle: app.projectTitle,
        status: app.status,
        budgetAmount: app.budgetAmount,
        submittedDate,
      };
    });

    const recentActivity = [];

    const [lastCompletedCourse] = await db
      .select({
        title: course.title,
        completedAt: courseProgress.completedAt,
      })
      .from(courseProgress)
      .leftJoin(course, eq(course.id, courseProgress.courseId))
      .where(
        and(
          eq(courseProgress.userId, userId),
          eq(courseProgress.isCompleted, true)
        )
      )
      .orderBy(desc(courseProgress.completedAt))
      .limit(1);

    if (lastCompletedCourse?.title) {
      recentActivity.push({
        type: "course_completed",
        title: "Course Completed",
        description: lastCompletedCourse.title,
      });
    }

    const [lastEnrollment] = await db
      .select({
        title: course.title,
        enrolledAt: enrollments.enrolledAt,
      })
      .from(enrollments)
      .leftJoin(course, eq(course.id, enrollments.courseId))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt))
      .limit(1);

    if (lastEnrollment?.title) {
      recentActivity.push({
        type: "new_enrollment",
        title: "New Enrollment",
        description: lastEnrollment.title,
      });
    }

    const [lastApplication] = await db
      .select({
        projectTitle: donationApplications.projectTitle,
        createdAt: donationApplications.createdAt,
      })
      .from(donationApplications)
      .where(eq(donationApplications.userId, userId))
      .orderBy(desc(donationApplications.createdAt))
      .limit(1);

    if (lastApplication?.projectTitle) {
      recentActivity.push({
        type: "application_submitted",
        title: "Application Submitted",
        description: lastApplication.projectTitle,
      });
    }

    const stats = {
      totalCourses: enrolledCoursesCount.count || 0,
      completedCourses: completedCoursesCount.count || 0,
      inProgressCourses: inProgressCoursesCount.count || 0,
      totalApplications: totalApplicationsCount.count || 0,
      pendingApplications: pendingApplicationsCount.count || 0,
      approvedApplications: approvedApplicationsCount.count || 0,
      rejectedApplications: rejectedApplicationsCount.count || 0,
    };

    return sendResponse(
      200,
      {
        stats,
        recentCourses: recentCourses.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          progress: c.progress || 0,
          completedModules: c.completedModules || 0,
          modules: c.totalModules || 0,
        })),
        recentApplications: formattedApplications,
        recentActivity: recentActivity.slice(0, 3),
        userRole: "user",
      },
      "Dashboard stats retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};

