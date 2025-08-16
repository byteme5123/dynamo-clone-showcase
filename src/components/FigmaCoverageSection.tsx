import { Button } from '@/components/ui/button';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';
import { Link } from 'react-router-dom';

const FigmaCoverageSection = () => {
  const settings = useHomepageSettings();
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-black">
              {settings?.coverageTitle || "America's Largest 5G networks."}
            </h2>
            
            <p className="text-gray-600 text-base leading-relaxed">
              {settings?.coverageDescription || 'Experience the power of our nationwide 5G network. With coverage in 99% of the United States, you\'ll stay connected whether you\'re in the city or exploring the great outdoors.'}
            </p>
            
            {/* Statistics Cards */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">
                  {settings?.coverageStat1Number || '98%'}
                </div>
                <div className="text-gray-900 font-medium mb-1">
                  {settings?.coverageStat1Title || 'Population Coverage'}
                </div>
                <div className="text-gray-600 text-sm">
                  {settings?.coverageStat1Desc || 'Reliable signal where you live and work'}
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">
                  {settings?.coverageStat2Number || '300+'}
                </div>
                <div className="text-gray-900 font-medium mb-1">
                  {settings?.coverageStat2Title || 'Cities'}
                </div>
                <div className="text-gray-600 text-sm">
                  {settings?.coverageStat2Desc || '5G available in major metropolitan areas'}
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium" asChild>
              <Link to={settings?.coverageButtonUrl || '/coverage'}>
                {settings?.coverageButtonText || 'Check Network Coverage'}
              </Link>
            </Button>
          </div>

          {/* Right Column - Image or Default Map */}
          <div className="flex flex-col items-center lg:items-end">
            <div className="relative mb-4">
              {settings?.coverageImageUrl ? (
                <img 
                  src={settings.coverageImageUrl}
                  alt="Network Coverage Map"
                  className="w-96 h-72 object-cover rounded-lg shadow-xl"
                />
              ) : (
                <>
                  {/* Enhanced USA Map Silhouette with 5G Text */}
                  <div className="w-96 h-72 bg-primary rounded-lg flex items-center justify-center shadow-xl relative overflow-hidden">
                    {/* USA Map Shape Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <svg viewBox="0 0 400 300" className="w-full h-full">
                        {/* Simplified USA outline */}
                        <path 
                          d="M50 150 C50 120, 80 100, 120 110 L180 105 C220 100, 260 95, 300 100 L340 110 C360 120, 370 140, 365 160 L360 180 C355 200, 340 215, 320 220 L280 225 C240 230, 200 235, 160 230 L120 225 C80 220, 55 190, 50 150 Z" 
                          fill="rgba(255,255,255,0.3)" 
                          stroke="rgba(255,255,255,0.5)" 
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    
                    <div className="text-white text-7xl font-bold tracking-wider relative z-10">
                      5G
                    </div>
                    
                    {/* Coverage dots pattern */}
                    <div className="absolute inset-0 z-5">
                      <div className="absolute top-16 left-20 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                      <div className="absolute top-24 left-32 w-2 h-2 bg-white/60 rounded-full animate-pulse delay-100"></div>
                      <div className="absolute top-20 right-24 w-2 h-2 bg-white/60 rounded-full animate-pulse delay-200"></div>
                      <div className="absolute bottom-20 left-28 w-2 h-2 bg-white/60 rounded-full animate-pulse delay-300"></div>
                      <div className="absolute bottom-24 right-20 w-2 h-2 bg-white/60 rounded-full animate-pulse delay-400"></div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Enhanced shadow/glow effect */}
              <div className="absolute inset-0 bg-primary/30 rounded-lg blur-2xl -z-10 scale-110"></div>
            </div>
            
            {/* Disclaimer */}
            <p className="text-gray-500 text-sm text-center lg:text-right">
              {settings?.coverageImageUrl ? 'Custom coverage map' : 'Image does not depict coverage'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FigmaCoverageSection;