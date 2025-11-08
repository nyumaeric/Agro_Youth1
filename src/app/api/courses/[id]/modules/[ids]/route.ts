import db from "@/server/db";
import { courseModuleProgress, courseModules, courseProgress } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { and, count, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ id: string; ids: string }> }
) => {
  try {
    const { id: courseId, ids: moduleId } = await context.params;
    const userId = await getUserIdFromSession();

    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const [module] = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, moduleId))
      .limit(1);

    if (!module) {
      return sendResponse(404, null, "Module not found");
    }

    const [progress] = await db
      .select()
      .from(courseModuleProgress)
      .where(
        and(
          eq(courseModuleProgress.moduleId, moduleId),
          eq(courseModuleProgress.userId, userId)
        )
      )
      .limit(1);

    const moduleWithProgress = {
      ...module,
      isCompleted: progress?.isCompleted || false,
      completedAt: progress?.completedAt || null,
    };

    return sendResponse(200, moduleWithProgress, "Module fetched successfully");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};


export const PATCH = async (
  request: NextRequest,
  context: { params: Promise<{ id: string; ids: string }> }
) => {
  try {
    const { id: courseId, ids: moduleId } = await context.params;
    const userId = await getUserIdFromSession();

    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const requestBody = await request.json();
    const { isCompleted } = requestBody;

    const [module] = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, moduleId))
      .limit(1);

    if (!module) {
      return sendResponse(404, null, "Module not found");
    }

    const [existingProgress] = await db
      .select()
      .from(courseModuleProgress)
      .where(
        and(
          eq(courseModuleProgress.moduleId, moduleId),
          eq(courseModuleProgress.userId, userId),
          eq(courseModuleProgress.courseId, courseId)
        )
      )
      .limit(1);

    let updatedProgress;

    if (existingProgress) {
      // Update existing progress
      [updatedProgress] = await db
        .update(courseModuleProgress)
        .set({
          isCompleted: isCompleted,
          completedAt: isCompleted ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(courseModuleProgress.id, existingProgress.id))
        .returning();
    } else {
      // Create new progress record
      [updatedProgress] = await db
        .insert(courseModuleProgress)
        .values({
          userId,
          courseId,
          moduleId,
          isCompleted: isCompleted,
          completedAt: isCompleted ? new Date() : null,
        })
        .returning();
    }

    const [totalModulesResult] = await db
      .select({ count: count() })
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId));

    const totalModules = totalModulesResult?.count || 0;

    const [completedModulesResult] = await db
      .select({ count: count() })
      .from(courseModuleProgress)
      .where(
        and(
          eq(courseModuleProgress.userId, userId),
          eq(courseModuleProgress.courseId, courseId),
          eq(courseModuleProgress.isCompleted, true)
        )
      );

    const completedModules = completedModulesResult?.count || 0;
    const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    const isCourseCompleted = completedModules === totalModules && totalModules > 0;

    console.log('Progress calculation:', {
      totalModules,
      completedModules,
      progressPercentage,
      isCourseCompleted
    });

    const [existingCourseProgress] = await db
      .select()
      .from(courseProgress)
      .where(
        and(
          eq(courseProgress.userId, userId),
          eq(courseProgress.courseId, courseId)
        )
      )
      .limit(1);

    if (existingCourseProgress) {
      await db
        .update(courseProgress)
        .set({
          completedModules,
          totalModules,
          progressPercentage,
          isCompleted: isCourseCompleted,
          completedAt: isCourseCompleted ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(courseProgress.id, existingCourseProgress.id));
    } else {
      await db
        .insert(courseProgress)
        .values({
          userId,
          courseId,
          completedModules,
          totalModules,
          progressPercentage,
          isCompleted: isCourseCompleted,
          completedAt: isCourseCompleted ? new Date() : null,
        });
    }


    return sendResponse(
      200,
      {
        module: {
          ...module,
          isCompleted: updatedProgress.isCompleted,
          completedAt: updatedProgress.completedAt,
        },
        progress: {
          completedModules,
          totalModules,
          progressPercentage,
          isCompleted: isCourseCompleted,
        },
        courseCompleted: isCourseCompleted,
      },
      isCourseCompleted 
        ? "🎉 Congratulations! You've completed the entire course!" 
        : "Module progress updated successfully"
    );
  } catch (error) {
    console.error("Error updating module progress:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};