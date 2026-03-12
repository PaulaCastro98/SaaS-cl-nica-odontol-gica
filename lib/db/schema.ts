import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  decimal,
  date,
  time,
  pgEnum,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Enums
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "agendado",
  "confirmado",
  "em_atendimento",
  "concluido",
  "faltou",
  "cancelado",
])

export const paymentMethodEnum = pgEnum("payment_method", [
  "dinheiro",
  "cartao_credito",
  "cartao_debito",
  "pix",
  "convenio",
])

// Tables
export const clinics = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  cnpjCpf: text("cnpj_cpf"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  logoUrl: text("logo_url"),
  description: text("description"),
  businessHours: text("business_hours"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cpf: text("cpf"),
  phone: text("phone"),
  email: text("email"),
  birthdate: date("birthdate"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const dentists = pgTable("dentists", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cro: text("cro"),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").references(() => services.id, {
    onDelete: "set null",
  }),
  dentistId: uuid("dentist_id").references(() => dentists.id, {
    onDelete: "set null",
  }),
  appointmentDate: date("appointment_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time"),
  status: appointmentStatusEnum("status").default("agendado").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const sales = pgTable("sales", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id").references(() => patients.id, {
    onDelete: "set null",
  }),
  dentistId: uuid("dentist_id").references(() => dentists.id, {
    onDelete: "set null",
  }),
  appointmentId: uuid("appointment_id").references(() => appointments.id, {
    onDelete: "set null",
  }),
  serviceId: uuid("service_id").references(() => services.id, {
    onDelete: "set null",
  }),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  saleDate: date("sale_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const appointmentRequests = pgTable("appointment_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  serviceId: uuid("service_id").references(() => services.id, {
    onDelete: "set null",
  }),
  message: text("message"),
  status: text("status").default("pendente").notNull(), // pendente, contactado, agendado
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const socialLinks = pgTable("social_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" })
    .unique(),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  linkedinUrl: text("linkedin_url"),
  youtubeUrl: text("youtube_url"),
  tiktokUrl: text("tiktok_url"),
  websiteUrl: text("website_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Relations
export const clinicsRelations = relations(clinics, ({ many, one }) => ({
  users: many(users),
  patients: many(patients),
  services: many(services),
  dentists: many(dentists),
  appointments: many(appointments),
  sales: many(sales),
  appointmentRequests: many(appointmentRequests),
  socialLinks: one(socialLinks),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  clinic: one(clinics, {
    fields: [users.clinicId],
    references: [clinics.id],
  }),
  sessions: many(sessions),
}))

export const patientsRelations = relations(patients, ({ one, many }) => ({
  clinic: one(clinics, {
    fields: [patients.clinicId],
    references: [clinics.id],
  }),
  appointments: many(appointments),
  sales: many(sales),
}))

export const servicesRelations = relations(services, ({ one, many }) => ({
  clinic: one(clinics, {
    fields: [services.clinicId],
    references: [clinics.id],
  }),
  appointments: many(appointments),
  sales: many(sales),
  appointmentRequests: many(appointmentRequests),
}))

export const dentistsRelations = relations(dentists, ({ one, many }) => ({
  clinic: one(clinics, {
    fields: [dentists.clinicId],
    references: [clinics.id],
  }),
  appointments: many(appointments),
  sales: many(sales),
}))

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  clinic: one(clinics, {
    fields: [appointments.clinicId],
    references: [clinics.id],
  }),
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  dentist: one(dentists, {
    fields: [appointments.dentistId],
    references: [dentists.id],
  }),
}))

export const salesRelations = relations(sales, ({ one }) => ({
  clinic: one(clinics, {
    fields: [sales.clinicId],
    references: [clinics.id],
  }),
  patient: one(patients, {
    fields: [sales.patientId],
    references: [patients.id],
  }),
  dentist: one(dentists, {
    fields: [sales.dentistId],
    references: [dentists.id],
  }),
  appointment: one(appointments, {
    fields: [sales.appointmentId],
    references: [appointments.id],
  }),
  service: one(services, {
    fields: [sales.serviceId],
    references: [services.id],
  }),
}))

export const appointmentRequestsRelations = relations(
  appointmentRequests,
  ({ one }) => ({
    clinic: one(clinics, {
      fields: [appointmentRequests.clinicId],
      references: [clinics.id],
    }),
    service: one(services, {
      fields: [appointmentRequests.serviceId],
      references: [services.id],
    }),
  })
)

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  clinic: one(clinics, {
    fields: [socialLinks.clinicId],
    references: [clinics.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

// Types
export type Clinic = typeof clinics.$inferSelect
export type NewClinic = typeof clinics.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Patient = typeof patients.$inferSelect
export type NewPatient = typeof patients.$inferInsert
export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert
export type Dentist = typeof dentists.$inferSelect
export type NewDentist = typeof dentists.$inferInsert
export type Appointment = typeof appointments.$inferSelect
export type NewAppointment = typeof appointments.$inferInsert
export type Sale = typeof sales.$inferSelect
export type NewSale = typeof sales.$inferInsert
export type AppointmentRequest = typeof appointmentRequests.$inferSelect
export type NewAppointmentRequest = typeof appointmentRequests.$inferInsert
export type SocialLink = typeof socialLinks.$inferSelect
export type NewSocialLink = typeof socialLinks.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
