"use server";

import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../drizzle";
import { medications, patients, records } from "../drizzle/schema";
import { createRecordFormSchema } from "../patients/[patientId]/schema";
import { createPatientSchema } from "../schema";

export const deletePatient = async (patientId: string) => {
  try {
    await db.delete(patients).where(eq(patients.id, patientId));
    return { success: true };
  } catch (err) {
    return { error: err };
  }
};

export const getPatient = async (patientId: string) => {
  try {
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, patientId),
      with: {
        records: {
          columns: {
            id: true,
            createdAt: true,
          },
          orderBy: desc(records.createdAt),
        },
      },
    });
    if (!patient) {
      return { error: "Patient not found" };
    }
    return { success: true, patient: patient };
  } catch (err) {
    return { error: err };
  }
};

export const getPatientRecord = async (recordId: string) => {
  try {
    const record = await db.query.records.findFirst({
      where: eq(records.id, recordId),
      with: {
        medications: true,
      },
    });
    if (!record) {
      return { error: "Record not found" };
    }
    return { success: true, record };
  } catch (err) {
    return { error: err };
  }
};

export const createPatientRecord = async (
  values: z.infer<typeof createRecordFormSchema>
) => {
  try {
    const { medications: medicationsData, ...rest } = values;
    const record = await db
      .insert(records)
      .values(rest)
      .returning({ id: records.id });

    const finalMedications = medicationsData.map(({ name, description }) => {
      return { recordId: record[0].id, name, description };
    });

    await db.insert(medications).values(finalMedications);
    return { success: true };
  } catch (err) {
    return { error: err };
  }
};

export const createPatient = async (
  data: z.infer<typeof createPatientSchema>
) => {
  try {
    await db.insert(patients).values(data);
    return { success: true };
  } catch (err) {
    return { error: err };
  }
};

export const getPatients = async () => {
  try {
    const data = await db.query.patients.findMany({
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        updatedAt: true,
        dateOfBirth: true,
        sex: true,
      },
    });

    return { success: true, patients: data };
  } catch (err) {
    return { error: err };
  }
};
