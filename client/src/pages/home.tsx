import HeroSection from "@/components/home/hero-section";
import TemplateGallery from "@/components/home/template-gallery";
import FeaturesSection from "@/components/home/features-section";
import PricingSection from "@/components/home/pricing-section";
import DashboardPreview from "@/components/home/dashboard-preview";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <TemplateGallery />
      <FeaturesSection />
      <PricingSection />
      <DashboardPreview />
    </div>
  );
}
