import type { Metadata } from "next";
import { AuthShell, LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <AuthShell>
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </AuthShell>
  );
}
