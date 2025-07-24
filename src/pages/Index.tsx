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
import MobileBottomBar from '@/components/MobileBottomBar';

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
      <MobileBottomBar />
      {/* Add bottom padding to prevent content from being hidden behind mobile bottom bar */}
      <div className="h-16 md:h-0" />
    </div>
  );
};

export default Index;
