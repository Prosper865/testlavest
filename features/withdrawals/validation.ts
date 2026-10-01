import { z } from "zod";

// Parse decimal strings into integer cents, preserving the user's exact amount.
export const withdrawalAmount = z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter an amount with no more than two decimal places.")
  .transform(value => {
    const [dollars, cents = ""] = value.split(".");
    return Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
  }).pipe(z.number().int().min(1, "Enter at least $0.01.").max(10_000_000_000, "The maximum amount is $100,000,000."));

const required = (label: string, max: number) => z.string().trim().min(1, `Enter the ${label}.`).max(max, `Keep the ${label} under ${max} characters.`);
export const withdrawalSchema = z.object({
  id: z.uuid(),
  amount: withdrawalAmount,
  beneficiaryName: required("beneficiary name", 120),
  accountNumber: z.string().trim().regex(/^\d{4,34}$/, "Enter an account number with 4–34 digits."),
  routingNumber: z.string().trim().regex(/^\d{9}$/, "Enter a 9-digit routing number."),
  recipientAddress: required("recipient address", 500),
  bankAddress: required("bank address", 500),
  bankName: required("bank name", 120),
});
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
