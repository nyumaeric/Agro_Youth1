import db from "@/server/db";
import { products, users } from "@/server/db/schema";
import { sendResponse } from "@/utils/response";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
      const allProducts = await db.select(
        {
          cropName: products.cropName,
          quantity: products.quantity,
          unit: products.unit,
          price: products.price,
          description: products.description,
          isAvailable: products.isAvailable,
          name: users.fullName,
          phoneNumber: users.phoneNumber
        }
      ).from(products).leftJoin(users, eq(products.userId, users.id));

      return sendResponse(200, allProducts, "Products retrieved successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      return sendResponse(500, null, errorMessage);
    }
}