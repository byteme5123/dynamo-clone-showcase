import { Button } from '@/components/ui/button';
import { MapPin, Signal } from 'lucide-react';
import coverageMapImage from '@/assets/5g-coverage-map.jpg';

const CoverageSection = () => {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Signal className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                5G Coverage Map
              </h2>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Experience the power of our nationwide 5G network. With coverage in 99% of the United States, 
              you'll stay connected whether you're in the city or exploring the great outdoors.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background rounded-lg p-6 space-y-2">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="font-semibold text-foreground">Population Coverage</div>
                <div className="text-sm text-muted-foreground">
                  Reliable signal where you live and work
                </div>
              </div>
              <div className="bg-background rounded-lg p-6 space-y-2">
                <div className="text-2xl font-bold text-primary">300+</div>
                <div className="font-semibold text-foreground">Cities</div>
                <div className="text-sm text-muted-foreground">
                  5G available in major metropolitan areas
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button variant="cta" size="lg" className="hover-lift">
                <MapPin className="w-4 h-4 mr-2" />
                Check Coverage in Your Area
              </Button>
              <p className="text-sm text-muted-foreground">
                Enter your ZIP code to see detailed coverage information
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src={coverageMapImage}
                alt="5G Coverage Map"
                className="w-full max-w-lg h-auto object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur rounded-lg p-4 text-center">
                  <Signal className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-bold text-secondary">5G Coverage</div>
                  <div className="text-sm text-muted-foreground">Nationwide Network</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverageSection;