import db from "@/server/db";
import { projects, users } from "@/server/db/schema";
import { sendResponse } from "@/utils/response";
import { eq } from "drizzle-orm";

export const GET = async () => {
  try {
    const allProjects = await db.select({
      id: projects.id,  // ADD THIS - Important!
      title: projects.title,
      goalAmount: projects.goalAmount,
      description: projects.description,
      startDate: projects.startDate,
      endDate: projects.endDate,
      isActive: projects.isActive,  // ADD THIS
      investor: {
        id: users.id,
        name: users.fullName,
      }
    }).from(projects)
      .leftJoin(users, eq(projects.ownerId, users.id))
      .where(eq(projects.isActive, true));  // Only show active projects
    
    return sendResponse(200, allProjects, "All projects returned successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};