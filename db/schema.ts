import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  headline: text("headline").notNull().default(""),
  biography: text("biography").notNull().default(""),
  galleryVisibility: text("gallery_visibility").notNull().default("public"),
  theme: text("theme").notNull().default("system"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const certificates = sqliteTable("certificates", {
  id: text("id").primaryKey(),
  userEmail: text("user_email").notNull(),
  title: text("title").notNull(),
  issuingOrganization: text("issuing_organization").notNull(),
  certificateType: text("certificate_type").notNull().default("Certificate"),
  issueDate: text("issue_date").notNull(),
  expirationDate: text("expiration_date"),
  credentialId: text("credential_id"),
  verificationUrl: text("verification_url"),
  verificationStatus: text("verification_status").notNull().default("link_available"),
  category: text("category").notNull().default("Professional"),
  collection: text("collection"),
  skills: text("skills").notNull().default("[]"),
  description: text("description").notNull().default(""),
  privateNotes: text("private_notes").notNull().default(""),
  fileKey: text("file_key"),
  fileName: text("file_name"),
  fileType: text("file_type").notNull().default("image"),
  orientation: text("orientation").notNull().default("landscape"),
  rotation: integer("rotation").notNull().default(0),
  visibility: text("visibility").notNull().default("private"),
  allowDownload: integer("allow_download", { mode: "boolean" }).notNull().default(true),
  showCredentialId: integer("show_credential_id", { mode: "boolean" }).notNull().default(true),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  isDraft: integer("is_draft", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const collections = sqliteTable("collections", {
  id: text("id").primaryKey(),
  userEmail: text("user_email").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull().default(""),
  visibility: text("visibility").notNull().default("private"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reminders = sqliteTable("reminders", {
  id: text("id").primaryKey(),
  userEmail: text("user_email").notNull(),
  certificateId: text("certificate_id").notNull(),
  reminderDate: text("reminder_date").notNull(),
  reminderType: text("reminder_type").notNull().default("30_days"),
  isSent: integer("is_sent", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
