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
        const adminUserId = await getUserIdFromSession();
        if(!adminUserId){
            return sendResponse(401, null, "Unauthorized: Please login")
        }

        const isAdmin = await checkIfUserIsAdmin();
        if(!isAdmin){
            return sendResponse(403, null, "Forbidden: Admin access required")
        }

        const body = await req.json();
        const { userId, userType, roleId } = body;

        if (!userId) {
            return sendResponse(400, null, "User ID is required")
        }

        if (!userType && !roleId) {
            return sendResponse(400, null, "At least one field (userType or roleId) is required")
        }

        if (userId === adminUserId) {
            return sendResponse(400, null, "Cannot update your own account through this endpoint")
        }

        const existingUser = await db.select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (existingUser.length === 0) {
            return sendResponse(404, null, "User not found")
        }

        if (userType && !['farmer', 'buyer', 'investor'].includes(userType)) {
            return sendResponse(400, null, "Invalid user type. Must be 'farmer', 'buyer', or 'investor'")
        }

        if (roleId) {
            const roleExists = await db.select()
                .from(roles)
                .where(eq(roles.id, roleId))
                .limit(1);

            if (roleExists.length === 0) {
                return sendResponse(400, null, "Invalid role ID")
            }
        }

        const updateData: any = {
            updatedAt: new Date(),
            sessionVersion: sql`${users.sessionVersion} + 1`
        };

        if (userType !== undefined) updateData.userType = userType;
        if (roleId !== undefined) updateData.role = roleId;

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId));

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
        const errorMessage = error instanceof Error ? error.message : "Failed to update user";
        return sendResponse(500, null, errorMessage)
    }
}
