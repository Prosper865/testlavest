import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { innovationCompanies } from "@/features/marketing/components/innovation-companies";
import styles from "@/features/marketing/components/innovation-companies.module.css";

export function generateStaticParams() {
  return innovationCompanies.map(company => ({ slug: company.id }));
}

export async function generateMetadata({ params }: PageProps<"/companies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const company = innovationCompanies.find(item => item.id === slug);
  return { title: company ? `${company.name} | Teslavest` : "Company profile" };
}

export default async function CompanyDetailPage({ params }: PageProps<"/companies/[slug]">) {
  const { slug } = await params;
  const company = innovationCompanies.find(item => item.id === slug);
  if (!company) notFound();

  return (
    <>
      <SiteHeader />
      <main className={styles.detailPage}>
        <div className="shell">
          <Link href="/" className={styles.backLink}>← Back to homepage</Link>
          <article className={styles.detailCard}>
            <div className={`${styles.logo} ${styles[company.id]}`} aria-hidden="true">
              {company.id === "spacex" ? <Image src="/logos/companies/spacex-wordmark.svg" alt="" width={400} height={65} className={styles.wordmark} /> : <>
                <Image src={`/logos/companies/${company.id}.${company.id === "neuralink" ? "png" : "svg"}`} alt="" width={96} height={96} />
                <span>{company.name}</span>
              </>}
            </div>

            <div className={styles.detailHeader}>
              <div>
                <p className={styles.eyebrow}>Company profile</p>
                <h1>{company.name}</h1>
              </div>
              <span className={styles.tag}>{company.headline}</span>
            </div>

            <p className={styles.lead}>{company.description}</p>

            <div className={styles.detailGrid}>
              {company.sections.map(section => <section key={section.title} className={styles.detailSection}>
                <h2>{section.title}</h2>
                <p>{section.copy}</p>
              </section>)}
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
