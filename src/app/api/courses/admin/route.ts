import db from "@/server/db";
import { course, courseModules, courseProgress } from "@/server/db/schema";
import { checkIfUserIsAdmin, getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { getPaginationParams } from "@/utils/pagination";
import { sendResponse } from "@/utils/response";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

type CountResult = { count: number };
 
export const GET = async (req: NextRequest) => {
  try {
    const userId = await getUserIdFromSession();
    const admin = await checkIfUserIsAdmin();
    
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }
    
    if (!admin) {
      return sendResponse(403, null, "Forbidden - Admin access required");
    }

    const pagination = await getPaginationParams(req);
    let { page, offset } = pagination;
    const { limit } = pagination;

    const totalResult = await db.execute<CountResult>(
      sql`SELECT COUNT(*)::int AS count FROM ${course}`
    );

    const totalCount = totalResult.rows[0]?.count ?? 0;
    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    if (page > totalPages) {
      page = 1;
      offset = 0;
    }

    const paginatedCourses = await db
      .select({
        id: course.id,
        createdId: course.createdId,
        title: course.title,
        description: course.description,
        timeToComplete: course.timeToComplete,
        level: course.level,
        category: course.category,
        language: course.language,
        contentType: course.contentType,
        contentUrl: course.contentUrl,
        textContent: course.textContent,
        isDownloadable: course.isDownloadable,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        moduleCount: sql<number>`COUNT(DISTINCT ${courseModules.id})::int`.as('module_count'),
        isCompleted: sql<boolean>`COALESCE(${courseProgress.isCompleted}, false)`.as('is_completed'),
        progressPercentage: sql<number>`COALESCE(${courseProgress.progressPercentage}, 0)`.as('progress_percentage'),
        completedModules: sql<number>`COALESCE(${courseProgress.completedModules}, 0)`.as('completed_modules'),
        totalModules: sql<number>`COALESCE(${courseProgress.totalModules}, 0)`.as('total_modules'),
      })
      .from(course)
      .leftJoin(courseModules, eq(course.id, courseModules.courseId))
      .leftJoin(
        courseProgress,
        and(
          eq(course.id, courseProgress.courseId),
          eq(courseProgress.userId, userId)
        )
      )
      .where(eq(course.createdId, userId ?? ''))
      .groupBy(
        course.id,
        courseProgress.isCompleted,
        courseProgress.progressPercentage,
        courseProgress.completedModules,
        courseProgress.totalModules
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(course.createdAt));

    return sendResponse(
      200,
      {
        data: paginatedCourses,
        count: paginatedCourses.length,
        page,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      paginatedCourses.length === 0 ? "No course found" : "Courses fetched successfully"
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};


