import db from "@/server/db";
import { users, roles } from "@/server/db/schema"; 
import { uploadImage } from "@/utils/cloudinary";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async(req: NextRequest) => {
    void req;
    try {

        const userId = await getUserIdFromSession();
        if (!userId) {
            return sendResponse(400, null , "Unauthorized")
        }
        const userInfo = await db
            .select({
                id: users.id,
                fullName: users.fullName,
                phoneNumber: users.phoneNumber,
                profilePicUrl: users.profilePicUrl,
                bio: users.bio,
                anonymousName: users.anonymousName,
                isAnonymous: users.isAnonymous,
                userType: users.userType,
                role: roles.name,
                createdAt: users.createdAt,
            })
            .from(users)
            .leftJoin(roles, eq(users.role, roles.id)) 
            .where(eq(users.id, userId))
            .limit(1);

        return sendResponse(
            200, userInfo , "Profile fetched successfully");

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Verification failed. Please try again.";
        return sendResponse(500, errorMessage, "Unexpected error occured")
    }
}



export const PATCH = async (req: NextRequest) => {
    try {
      // 1. Check authentication
      const userId = await getUserIdFromSession();
      if (!userId) {
        return sendResponse(401, null, "Unauthorized: Please login");
      }
  
      // 2. Parse request body
      const body = await req.json();
      const { profilePicUrl, bio, anonymousName } = body;
  
      // 3. Validate at least one field is provided
      if (
        profilePicUrl === undefined &&
        bio === undefined &&
        anonymousName === undefined
      ) {
        return sendResponse(
          400,
          null,
          "At least one field (profilePicUrl, bio, or anonymousName) is required"
        );
      }
  
      // 4. Handle profile picture upload to Cloudinary if provided
      let uploadedImageUrl: string | null = null;
      if (profilePicUrl !== undefined && profilePicUrl !== null && profilePicUrl.trim() !== "") {
        if (typeof profilePicUrl !== "string") {
          return sendResponse(400, null, "Profile picture URL must be a string");
        }
  
        // Validate URL format
        try {
          new URL(profilePicUrl);
        } catch {
          return sendResponse(400, null, "Invalid profile picture URL format");
        }
  
        // Upload to Cloudinary
        const uploadResult = await uploadImage(profilePicUrl);
        
        // Check if upload failed
        if (!uploadResult.startsWith("https://")) {
          return sendResponse(400, null, `Failed to upload image: ${uploadResult}`);
        }
        
        uploadedImageUrl = uploadResult;
      }
  
      // 5. Validate anonymousName length if provided
      if (anonymousName !== undefined && anonymousName !== null) {
        if (typeof anonymousName !== "string") {
          return sendResponse(400, null, "Anonymous name must be a string");
        }
        if (anonymousName.length > 50) {
          return sendResponse(
            400,
            null,
            "Anonymous name must be 50 characters or less"
          );
        }
        if (anonymousName.trim().length === 0) {
          return sendResponse(400, null, "Anonymous name cannot be empty");
        }
      }
  
      // 6. Validate bio length if provided
      if (bio !== undefined && bio !== null) {
        if (typeof bio !== "string") {
          return sendResponse(400, null, "Bio must be a string");
        }
        if (bio.length > 500) {
          return sendResponse(400, null, "Bio must be 500 characters or less");
        }
      }
  
      // 7. Check if user exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
  
      if (existingUser.length === 0) {
        return sendResponse(404, null, "User not found");
      }
  
      // 8. Prepare update data
      const updateData: any = {
        updatedAt: new Date(),
      };
  
      if (uploadedImageUrl) updateData.profilePicUrl = uploadedImageUrl;
      if (bio !== undefined) updateData.bio = bio;
      if (anonymousName !== undefined) updateData.anonymousName = anonymousName;
  
      // 9. Update user profile
      await db.update(users).set(updateData).where(eq(users.id, userId));
  
      // 10. Fetch updated user data
      const updatedUser = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          phoneNumber: users.phoneNumber,
          profilePicUrl: users.profilePicUrl,
          bio: users.bio,
          anonymousName: users.anonymousName,
          isAnonymous: users.isAnonymous,
          userType: users.userType,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
  
      return sendResponse(
        200,
        updatedUser[0],
        "Profile updated successfully"
      );
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      return sendResponse(500, null, errorMessage);
    }
  };