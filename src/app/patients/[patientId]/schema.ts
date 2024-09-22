import { records } from "@/app/drizzle/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const createRecordFormSchema = createInsertSchema(records).extend({
  medications: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().min(1, { message: "Required" }),
    })
  ),
});
