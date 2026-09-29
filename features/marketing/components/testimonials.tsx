import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";
import { ButtonLink, SectionHeading, Tag } from "@/components/ui";
import { cn } from "@/lib/utils";
import { testimonials, testimonialsArePreview, type Testimonial } from "../content";
import styles from "./testimonials.module.css";

// Illustrated avatars (DiceBear "Notionists", CC0) stand in until customers provide consented photos.
const avatar = (seed: string) => createAvatar(notionists, { seed, backgroundColor: ["fdecef", "fff0f2", "f6f2f4"] }).toDataUri();
const mosaicSeeds = ["Nora", "Kofi", "Mei", "Luca", "Zara", "Omar", "Ines", "Theo"];

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => <span key={n} className={n > rating ? styles.off : undefined} aria-hidden="true">★</span>)}
    </span>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className={styles.card}>
      <div className={styles.top}>
        <Stars rating={item.rating} />
        <span className={styles.product}>{item.product}</span>
      </div>
      <blockquote>{item.quote}</blockquote>
      <figcaption className={styles.person}>
        {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URI, nothing to optimise */}
        <img src={item.photo ?? avatar(item.name)} alt="" width={44} height={44} />
        <div><b>{item.name}</b><small>{item.location} · {item.product} investor</small></div>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <section className={cn("shell", styles.section)} id="testimonials" aria-labelledby="testimonials-heading">
      <SectionHeading
        id="testimonials-heading"
        eyebrow="What investors say"
        title={<>One account.<br /><span className="accent-text">Many ways to grow.</span></>}
        aside={testimonialsArePreview ? <Tag>Preview · sample reviews</Tag> : "Reviews from investors using the platform."}
      />
      <div className={styles.layout}>
        <div className={styles.intro}>
          <div className={styles.mosaic} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {mosaicSeeds.map(seed => <img key={seed} src={avatar(seed)} alt="" />)}
          </div>
          <div>
            <h3>Real people.<br />Real goals.</h3>
            <p>From a first $25 stock purchase to weekly Bitcoin buys and a Tesla reservation, investors use one account for all of it.</p>
          </div>
          <ButtonLink href="/dashboard" variant="outline" className={styles.cta}>Start investing</ButtonLink>
        </div>
        <div className={styles.grid}>
          {testimonials.map(item => <TestimonialCard key={item.name} item={item} />)}
        </div>
      </div>
      {testimonialsArePreview && <p className={styles.note}>Illustrative reviews for the platform preview. Avatars are illustrations, not customer photos.</p>}
    </section>
  );
}
