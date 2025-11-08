import db from "@/server/db";
import { course, courseModuleProgress, courseModules, courseProgress, users } from "@/server/db/schema";
import { uploadVideo } from "@/utils/cloudinary";
import { checkIfUserIsAdmin, getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { courseModuleValidation } from "@/validator/courseModule";
import { and, count, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (req: NextRequest, {params}: {params: Promise<{id: string}>}) => {
  try {
     const { id } = await params;

     const [existingCourse] = await db.select().from(course).where(eq(course.id, id));

     if(!existingCourse){
      return sendResponse(400, null, "Course not found");
     }

     const userId = await getUserIdFromSession();
     const isAdmin = await checkIfUserIsAdmin();
 
     if (!isAdmin || !userId) {
       return sendResponse(401, null, "Unauthorized");
     }

     const formData = await req.formData();

     const title = formData.get("title") as string;
     const description = formData.get("description") as string;
     const durationTime = formData.get("durationTime") as string;
     const contentType = formData.get("contentType") as string;
     const textContent = formData.get("textContent") as string | null;
     const videoFile = formData.get("video") as File | null;

     const validationData = {
      title,
      description,
      durationTime,
      contentType,
      textContent: textContent || undefined,
     };

     const validation = courseModuleValidation.safeParse(validationData);
     
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

     const [newModule] = await db.insert(courseModules).values({
       courseId: id,
       title: validation.data.title,
       description: validation.data.description,
       durationTime: validation.data.durationTime,
       contentType: validation.data.contentType as any,
       contentUrl: contentUrl,
       textContent: validation.data.contentType === "text" ? validation.data.textContent : null,
     }).returning();

     const [totalModulesResult] = await db
       .select({ count: count() })
       .from(courseModules)
       .where(eq(courseModules.courseId, id));

     const totalModules = totalModulesResult?.count || 0;

     const [completedModulesResult] = await db
       .select({ count: count() })
       .from(courseModuleProgress)
       .where(
         and(
           eq(courseModuleProgress.userId, userId),
           eq(courseModuleProgress.courseId, id),
           eq(courseModuleProgress.isCompleted, true)
         )
       );

     const completedModules = completedModulesResult?.count || 0;
     const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

     const [existingProgress] = await db
       .select()
       .from(courseProgress)
       .where(
         and(
           eq(courseProgress.userId, userId),
           eq(courseProgress.courseId, id)
         )
       )
       .limit(1);

     if (existingProgress) {
       await db
         .update(courseProgress)
         .set({
           totalModules,
           completedModules,
           progressPercentage,
           updatedAt: new Date(),
         })
         .where(eq(courseProgress.id, existingProgress.id));
     } else {
       await db.insert(courseProgress).values({
         userId,
         courseId: id,
         totalModules,
         completedModules,
         progressPercentage,
         isCompleted: false,
       });
     }

     return sendResponse(200, newModule, "Module created successfully");

  } catch (error) {
    console.error("Module creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: courseId } = await params;
    const userId = await getUserIdFromSession();

    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const [courseData] = await db
      .select()
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1);

    if (!courseData) {
      return sendResponse(404, null, "Course not found");
    }

    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(courseModules.createdAt);

    const userProgress = await db
      .select()
      .from(courseModuleProgress)
      .where(
        and(
          eq(courseModuleProgress.courseId, courseId),
          eq(courseModuleProgress.userId, userId)
        )
      );

    const progressMap = new Map(
      userProgress.map((p) => [
        p.moduleId,
        {
          isCompleted: p.isCompleted,
          completedAt: p.completedAt,
        },
      ])
    );

    const modulesWithProgress = modules.map((module) => {
      const progress = progressMap.get(module.id);
      return {
        ...module,
        isCompleted: progress?.isCompleted || false,
        completedAt: progress?.completedAt || null,
      };
    });

    const [overallProgress] = await db
      .select()
      .from(courseProgress)
      .where(
        and(
          eq(courseProgress.courseId, courseId),
          eq(courseProgress.userId, userId)
        )
      )
      .limit(1);

    const responseData = {
      ...courseData,
      modules: modulesWithProgress,
      progress: overallProgress || {
        completedModules: 0,
        totalModules: modules.length,
        progressPercentage: 0,
        isCompleted: false,
      },
      isCourseCompleted: overallProgress?.isCompleted || false,
      moduleCount: modules.length,
    };

    return sendResponse(200, responseData, "Course modules fetched successfully");
  } catch (error) {
    console.error("Error fetching course modules:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};