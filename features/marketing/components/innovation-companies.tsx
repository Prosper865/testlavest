import Image from "next/image";
import Link from "next/link";
import styles from "./innovation-companies.module.css";

export const innovationCompanies = [
  {
    id: "spacex",
    name: "SpaceX",
    headline: "A mission to make space travel more accessible and sustainable.",
    description: "SpaceX is a space technology company founded by Elon Musk in 2002. With a vision to reduce space launch costs and eventually establish a human presence on Mars, SpaceX develops rocket propulsion, reusable launch vehicles, human spaceflight, and satellite constellation technology.",
    sections: [
      {
        title: "What they do",
        copy: "SpaceX designs and operates launch vehicles, spacecraft, and satellite infrastructure. Its work includes Falcon rockets, Starship development, and the Starlink network designed to expand global broadband access.",
      },
      {
        title: "Why it matters",
        copy: "The company has reshaped the commercial space industry by focusing on reusability, lower launch costs, and ambitious long-term exploration goals that push the frontier of human spaceflight.",
      },
      {
        title: "Why investors watch it",
        copy: "SpaceX sits at the intersection of aerospace, infrastructure, and national security. Its long-term growth path depends on launch scale, satellite adoption, and the viability of recurring space-based services.",
      },
    ],
  },
  {
    id: "neuralink",
    name: "Neuralink",
    headline: "Exploring how brain-computer interfaces can restore capability and choice.",
    description: "Neuralink is a neurotechnology company founded in 2016, developing implantable brain-computer interfaces. Its work explores how people with paralysis can control devices with their thoughts, with the aim of helping restore communication and independence.",
    sections: [
      {
        title: "What they do",
        copy: "Neuralink develops implantable neural interfaces that can read and interpret electrical activity in the brain. The company is focused on connecting the brain to computers in ways that can support control, communication, and rehabilitation.",
      },
      {
        title: "Why it matters",
        copy: "If successful, these systems could help people with paralysis or neurological injury regain independence through direct brain-to-device communication, opening new possibilities in healthcare and human augmentation.",
      },
      {
        title: "Why investors watch it",
        copy: "The category is still early and highly experimental, but the underlying opportunity is large. Neuralink sits at the edge of frontier biotech, with the added potential of a major market if it can prove both safety and clinical usefulness.",
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    headline: "Building advanced AI systems with a focus on safety, capability, and broad utility.",
    description: "OpenAI is an artificial intelligence research and technology company founded in 2015. Its work focuses on developing AI systems and tools, with the mission of ensuring that artificial general intelligence benefits all of humanity.",
    sections: [
      {
        title: "What they do",
        copy: "OpenAI develops foundation models, research tooling, and consumer and enterprise AI experiences that can understand language, generate content, and assist with complex reasoning and workflow automation.",
      },
      {
        title: "Why it matters",
        copy: "AI is becoming a core layer of software, productivity, and computation. OpenAI has a central role in shaping how individuals, businesses, and developers interact with this next wave of intelligent systems.",
      },
      {
        title: "Why investors watch it",
        copy: "The company represents one of the most consequential technology platforms of the decade. Its influence spans infrastructure, enterprise software, and consumer products, all tied to a fast-growing AI market.",
      },
    ],
  },
] as const;

export function InnovationCompanies() {
  return <section id="innovation" className={styles.section} aria-label="Companies shaping the future">
    <div className={`shell ${styles.grid}`}>
      {innovationCompanies.map(company => <Link key={company.id} href={`/companies/${company.id}`} className={styles.cardLink}>
        <article className={styles.card}>
          <div className={`${styles.logo} ${styles[company.id]}`} aria-hidden="true">
            {company.id === "spacex" ? <Image src="/logos/companies/spacex-wordmark.svg" alt="" width={400} height={65} className={styles.wordmark} /> : <>
              <Image src={`/logos/companies/${company.id}.${company.id === "neuralink" ? "png" : "svg"}`} alt="" width={96} height={96} />
              <span>{company.name}</span>
            </>}
          </div>
          <h2>{company.name}</h2>
          <p>{company.description}</p>
        </article>
      </Link>)}
    </div>
  </section>;
}
