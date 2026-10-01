"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ButtonLink } from "@/components/ui";
import { cn } from "@/lib/utils";
import { heroSlides as slides } from "../content";
import styles from "./trading-hero.module.css";
import { Icon } from "@/components/ui";

const HERO_VIDEO = "/videos/bg1.webm";
const HERO_POSTER = "/images/trading-floor.png";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function useReducedMotion() {
  return useSyncExternalStore(
    listener => {
      const media = window.matchMedia(reducedMotionQuery);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    },
    () => window.matchMedia(reducedMotionQuery).matches,
    () => true,
  );
}

export function TradingHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (paused || hovered || focused || reducedMotion) return;
    const timer = window.setInterval(() => setActive(value => (value + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, reducedMotion]);

  // The background video follows the pause button; it keeps playing on hover and focus.
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.muted = true;
    if (paused) {
      element.pause();
      return;
    }
    // Autoplay can be refused before the page is ready or while it is hidden, so retry
    // once the video can play and whenever the page becomes visible. The poster covers failures.
    const tryPlay = () => { if (element.paused && document.visibilityState === "visible") element.play().catch(() => {}); };
    tryPlay();
    element.addEventListener("canplay", tryPlay);
    document.addEventListener("visibilitychange", tryPlay);
    return () => {
      element.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", tryPlay);
    };
  }, [paused, reducedMotion]);

  const go = (index: number) => setActive((index + slides.length) % slides.length);
  const slide = slides[active];

  return (
    <section
      className={styles.hero}
      aria-roledescription="carousel"
      aria-label="Explore investment markets"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={event => {
        if (event.key === "ArrowRight") go(active + 1);
        if (event.key === "ArrowLeft") go(active - 1);
      }}
    >
      <div className={styles.background} aria-hidden="true">
        {/* Still frame for reduced motion and while the video loads. */}
        <Image src={HERO_POSTER} alt="" fill sizes="100vw" preload className={styles.photo} />
        {!reducedMotion && (
          <video ref={video} className={styles.video} autoPlay muted loop playsInline preload="auto" poster={HERO_POSTER}>
            <source src={HERO_VIDEO} type="video/webm" />
          </video>
        )}
        <div className={styles.shade} />
      </div>
      <div className={cn("shell", styles.inner)}>
        <div className={styles.kicker}><span /> GLOBAL AMBITION. INDIVIDUAL PERSPECTIVE.</div>
        <div className={styles.copy} aria-live={paused || focused ? "polite" : "off"}>
          <h1>{slide.title}<br /><span>{slide.accent}</span></h1>
          <p>{slide.description}</p>
        </div>
        <div className={styles.actions}>
          <ButtonLink href="/dashboard">Open the platform</ButtonLink>
          <a className={styles.secondary} href="#products">Discover our products <span aria-hidden="true"><Icon name="arrow-right" /></span></a>
        </div>
        <div className={styles.caption}><span className={styles.captionLine} /> ONE PERSPECTIVE. A WORLD OF OPPORTUNITY.</div>
        <div className={styles.controls}>
          <div className={styles.selectors}>
            {slides.map((item, index) => (
              <button key={item.category} aria-label={`Show slide ${index + 1}: ${item.category.slice(5)}`} aria-pressed={active === index} onClick={() => go(index)}>
                <span>0{index + 1}</span><i />
              </button>
            ))}
          </div>
          <span className={styles.category}>{slide.category}</span>
          <div className={styles.arrows}>
            <button aria-label="Previous slide" onClick={() => go(active - 1)}><Icon name="arrow-left" /></button>
            <button aria-label={paused ? "Resume slideshow and video" : "Pause slideshow and video"} aria-pressed={paused} onClick={() => setPaused(!paused)}><Icon name={paused ? "play" : "pause"} /></button>
            <button aria-label="Next slide" onClick={() => go(active + 1)}><Icon name="arrow-right" /></button>
          </div>
        </div>
      </div>
      <div className={styles.demoLabel}>PLATFORM PREVIEW · SIMULATED MARKETS</div>
    </section>
  );
}
