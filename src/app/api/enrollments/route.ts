// import { NextRequest } from "next/server";
// import db from "@/server/db";
// import { course, enrollments, courseModules } from "@/server/db/schema";
// import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
// import { sendResponse } from "@/utils/response";
// import { eq, sql, desc } from "drizzle-orm";

// export const GET = async (req: NextRequest) => {
//   try {
//     const userId = await getUserIdFromSession();
    
//     if (!userId) {
//       return sendResponse(401, null, "Unauthorized");
//     }

//     const userEnrollments = await db
//       .select({
//         id: enrollments.id,
//         userId: enrollments.userId,
//         courseId: enrollments.courseId,
//         enrolledAt: enrollments.enrolledAt,
//         title: course.title,
//         description: course.description,
//         timeToComplete: course.timeToComplete,
//         level: course.level,
//         category: course.category,
//         language: course.language,
//         isCourseCompleted: course.isCourseCompleted,
//         isDownloadable: course.isDownloadable,
//         createdAt: course.createdAt,
//         updatedAt: course.updatedAt,
//         createdId: course.createdId,
//         moduleCount: sql<number>`(
//           SELECT COUNT(*)::int 
//           FROM ${courseModules} 
//           WHERE ${courseModules.courseId} = ${course.id}
//         )`.as('moduleCount')
//       })
//       .from(enrollments)
//       .leftJoin(course, eq(enrollments.courseId, course.id))
//       .where(eq(enrollments.userId, userId))
//       .orderBy(desc(enrollments.enrolledAt));

//     return sendResponse(200, userEnrollments, "Enrollments fetched successfully");
    
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : "An error occurred";
//     return sendResponse(500, null, errorMessage);
//   }
// };



// app/api/enrollments/route.ts
import { NextRequest } from "next/server";
import db from "@/server/db";
import { enrollments, course, courseProgress } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return sendResponse(401, null, "Unauthorized. Please login.");
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    // If checking specific course enrollment
    if (courseId) {
      const [enrollment] = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.userId, userId),
            eq(enrollments.courseId, courseId)
          )
        );

      return sendResponse(
        200,
        { enrolled: !!enrollment, enrollment },
        "Enrollment status retrieved"
      );
    }

    // Get all enrollments with full course details and progress
    const enrolledCoursesWithProgress = await db
      .select({
        // Enrollment info
        enrollmentId: enrollments.id,
        enrolledAt: enrollments.enrolledAt,
        
        // Course details
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        language: course.language,
        timeToComplete: course.timeToComplete,
        
        // Module count - use subquery to count actual modules
        moduleCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM course_modules 
          WHERE course_modules.course_id = ${course.id}
        )`.as('module_count'),
        
        // Progress data
        completedModules: courseProgress.completedModules,
        totalModules: courseProgress.totalModules,
        progressPercentage: courseProgress.progressPercentage,
        isCompleted: courseProgress.isCompleted,
        completedAt: courseProgress.completedAt,
      })
      .from(enrollments)
      .innerJoin(course, eq(enrollments.courseId, course.id))
      .leftJoin(
        courseProgress,
        and(
          eq(courseProgress.courseId, course.id),
          eq(courseProgress.userId, userId)
        )
      )
      .where(eq(enrollments.userId, userId))
      .orderBy(enrollments.enrolledAt);

    // Format the response to match expected structure
    const formattedCourses = enrolledCoursesWithProgress.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      level: item.level,
      language: item.language,
      timeToComplete: item.timeToComplete,
      moduleCount: item.moduleCount || 0,
      completionPercentage: item.progressPercentage || 0,
      completedModules: item.completedModules || 0,
      totalModules: item.totalModules || item.moduleCount || 0,
      isCompleted: item.isCompleted || false,
      completedAt: item.completedAt,
      enrolledAt: item.enrolledAt,
      isEnrolled: true, // Always true since these are enrolled courses
    }));

    return sendResponse(
      200,
      formattedCourses,
      "Enrolled courses retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch enrollments";
    return sendResponse(500, null, errorMessage);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { courseId } = await req.json();
    const userId = await getUserIdFromSession();

    if (!userId) {
      return sendResponse(401, null, "Unauthorized. Please login.");
    }

    if (!courseId) {
      return sendResponse(400, null, "Course ID is required");
    }

    // Check if already enrolled
    const existingEnrollment = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.courseId, courseId),
          eq(enrollments.userId, userId)
        )
      )
      .limit(1);

    if (existingEnrollment.length > 0) {
      return sendResponse(400, null, "Already enrolled in this course");
    }

    // Create new enrollment
    const [newEnrollment] = await db
      .insert(enrollments)
      .values({
        courseId: courseId,
        userId: userId,
        enrolledAt: new Date(),
      })
      .returning();

    return sendResponse(201, newEnrollment, "Successfully enrolled in course");
  } catch (error) {
    console.error("Enrollment error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to enroll in course";
    return sendResponse(500, null, errorMessage);
  }
}