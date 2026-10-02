import Image from "next/image";
import styles from "./innovation-companies.module.css";

const companies = [
  {
    id: "spacex", name: "SpaceX",
    description: "SpaceX is a space technology company founded by Elon Musk in 2002. With a vision to reduce space launch costs and eventually establish a human presence on Mars, SpaceX develops rocket propulsion, reusable launch vehicles, human spaceflight, and satellite constellation technology.",
  },
  {
    id: "neuralink", name: "Neuralink",
    description: "Neuralink is a neurotechnology company founded in 2016, developing implantable brain-computer interfaces. Its work explores how people with paralysis can control devices with their thoughts, with the aim of helping restore communication and independence.",
  },
  {
    id: "openai", name: "OpenAI",
    description: "OpenAI is an artificial intelligence research and technology company founded in 2015. Its work focuses on developing AI systems and tools, with the mission of ensuring that artificial general intelligence benefits all of humanity.",
  },
] as const;

export function InnovationCompanies() {
  return <section id="innovation" className={styles.section} aria-label="Companies shaping the future">
    <div className={`shell ${styles.grid}`}>
      {companies.map(company => <article key={company.id} className={styles.card}>
        <div className={`${styles.logo} ${styles[company.id]}`} aria-hidden="true">
          {company.id === "spacex" ? <Image src="/logos/companies/spacex-wordmark.svg" alt="" width={400} height={65} className={styles.wordmark} /> : <>
            <Image src={`/logos/companies/${company.id}.${company.id === "neuralink" ? "png" : "svg"}`} alt="" width={96} height={96} />
            <span>{company.name}</span>
          </>}
        </div>
        <h2>{company.name}</h2>
        <p>{company.description}</p>
      </article>)}
    </div>
  </section>;
}
