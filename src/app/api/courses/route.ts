import db from "@/server/db";
import { course, courseModuleProgress, courseModules, courseProgress } from "@/server/db/schema";
import { uploadVideo } from "@/utils/cloudinary";
import { checkIfUserIsAdmin, getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { getPaginationParams } from "@/utils/pagination";
import { sendResponse } from "@/utils/response";
import { courseValidation } from "@/validator/coursesSchema";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const userId = await getUserIdFromSession();
    const isAdmin = await checkIfUserIsAdmin();
    if (!isAdmin) {
      return sendResponse(401, null, "Unauthorized");
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const timeToComplete = formData.get("timeToComplete") as string;
    const level = formData.get("level") as string;
    const category = formData.get("category") as string;
    const language = formData.get("language") as string;
    const contentType = formData.get("contentType") as string;
    const textContent = formData.get("textContent") as string | null;
    const videoFile = formData.get("video") as File | null;
    const isDownloadable = formData.get("isDownloadable") === "true";

    const validationData = {
      title,
      description,
      timeToComplete,
      level,
      category,
      language,
      contentType,
      textContent: textContent || undefined,
      isDownloadable
    };

    const validation = courseValidation.safeParse(validationData);
    if (!validation.success) {
      const errors = Object.fromEntries(
        Object.entries(validation.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
      );
      return NextResponse.json(
        { status: "Error!", errors, message: "Validation failed" },
        { status: 400 }
      );
    }

    let contentUrl: string | null = null;
    if (contentType === "video") {
      if (!videoFile) {
        return sendResponse(400, null, "Video file is required when content type is video");
      }

      const validVideoTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo"];
      if (!validVideoTypes.includes(videoFile.type)) {
        return sendResponse(400, null, "Invalid video format. Supported formats: MP4, MPEG, MOV, AVI");
      }

      const maxSize = 100 * 1024 * 1024;
      if (videoFile.size > maxSize) {
        return sendResponse(400, null, "Video file size must be less than 100MB");
      }

      try {
        contentUrl = await uploadVideo(videoFile);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Video upload failed";
        return sendResponse(500, null, errorMessage);
      }
    }

    const [newCourse] = await db.insert(course).values({
      createdId: userId as string,
      title: validation.data.title,
      description: validation.data.description,
      level: validation.data.level as any,
      category: validation.data.category as any,
      language: validation.data.language as any,
      timeToComplete: validation.data.timeToComplete,
      contentType: validation.data.contentType as any,
      contentUrl: contentUrl,
      textContent: validation.data.contentType === "text" ? validation.data.textContent : null,
      isDownloadable: validation.data.isDownloadable,
    }).returning();

    return sendResponse(200, newCourse, "Course created successfully");
  } catch (error) {
    console.error("Course creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};

type CountResult = { count: number };

export const GET = async (req: NextRequest) => {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
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

    // Main query with LEFT JOIN to get course completion status
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
        // LEFT JOIN to get completion status
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
          eq(courseProgress.courseId, course.id),
          eq(courseProgress.userId, userId)
        )
      )
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

    const coursesWithModules = await Promise.all(
      paginatedCourses.map(async (courseItem) => {
        // Get all modules for this course
        const allModules = await db
          .select({
            id: courseModules.id,
            courseId: courseModules.courseId,
          })
          .from(courseModules)
          .where(eq(courseModules.courseId, courseItem.id));

        const totalModules = allModules.length;

        // Count completed modules
        const completedModulesResult = await db
          .select({ count: count() })
          .from(courseModuleProgress)
          .where(
            and(
              eq(courseModuleProgress.courseId, courseItem.id),
              eq(courseModuleProgress.userId, userId),
              eq(courseModuleProgress.isCompleted, true)
            )
          );

        const completedModulesCount = completedModulesResult[0]?.count || 0;

        // Get modules with completion status
        const modules = await db
          .select({
            id: courseModules.id,
            title: courseModules.title,
            description: courseModules.description,
            content: courseModules.textContent,
            contentType: courseModules.contentType,
            contentUrl: courseModules.contentUrl,
            durationTime: courseModules.durationTime,
            isCompleted: sql<boolean>`COALESCE(${courseModuleProgress.isCompleted}, false)`.as('is_completed'),
            completedAt: courseModuleProgress.completedAt,
            createdAt: courseModules.createdAt,
            updatedAt: courseModules.updatedAt,
          })
          .from(courseModules)
          .leftJoin(
            courseModuleProgress,
            and(
              eq(courseModules.id, courseModuleProgress.moduleId),
              eq(courseModuleProgress.userId, userId)
            )
          )
          .where(eq(courseModules.courseId, courseItem.id))
          .orderBy(courseModules.createdAt);

        const progressPercentage = totalModules > 0 
          ? Math.round((completedModulesCount / totalModules) * 100) 
          : 0;

        const isCourseCompleted = totalModules > 0 && completedModulesCount === totalModules;

        // Update or create course progress
        const [existingProgress] = await db
          .select()
          .from(courseProgress)
          .where(
            and(
              eq(courseProgress.courseId, courseItem.id),
              eq(courseProgress.userId, userId)
            )
          )
          .limit(1);

        if (existingProgress) {
          await db
            .update(courseProgress)
            .set({
              completedModules: completedModulesCount,
              totalModules: totalModules,
              progressPercentage: progressPercentage,
              isCompleted: isCourseCompleted,
              completedAt: isCourseCompleted ? (existingProgress.completedAt || new Date()) : null,
              updatedAt: new Date(),
            })
            .where(eq(courseProgress.id, existingProgress.id));
        } else if (completedModulesCount > 0 || totalModules > 0) {
          await db.insert(courseProgress).values({
            userId,
            courseId: courseItem.id,
            completedModules: completedModulesCount,
            totalModules: totalModules,
            progressPercentage: progressPercentage,
            isCompleted: isCourseCompleted,
            completedAt: isCourseCompleted ? new Date() : null,
          });
        }

        return {
          ...courseItem,
          isCourseCompleted,
          modules,
          progress: {
            completedModules: completedModulesCount,
            totalModules,
            progressPercentage,
            isCompleted: isCourseCompleted,
            completedAt: isCourseCompleted ? (existingProgress?.completedAt || new Date()) : null,
          }
        };
      })
    );

    return sendResponse(
      200,
      {
        data: coursesWithModules,
        count: coursesWithModules.length,
        page,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      coursesWithModules.length === 0 ? "No course found" : "Courses fetched successfully"
    );
  } catch (error) {
    console.error("Course fetch error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};