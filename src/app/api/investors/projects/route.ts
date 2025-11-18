import db from "@/server/db";
import { projects } from "@/server/db/schema";
import { getUserIdFromSession, getUserTypeFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { projectSchema } from "@/validator/projectValidator";
import { NextRequest, NextResponse } from "next/server";

interface ProjectInterface {
  title: string;
  goalAmount: number;
  isActive: boolean;
  description: string;
  startDate: Date;
  endDate: Date;
}

export const POST = async (req: NextRequest) => {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const userType = await getUserTypeFromSession();
    const userId = await getUserIdFromSession();

    if (userType !== "investor") {
      return sendResponse(403, null, "Forbidden: Only investor can create projects");
    }

    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }
    const processedBody = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    };

    const data = projectSchema.safeParse(processedBody);

    if (!data.success) {
      const errors = Object.fromEntries(
        Object.entries(data.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
      );
      return NextResponse.json(
        { status: "Error!", errors, message: "Validation failed" },
        { status: 400 }
      );
    }

    const { title, goalAmount, description, isActive, startDate, endDate } = data.data as ProjectInterface;
    await db.insert(projects).values({
      ownerId: userId,
      title,
      goalAmount,
      description,
      isActive,
      startDate,
      endDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return sendResponse(201, null, "Project created successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};

export const GET = async () => {
  try {
    const allProjects = await db.select().from(projects);
    return sendResponse(200, allProjects, "All projects returned successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};