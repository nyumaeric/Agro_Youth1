// import db from "@/server/db";
// import { certificates, course, courseModules, users } from "@/server/db/schema";
// import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
// import { sendResponse } from "@/utils/response";
// import { and, eq } from "drizzle-orm";
// import { NextRequest } from "next/server";

// export const POST = async (req: NextRequest, 
//   context: { params: Promise<{ id: string }> 
// }) => {
//   try {
//     let body: unknown;
//     try {
//       body = await req.json();
//     } catch {
//       body = {};
//     }

//     const { id } = await context.params;
//     const userId = await getUserIdFromSession();
    
//     if (!userId) {
//       return sendResponse(401, null, "Unauthorized");
//     }

//     const checkIfCourseCompleted = await db.select().from(course).where(eq(course.id, id));
    
//     if (!checkIfCourseCompleted || checkIfCourseCompleted.length === 0) {
//       return sendResponse(400, null, "Course not found");
//     }

//     const courseData = checkIfCourseCompleted[0];
//     const isCourseCompleted = courseData.isCourseCompleted;

//     if (!isCourseCompleted) {
//       return sendResponse(400, null, "Course not yet completed");
//     }

//     const existingCertificate = await db.select()
//       .from(certificates)
//       .where(
//         and(
//           eq(certificates.courseId, id),
//           eq(certificates.userId, userId)
//         )
//       );

//     if (existingCertificate && existingCertificate.length > 0) {
//       return sendResponse(400, null, "Certificate already issued for this course");
//     }

//     const courseName = courseData.title || "";
//     const completionMessage = `Congratulations on successfully completing ${courseName}! Your dedication and hard work have paid off. This certificate recognizes your achievement and the knowledge you've gained throughout this learning journey. Keep up the excellent work!`;

//     await db.insert(certificates).values({
//       userId: userId,
//       courseId: id,
//       completionMessage,
//       completedAt: new Date(),
//     });

//     return sendResponse(200, completionMessage, "Certificate issued successfully");

//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : "An error occurred";
//     return sendResponse(500, null, errorMessage);
//   }
// };


// export const GET = async (req: NextRequest, 
//   context: { params: Promise<{ id: string }> 
// }) => {
//   try {
//     const { id } = await context.params;
//     const userId = await getUserIdFromSession();
    
//     if (!userId) {
//       return sendResponse(401, null, "Unauthorized");
//     }

//     const certificate = await db
//       .select({
//         id: certificates.id,
//         courseId: certificates.courseId,
//         courseTitle: course.title,
//         courseDescription: course.description,
//         courseLevel: course.level,
//         courseCategory: course.category,
//         courseLanguage: course.language,
//         userName: users.fullName,
//         timeToComplete: course.timeToComplete,
//         courseInstructorFullName: users.fullName,
//         completionMessage: certificates.completionMessage,
//         completedAt: certificates.completedAt,
//         createdAt: certificates.issuedAt,
//       })
//       .from(certificates)
//       .leftJoin(course, eq(certificates.courseId, course.id))
//       .leftJoin(users, eq(course.createdId, users.id))
//       .where(
//         and(
//           eq(certificates.courseId, id),
//           eq(certificates.userId, userId)
//         )
//       )
//       .limit(1);

//     if (!certificate || certificate.length === 0) {
//       return sendResponse(404, null, "Certificate not found");
//     }

//     return sendResponse(200, certificate[0], "Certificate retrieved successfully");

//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : "An error occurred";
//     return sendResponse(500, null, errorMessage);
//   }
// };

import { NextRequest } from "next/server";
import db from "@/server/db";
import { certificates, courseProgress, course, users } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq, and } from "drizzle-orm";

// GET - Check if user has certificate or can claim one
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

    // Check if user already has a certificate
    const [existingCertificate] = await db
      .select({
        id: certificates.id,
        issuedAt: certificates.issuedAt,
        completionMessage: certificates.completionMessage,
        completedAt: certificates.completedAt,
      })
      .from(certificates)
      .where(
        and(
          eq(certificates.userId, userId),
          eq(certificates.courseId, courseId)
        )
      )
      .limit(1);

    if (existingCertificate) {
      // Get user name for certificate
      const [user] = await db
        .select({ fullName: users.fullName })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return sendResponse(
        200,
        {
          ...existingCertificate,
          userName: user?.fullName || "User",
        },
        "Certificate found"
      );
    }

    // Check if user has completed the course
    const [progress] = await db
      .select()
      .from(courseProgress)
      .where(
        and(
          eq(courseProgress.userId, userId),
          eq(courseProgress.courseId, courseId)
        )
      )
      .limit(1);

    if (!progress || !progress.isCompleted) {
      return sendResponse(
        400,
        { canClaim: false },
        "Course not completed yet"
      );
    }

    return sendResponse(
      200,
      { canClaim: true },
      "Course completed, certificate can be claimed"
    );
  } catch (error) {
    console.error("Error checking certificate:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};

// POST - Claim certificate
export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: courseId } = await params;
    const userId = await getUserIdFromSession();

    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    // Check if certificate already exists
    const [existingCertificate] = await db
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.userId, userId),
          eq(certificates.courseId, courseId)
        )
      )
      .limit(1);

    if (existingCertificate) {
      return sendResponse(400, null, "Certificate already claimed");
    }

    // Verify course is completed
    const [progress] = await db
      .select()
      .from(courseProgress)
      .where(
        and(
          eq(courseProgress.userId, userId),
          eq(courseProgress.courseId, courseId)
        )
      )
      .limit(1);

    if (!progress || !progress.isCompleted) {
      return sendResponse(400, null, "Course must be completed to claim certificate");
    }

    // Get course details
    const [courseData] = await db
      .select({ title: course.title })
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1);

    if (!courseData) {
      return sendResponse(404, null, "Course not found");
    }

    // Get user details
    const [user] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Create certificate
    const [newCertificate] = await db
      .insert(certificates)
      .values({
        userId,
        courseId,
        completionMessage: `Congratulations on completing ${courseData.title}!`,
        completedAt: progress.completedAt || new Date(),
        issuedAt: new Date(),
      })
      .returning();

    return sendResponse(
      201,
      {
        ...newCertificate,
        userName: user?.fullName || "User",
      },
      "Certificate claimed successfully"
    );
  } catch (error) {
    console.error("Error claiming certificate:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};