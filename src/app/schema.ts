// Reference for the phone number fields:
// https://github.com/colinhacks/zod/issues/3378#issuecomment-2067591844

import { patients } from "@/app/drizzle/schema";
import { createInsertSchema } from "drizzle-zod";
import parsePhoneNumber from "libphonenumber-js";
import { z } from "zod";

export const createPatientSchema = createInsertSchema(patients).extend({
  email: z.string().email(),
  phoneNumber: z.string().transform((value, ctx) => {
    const phoneNumber = parsePhoneNumber(value, {
      defaultCountry: "US",
    });

    if (!phoneNumber?.isValid()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid phone number",
      });
      return z.NEVER;
    }

    return phoneNumber.formatInternational();
  }),
  emergencyContact: z.string().transform((value, ctx) => {
    const phoneNumber = parsePhoneNumber(value, {
      defaultCountry: "US",
    });

    if (!phoneNumber?.isValid()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid phone number",
      });
      return z.NEVER;
    }

    return phoneNumber.formatInternational();
  }),
});
