import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'react-router-dom';

const FigmaHeroSection = () => {
  const { t } = useTranslation();

  const planOffers = [
    { data: '5GB', price: '$20' },
    { data: '5GB', price: '$20' },
    { data: '5GB', price: '$20' },
    { data: '5GB', price: '$20' }
  ];

  return (
    <section className="hero-gradient py-16 md:py-24 relative overflow-hidden">
      {/* Subtle wave shape at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-white transform -skew-y-1 origin-bottom-left"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">
          
          {/* Left Column */}
          <div className="text-white space-y-8 slide-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide">
              Even more data!
            </h1>
            
            {/* Plan Offers Pills */}
            <div className="flex flex-wrap gap-4 justify-start">
              {planOffers.map((offer, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-4 text-center min-w-[120px] md:min-w-[150px] hover-lift"
                >
                  <div className="text-primary text-xl md:text-2xl font-bold">
                    {offer.data}
                  </div>
                  <div className="text-black text-lg md:text-xl font-bold">
                    {offer.price}
                  </div>
                </div>
              ))}
            </div>
            
            {/* CTA Button */}
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-black text-white hover:bg-gray-800 rounded-lg px-8 py-6 text-lg font-medium"
              asChild
            >
              <Link to="/plans">
                See Plans
              </Link>
            </Button>
          </div>

          {/* Right Column - Woman with Phone Image */}
          <div className="flex justify-center lg:justify-end fade-in">
            <img
              src="/lovable-uploads/abb5ee4d-66fd-40a4-8c6f-899521b74171.png"
              alt="Woman holding phone - Dynamo Wireless"
              loading="lazy"
              className="max-w-md w-full h-auto object-contain"
              style={{ height: '500px', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FigmaHeroSection;