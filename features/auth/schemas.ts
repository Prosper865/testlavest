import * as z from "zod";

export const SignupSchema = z.object({
  name: z.string().trim().min(2, { error: "Enter your full name." }).max(80, { error: "Name is too long." }),
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { error: "At least 8 characters." })
    .max(128, { error: "At most 128 characters." })
    .regex(/[a-zA-Z]/, { error: "At least one letter." })
    .regex(/[0-9]/, { error: "At least one number." })
    .regex(/[^a-zA-Z0-9]/, { error: "At least one symbol, e.g. ! or #." }),
  terms: z.literal("on", { error: "Please accept the terms to continue." }),
});

export const LoginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Enter your password." }),
});

export type AuthFormState = {
  errors?: Partial<Record<"name" | "email" | "password" | "terms", string[]>>;
  message?: string;
  values?: { name?: string; email?: string };
} | undefined;
