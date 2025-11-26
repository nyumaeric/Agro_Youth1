// app/api/auth/check-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import db from "@/server/db";
import { users, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { options } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user?.id) {
      return NextResponse.json({ needsRefresh: false });
    }

    const currentUser = await db
      .select({
        sessionVersion: users.sessionVersion,
        roleName: roles.name,
        userType: users.userType,
      })
      .from(users)
      .innerJoin(roles, eq(users.role, roles.id))
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ needsRefresh: false });
    }

    const dbUser = currentUser[0];

    // Check if data has changed
    const hasChanged = 
      dbUser.roleName !== session.user.role ||
      dbUser.userType !== session.user.userType;

    return NextResponse.json({ 
      needsRefresh: hasChanged,
      changes: hasChanged ? {
        role: dbUser.roleName,
        userType: dbUser.userType
      } : null
    });
    
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ needsRefresh: false }, { status: 500 });
  }
}