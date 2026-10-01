import { sql } from "drizzle-orm";
import { bigint, boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
export type Role = "user" | "admin";
export type AccountStatus = "active" | "suspended";
export type KycStatus = "pending" | "approved" | "rejected";
export type DocumentType = "passport" | "drivers_license" | "national_id";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<Role>().notNull().default("user"),
  status: text("status").$type<AccountStatus>().notNull().default("active"),
  profitCents: bigint("profit_cents", { mode: "number" }).notNull().default(0),
  portfolioSpentCents: bigint("portfolio_spent_cents", { mode: "number" }).notNull().default(0),
  portfolioVersion: integer("portfolio_version").notNull().default(0),
  portfolioJson: text("portfolio_json"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "date" }),
});

export const portfolioTransactions = pgTable("portfolio_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  command: text("command").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
}, table => [index("portfolio_transaction_user_idx").on(table.userId)]);

export const kycSubmissions = pgTable("kyc_submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").$type<KycStatus>().notNull().default("pending"),
  legalName: text("legal_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  nationality: text("nationality").notNull(),
  phone: text("phone").notNull(),
  addressLine: text("address_line").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  occupation: text("occupation").notNull(),
  sourceOfFunds: text("source_of_funds").notNull(),
  documentType: text("document_type").$type<DocumentType>().notNull(),
  /** Only the last four characters of the document number are kept. */
  documentLast4: text("document_last4").notNull(),
  documentFile: text("document_file").notNull(),
  selfieFile: text("selfie_file").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" }).notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" }),
  reviewedBy: text("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewNote: text("review_note"),
}, table => [index("kyc_user_idx").on(table.userId), index("kyc_status_idx").on(table.status)]);

export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetUserId: text("target_user_id").references(() => users.id, { onDelete: "cascade" }),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
}, table => [index("audit_created_idx").on(table.createdAt)]);

export type RiskLevel = "low" | "moderate" | "high";

/** Investment plan cards shown on the website. Managed by admins. */
export const investmentPlans = pgTable("investment_plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  /** Whole US dollars. */
  minInvestment: integer("min_investment").notNull(),
  /** Whole US dollars; null means no maximum. */
  maxInvestment: integer("max_investment"),
  duration: text("duration").notNull(),
  withdrawals: text("withdrawals").notNull(),
  riskLevel: text("risk_level").$type<RiskLevel>().notNull(),
  /** Estimated return display text for the plan card. */
  expectedReturn: text("expected_return").notNull(),
  fee: text("fee").notNull(),
  /** JSON array of feature strings. */
  features: jsonb("features").$type<string[]>().notNull(),
  featured: boolean("featured").notNull().default(false),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
}, table => [index("plans_order_idx").on(table.sortOrder)]);

export type User = typeof users.$inferSelect;
export const paymentMethods = pgTable("payment_methods", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  network: text("network").notNull(),
  address: text("address").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;

/** Immutable payment details and receipt for an admin-reviewed demo plan purchase. */
export const planPayments = pgTable("plan_payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id").references(() => investmentPlans.id, { onDelete: "set null" }),
  planName: text("plan_name").notNull(),
  amount: integer("amount").notNull(), // Whole virtual USD, validated against the selected plan.
  methodName: text("method_name").notNull(),
  network: text("network").notNull(),
  address: text("address").notNull(),
  /** Cloudinary storage key for the receipt image (see lib/cloudinary.ts). */
  screenshotKey: text("screenshot_key").notNull(),
  screenshotType: text("screenshot_type").notNull(),
  status: text("status").$type<"pending" | "approved" | "rejected">().notNull().default("pending"),
  submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" }).notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" }),
  reviewedBy: text("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewNote: text("review_note"),
}, table => [
  index("plan_payments_user_idx").on(table.userId),
  index("plan_payments_status_idx").on(table.status),
  uniqueIndex("plan_payments_pending_idx").on(table.userId, table.planId).where(sql`${table.status} = 'pending'`),
]);
export type InvestmentPlan = typeof investmentPlans.$inferSelect;
export const withdrawals = pgTable("withdrawals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  beneficiaryName: text("beneficiary_name").notNull(),
  accountNumber: text("account_number").notNull(),
  routingNumber: text("routing_number").notNull(),
  recipientAddress: text("recipient_address").notNull(),
  bankAddress: text("bank_address").notNull(),
  bankName: text("bank_name").notNull(),
  status: text("status").$type<"pending" | "sent" | "rejected">().notNull().default("pending"),
  submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" }).notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" }),
  reviewedBy: text("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewNote: text("review_note"),
}, table => [index("withdrawals_user_idx").on(table.userId), index("withdrawals_status_idx").on(table.status)]);

export type KycSubmission = typeof kycSubmissions.$inferSelect;
export type AuditEntry = typeof auditLog.$inferSelect;
