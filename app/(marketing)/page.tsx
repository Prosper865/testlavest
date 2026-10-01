import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  ApproachSection,
  CompanyBelt,
  CtaSection,
  FaqSection,
  GlobalMarkets,
  MarketSnapshot,
  ProductModules,
  ProfessionalSection,
  StrategiesSection,
  Testimonials,
  TradingHero,
  WhyUs,
} from "@/features/marketing";
import { NewsSection } from "@/features/news";
import { PlansSection } from "@/features/plans";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <TradingHero />
        <MarketSnapshot />
        <ProductModules />
        <WhyUs />
        <CompanyBelt />
        <GlobalMarkets />
        <PlansSection />
        <StrategiesSection />
        <NewsSection />
        <ProfessionalSection />
        <Testimonials />
        <ApproachSection />
        <FaqSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
