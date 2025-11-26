import db from "@/server/db";
import { roles, users } from "@/server/db/schema";
import { checkIfUserIsAdmin, getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq, ne, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async(req: NextRequest) => {
    try {
        const userId = await getUserIdFromSession();
        if(!userId){
            return sendResponse(400, null, "Unauthorized")
        }
        const isAdmin = await checkIfUserIsAdmin();
        if(!isAdmin){
            return sendResponse(400, null, "Unauthorized")
        }
        const user = await db.select({
            id: users.id,
            fullName: users.fullName,
            userType: users.userType,
            isAnonymous: users.isAnonymous,
            anonymousName: users.anonymousName,
            phoneNumber: users.phoneNumber,
            createdAt: users.createdAt,
            role: users.role,
            roleName: roles.name 
          }).from(users)
          .leftJoin(roles, eq(roles.id, users.role))
          .where(ne(users.id, userId))
          .orderBy(users.createdAt)
          
        return sendResponse(200,user, "All Users Successfully")
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Verification failed. Please try again.";
        return sendResponse(500, errorMessage, "Unexpected error occured")
    }
}


export const PUT = async(req: NextRequest) => {
    try {
        // 1. Check authentication
        const adminUserId = await getUserIdFromSession();
        if(!adminUserId){
            return sendResponse(401, null, "Unauthorized: Please login")
        }

        // 2. Check admin authorization
        const isAdmin = await checkIfUserIsAdmin();
        if(!isAdmin){
            return sendResponse(403, null, "Forbidden: Admin access required")
        }

        // 3. Parse request body - ONLY role and userType allowed
        const body = await req.json();
        const { userId, userType, roleId } = body;

        // 4. Validate required fields
        if (!userId) {
            return sendResponse(400, null, "User ID is required")
        }

        if (!userType && !roleId) {
            return sendResponse(400, null, "At least one field (userType or roleId) is required")
        }

        // 5. Prevent admin from updating themselves through this endpoint
        if (userId === adminUserId) {
            return sendResponse(400, null, "Cannot update your own account through this endpoint")
        }

        // 6. Check if user exists
        const existingUser = await db.select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (existingUser.length === 0) {
            return sendResponse(404, null, "User not found")
        }

        // 7. Validate userType if provided
        if (userType && !['farmer', 'buyer', 'investor'].includes(userType)) {
            return sendResponse(400, null, "Invalid user type. Must be 'farmer', 'buyer', or 'investor'")
        }

        // 8. Validate role if provided
        if (roleId) {
            const roleExists = await db.select()
                .from(roles)
                .where(eq(roles.id, roleId))
                .limit(1);

            if (roleExists.length === 0) {
                return sendResponse(400, null, "Invalid role ID")
            }
        }

        // 9. Prepare update data - ONLY role and userType
        const updateData: any = {
            updatedAt: new Date(),
            sessionVersion: sql`${users.sessionVersion} + 1`
        };

        if (userType !== undefined) updateData.userType = userType;
        if (roleId !== undefined) updateData.role = roleId;

        // 10. Update user
        await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId));

        // 11. Fetch complete user data with role name
        const completeUserData = await db.select({
            id: users.id,
            fullName: users.fullName,
            phoneNumber: users.phoneNumber,
            userType: users.userType,
            role: users.role,
            roleName: roles.name,
            sessionVersion: users.sessionVersion,
            updatedAt: users.updatedAt
        })
        .from(users)
        .leftJoin(roles, eq(roles.id, users.role))
        .where(eq(users.id, userId))
        .limit(1);

        return sendResponse(200, completeUserData[0], "User role and type updated successfully")

    } catch (error) {
        console.error("User update error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update user";
        return sendResponse(500, null, errorMessage)
    }
}
