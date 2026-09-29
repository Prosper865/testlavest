import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  AccountPlans,
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
        <AccountPlans />
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
