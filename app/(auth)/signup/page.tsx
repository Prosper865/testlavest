import type { Metadata } from "next";
import { AuthShell, SignupForm } from "@/features/auth";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  return (
    <AuthShell>
      <SignupForm next={typeof next === "string" ? next : undefined} />
    </AuthShell>
  );
}
