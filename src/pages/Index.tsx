import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import InternationalSection from '@/components/InternationalSection';
import WhyDynamoSection from '@/components/WhyDynamoSection';
import PlansSection from '@/components/PlansSection';
import FeaturesSection from '@/components/FeaturesSection';
import CoverageSection from '@/components/CoverageSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <Navbar />
      <HeroSection />
      <InternationalSection />
      <WhyDynamoSection />
      <PlansSection />
      <FeaturesSection />
      <CoverageSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
