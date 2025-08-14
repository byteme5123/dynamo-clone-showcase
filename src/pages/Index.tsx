import NotificationBar from '@/components/NotificationBar';
import Navbar from '@/components/Navbar';
import FigmaHeroSection from '@/components/FigmaHeroSection';
import FigmaFeaturesSection from '@/components/FigmaFeaturesSection';
import FigmaPlansSection from '@/components/FigmaPlansSection';
import FigmaCoverageSection from '@/components/FigmaCoverageSection';
import FigmaCTASection from '@/components/FigmaCTASection';
import FigmaFooter from '@/components/FigmaFooter';
import MobileBottomBar from '@/components/MobileBottomBar';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <NotificationBar />
      <Navbar />
      <FigmaHeroSection />
      <FigmaFeaturesSection />
      <FigmaPlansSection />
      <FigmaCoverageSection />
      <FigmaCTASection />
      <FigmaFooter />
      <MobileBottomBar />
      {/* Add bottom padding to prevent content from being hidden behind mobile bottom bar */}
      <div className="h-16 md:h-0" />
    </div>
  );
};

export default Index;
