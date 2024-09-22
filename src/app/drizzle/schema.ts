import { relations } from "drizzle-orm";
import { date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const doctors = pgTable("doctors", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth", { mode: "date" }).notNull(),
  sex: text("sex").notNull(),
  allergies: text("allergies").notNull(),
  phoneNumber: text("phone_number").notNull(),
  emergencyContact: text("emergency_contact").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  familyIllnessHistory: text("family_illness_history").notNull(),
  familySymptomsHistory: text("family_symptoms_history").notNull(),
});

export const records = pgTable("records", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .references(() => patients.id)
    .notNull(),
  eventName: text("event_name").notNull(),
  healthFacility: text("health_facility").notNull(),
  symptoms: text("symptoms").notNull(),
  initialSymptomTime: date("initial_symptom_time", { mode: "date" }).notNull(),
  symptomSeverityDegree: text("symptom_severity_degree").notNull(),
  pastYearMajorIllness: text("past_year_major_illness").notNull(),
  takenMedications: text("taken_medications").notNull(),
  militaryServiceStatus: text("military_service_status").notNull(),
  sexualActivity: text("sexual_activity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  alcoholUsage: text("alcohol_usage").notNull(),
  smokeUsage: text("smoke_usage").notNull(),
});

export const medications = pgTable("medications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recordId: uuid("record_id")
    .references(() => records.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const patientsRelations = relations(patients, ({ many }) => ({
  records: many(records),
}));

export const recordsRelations = relations(records, ({ one, many }) => ({
  medications: many(medications),
  patient: one(patients, {
    fields: [records.patientId],
    references: [patients.id],
  }),
}));

export const medicationsRelations = relations(medications, ({ one }) => ({
  record: one(records, {
    fields: [medications.recordId],
    references: [records.id],
  }),
}));
