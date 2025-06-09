import { CompaniesSection } from "@/components/layouts/home/companies-section"
import { HeroSection } from "@/components/layouts/home/hero-section"
import IntegrationsSection from "@/components/layouts/home/integrations-section"

export default function Home() {
  return (
    <>
      <HeroSection />
      <CompaniesSection />
      <IntegrationsSection />
    </>
  )
}
