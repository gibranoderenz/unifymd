import { patients } from "@/app/drizzle/schema";
import { createInsertSchema } from "drizzle-zod";

export const createPatientSchema = createInsertSchema(patients);
