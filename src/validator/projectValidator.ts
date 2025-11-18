import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  goalAmount: z.number().min(1, "Goal amount must be at least 1"),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  isActive: z.boolean().default(true),
  // Use coerce to automatically convert string to Date
  startDate: z.coerce.date().refine(
    (date) => !isNaN(date.getTime()),
    { message: "Invalid start date format" }
  ),
  endDate: z.coerce.date().refine(
    (date) => !isNaN(date.getTime()),
    { message: "Invalid end date format" }
  ),
  }).refine(
  (data) => {
    return data.endDate > data.startDate;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);