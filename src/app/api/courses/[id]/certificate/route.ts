import { NextRequest } from "next/server";
import db from "@/server/db";
import { certificates, courseProgress, course, users } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq, and } from "drizzle-orm";

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

    const [existingCertificate] = await db
      .select({
        id: certificates.id,
        issuedAt: certificates.issuedAt,
        completionMessage: certificates.completionMessage,
        courseTitle: course.title,
        courseInstructorFullName: users.fullName,
        timeToComplete: course.timeToComplete,
        completedAt: certificates.completedAt,
      })
      .from(certificates)
      .leftJoin(course, eq(course.id, certificates.courseId))
      .leftJoin(users, eq(course.createdId, users.id))
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

    const [courseData] = await db
      .select({ title: course.title })
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1);

    if (!courseData) {
      return sendResponse(404, null, "Course not found");
    }

    const [user] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const [newCertificate] = await db
      .insert(certificates)
      .values({
        userId: userId,
        courseId: courseId,
        completionMessage: `Congratulations on completing this course! Your commitment to learning and personal growth is truly commendable. This certificate stands as a testament to your dedication, perseverance, and the valuable skills you've acquired. May this achievement be a stepping stone to even greater success in your future endeavors.`,
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