// import type { NextAuthOptions } from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import db from "./server/db";
// import { eq } from "drizzle-orm";
// import { users, roles } from "@/server/db/schema";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       fullName: string;
//       role: string;
//       phoneNumber: string;
//       userType?: string;
//     },
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id?: string;
//     phoneNumber?: string;
//     fullName?: string;
//     sub?: string;
//     role?: string;
//     userType?: string;
//   }
// }

// export const options: NextAuthOptions = {
//   providers: [
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         phoneNumber: { label: "phoneNumber", type: "text" },
//         password: { label: "password", type: "password" },
//       },
//       async authorize(credentials): Promise<any> {
//         try {
//           if (!credentials?.phoneNumber || !credentials.password) {
//             throw new Error("Missing credentials");
//           }
          
//           const existingUser = await db
//             .select({
//               id: users.id,
//               phoneNumber: users.phoneNumber,
//               fullName: users.fullName,
//               password: users.password,
//               roleName: roles.name,
//               userType: users.userType,
//             })
//             .from(users)
//             .innerJoin(roles, eq(users.role, roles.id)) 
//             .where(eq(users.phoneNumber, credentials.phoneNumber))
//             .limit(1)
          
//           if (existingUser.length === 0) {
//             throw new Error("No user found");
//           }

//           const user = existingUser[0];

//           const isPasswordValid = await bcrypt.compare(
//             credentials.password,
//             user.password ?? ""
//           );

//           if (!isPasswordValid) {
//             throw new Error("Invalid password");
//           }
          
//           return {
//             id: user.id,
//             phoneNumber: user.phoneNumber,
//             fullName: user.fullName,
//             role: user.roleName,
//             userType: user.userType, 
//           };
          
//         } catch (error) {
//           console.error("Auth error:", error);
//           return null;
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async signIn({ user, account }) {
//       if (!user || !account) {
//         return false;
//       }

//       if (account.provider === "credentials" && !('phoneNumber' in user)) {
//         return false;
//       }

//       return true;
//     },
    
//     async jwt({ token, user }) {
//       // When user signs in, add user data to token
//       if (user) {
//         token.id = user.id;
//         // Narrow type so TS knows about custom properties
//         const customUser = user as typeof user & {
//           phoneNumber?: string;
//           fullName?: string;
//           role?: string;
//           userType?: string;
//         };
//         token.phoneNumber = customUser.phoneNumber;
//         token.fullName = customUser.fullName;
//         token.role = customUser.role;
//         token.userType = customUser.userType;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       // Pass token data to session
//       if (token && session.user) {
//         session.user.id = token.id as string;
//         session.user.phoneNumber = token.phoneNumber as string;
//         session.user.fullName = token.fullName as string;
//         session.user.role = token.role as string;
//         session.user.userType = token.userType as string;
//       }
//       return session;
//     },
//   },
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, 
//   },
//   secret: process.env.NEXTAUTH_SECRET as string, // Changed from JWT_SECRET
//   pages: {
//     signIn: '/login',
//     error: '/login',
//   }
// };

import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "./server/db";
import { eq } from "drizzle-orm";
import { users, roles } from "@/server/db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      fullName: string;
      role: string;
      phoneNumber: string;
      userType?: string;
    },
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    phoneNumber?: string;
    fullName?: string;
    sub?: string;
    role?: string;
    userType?: string;
    sessionVersion?: number;
  }
}

export const options: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        phoneNumber: { label: "phoneNumber", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        try {
          if (!credentials?.phoneNumber || !credentials.password) {
            throw new Error("Missing credentials");
          }
          
          const existingUser = await db
            .select({
              id: users.id,
              phoneNumber: users.phoneNumber,
              fullName: users.fullName,
              password: users.password,
              roleName: roles.name,
              userType: users.userType,
              sessionVersion: users.sessionVersion,
            })
            .from(users)
            .innerJoin(roles, eq(users.role, roles.id)) 
            .where(eq(users.phoneNumber, credentials.phoneNumber))
            .limit(1)
          
          if (existingUser.length === 0) {
            throw new Error("No user found");
          }

          const user = existingUser[0];

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password ?? ""
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }
          
          return {
            id: user.id,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            role: user.roleName,
            userType: user.userType,
            sessionVersion: user.sessionVersion,
          };
          
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user || !account) {
        return false;
      }

      if (account.provider === "credentials" && !('phoneNumber' in user)) {
        return false;
      }

      return true;
    },
    
    async jwt({ token, user, trigger }) {
      // When user signs in, add user data to token
      if (user) {
        token.id = user.id;
        const customUser = user as typeof user & {
          phoneNumber?: string;
          fullName?: string;
          role?: string;
          userType?: string;
          sessionVersion?: number;
        };
        token.phoneNumber = customUser.phoneNumber;
        token.fullName = customUser.fullName;
        token.role = customUser.role;
        token.userType = customUser.userType;
        token.sessionVersion = customUser.sessionVersion;
      }

      // Refresh token data from database when update is triggered
      if (trigger === "update" && token.id) {
        try {
          const freshUserData = await db
            .select({
              id: users.id,
              phoneNumber: users.phoneNumber,
              fullName: users.fullName,
              roleName: roles.name,
              userType: users.userType,
              sessionVersion: users.sessionVersion,
            })
            .from(users)
            .innerJoin(roles, eq(users.role, roles.id))
            .where(eq(users.id, token.id))
            .limit(1);

          if (freshUserData.length > 0) {
            const userData = freshUserData[0];
            token.phoneNumber = userData.phoneNumber;
            token.fullName = userData.fullName;
            token.role = userData.roleName;
            token.userType = userData.userType;
            token.sessionVersion = userData.sessionVersion;
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.phoneNumber = token.phoneNumber as string;
        session.user.fullName = token.fullName as string;
        session.user.role = token.role as string;
        session.user.userType = token.userType as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET as string,
  pages: {
    signIn: '/login',
    error: '/login',
  }
};

