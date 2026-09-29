import { ButtonLink, Eyebrow } from "@/components/ui";

export default function NotFound() {
  return (
    <main id="main" className="shell" style={{ paddingBlock: "120px", display: "grid", gap: 20, justifyItems: "start" }}>
      <Eyebrow>Page not found</Eyebrow>
      <h1 style={{ fontSize: 40, fontWeight: 500, letterSpacing: -1.5 }}>We couldn’t find that page.</h1>
      <p className="muted">The link may be out of date, or the stock symbol isn’t on the platform yet.</p>
      <ButtonLink href="/dashboard">Go to the platform</ButtonLink>
    </main>
  );
}
