import { NextRequest } from "next/server";
import db from "@/server/db";
import {
  course,
  enrollments,
  courseProgress,
  donationApplications,
  certificates,
} from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq, and, count, sql } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

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
      .orderBy(sql`${courseProgress.updatedAt} DESC`)
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
      .orderBy(sql`${donationApplications.createdAt} DESC`)
      .limit(3);

    const formattedApplications = recentApplications.map((app) => {
      const createdAt = new Date(app.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let submittedDate = "";
      if (diffDays === 0) {
        submittedDate = "Today";
      } else if (diffDays === 1) {
        submittedDate = "1 day ago";
      } else if (diffDays < 7) {
        submittedDate = `${diffDays} days ago`;
      } else if (diffDays < 14) {
        submittedDate = "1 week ago";
      } else if (diffDays < 30) {
        submittedDate = `${Math.floor(diffDays / 7)} weeks ago`;
      } else {
        submittedDate = `${Math.floor(diffDays / 30)} months ago`;
      }

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
      .orderBy(sql`${courseProgress.completedAt} DESC`)
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
      .orderBy(sql`${enrollments.enrolledAt} DESC`)
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
      .orderBy(sql`${donationApplications.createdAt} DESC`)
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
        recentCourses: recentCourses.map((course) => ({
          id: course.id,
          title: course.title,
          category: course.category,
          progress: course.progress || 0,
          completedModules: course.completedModules || 0,
          totalModules: course.totalModules || 0,
          modules: course.totalModules || 0,
        })),
        recentApplications: formattedApplications,
        recentActivity: recentActivity.slice(0, 3),
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